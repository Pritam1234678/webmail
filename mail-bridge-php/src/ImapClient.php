<?php

final class ImapClient
{
    private $stream;
    private int $tagCounter = 0;

    public function connect(): void
    {
        $this->stream = stream_socket_client(
            'tcp://' . Config::IMAP_HOST . ':' . Config::IMAP_PORT,
            $errno,
            $error,
            Config::IMAP_TIMEOUT
        );

        if (!$this->stream) {
            throw new RuntimeException('IMAP connection failed: ' . $error);
        }

        stream_set_timeout($this->stream, Config::IMAP_TIMEOUT);
        $this->readLine();

        if (Config::IMAP_USE_STARTTLS) {
            $this->executeSimple('STARTTLS');
            if (!stream_socket_enable_crypto($this->stream, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('Unable to enable TLS for IMAP session');
            }
        }
    }

    public function login(string $username, string $password): void
    {
        $safeUser = $this->quote($username);
        $safePass = $this->quote($password);
        $this->executeSimple("LOGIN {$safeUser} {$safePass}");
    }

    public function listMailboxes(): array
    {
        $response = $this->execute('LIST "" "*"');
        $mailboxes = [];

        foreach ($response['untagged'] as $line) {
            if (preg_match('/\* LIST \((.*?)\) "(.*?)" "?([^"]+)"?$/', trim($line), $matches)) {
                $mailboxes[] = $matches[3];
            }
        }

        return $mailboxes;
    }

    public function selectMailbox(string $folderName): void
    {
        $this->executeSimple('SELECT ' . $this->quote($folderName));
    }

    public function searchUids(int $limit = 30): array
    {
        $response = $this->execute('UID SEARCH ALL');
        $uids = [];

        foreach ($response['untagged'] as $line) {
            if (preg_match('/^\* SEARCH(.*)$/', trim($line), $matches)) {
                $uids = array_values(array_filter(explode(' ', trim($matches[1]))));
            }
        }

        $uids = array_map('intval', $uids);
        rsort($uids);

        return array_slice($uids, 0, $limit);
    }

    public function fetchHeaders(array $uids): array
    {
        if (!$uids) {
            return [];
        }

        $set = implode(',', $uids);
        $response = $this->execute("UID FETCH {$set} (UID FLAGS RFC822.SIZE BODY.PEEK[HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID)])", true);
        return $this->parseFetchBlocks($response['blocks']);
    }

    public function fetchMessage(int $uid): ?array
    {
        $response = $this->execute("UID FETCH {$uid} (UID FLAGS RFC822.SIZE BODY.PEEK[HEADER] BODY.PEEK[TEXT])", true);
        $messages = $this->parseFetchBlocks($response['blocks']);
        return $messages[0] ?? null;
    }

    public function logout(): void
    {
        if (is_resource($this->stream)) {
            try {
                $this->executeSimple('LOGOUT');
            } catch (Throwable $e) {
            }
            fclose($this->stream);
        }
    }

    private function executeSimple(string $command): void
    {
        $response = $this->execute($command);
        if (!$response['ok']) {
            throw new RuntimeException('IMAP command failed: ' . $command);
        }
    }

    private function execute(string $command, bool $captureBlocks = false): array
    {
        $tag = 'A' . str_pad((string) ++$this->tagCounter, 4, '0', STR_PAD_LEFT);
        fwrite($this->stream, "{$tag} {$command}\r\n");

        $untagged = [];
        $blocks = [];

        while (($line = $this->readLine()) !== null) {
            if ($captureBlocks && preg_match('/^\* \d+ FETCH .*?\{(\d+)\}\r\n$/', $line, $matches)) {
                $literalLength = (int) $matches[1];
                $literal = $this->readBytes($literalLength);
                $tail = $this->readLine() ?? '';
                $blocks[] = $line . $literal . $tail;
                continue;
            }

            if (strpos($line, $tag . ' ') === 0) {
                return [
                    'ok' => stripos($line, 'OK') !== false,
                    'line' => $line,
                    'untagged' => $untagged,
                    'blocks' => $blocks,
                ];
            }

            $untagged[] = $line;
        }

        throw new RuntimeException('IMAP connection closed unexpectedly');
    }

    private function parseFetchBlocks(array $blocks): array
    {
        $messages = [];

        foreach ($blocks as $block) {
            $uid = null;
            $size = null;
            $flags = [];
            $rawHeader = '';
            $rawBody = '';

            if (preg_match('/UID (\d+)/', $block, $matches)) {
                $uid = (int) $matches[1];
            }

            if (preg_match('/RFC822\.SIZE (\d+)/', $block, $matches)) {
                $size = (int) $matches[1];
            }

            if (preg_match('/FLAGS \((.*?)\)/', $block, $matches)) {
                $flags = array_values(array_filter(explode(' ', trim($matches[1]))));
            }

            if (preg_match('/\{(\d+)\}\r\n(.*)\)\r\n$/s', $block, $matches)) {
                $payload = $matches[2];
                if (stripos($block, 'BODY.PEEK[HEADER') !== false) {
                    $parts = preg_split("/\r\n\r\n/", $payload, 2);
                    $rawHeader = $parts[0] ?? $payload;
                    $rawBody = $parts[1] ?? '';
                }
            }

            if (!$rawHeader && preg_match('/\r\n(From: .*?)\)\r\n$/s', $block, $matches)) {
                $rawHeader = $matches[1];
            }

            $headers = $this->parseHeaders($rawHeader);
            $messages[] = [
                'uid' => $uid,
                'size' => $size,
                'flags' => $flags,
                'unread' => !in_array('\\Seen', $flags, true),
                'starred' => in_array('\\Flagged', $flags, true),
                'subject' => $headers['subject'] ?? '(No subject)',
                'from' => $headers['from'] ?? '',
                'to' => $headers['to'] ?? '',
                'date' => $headers['date'] ?? '',
                'messageId' => $headers['message-id'] ?? '',
                'body' => nl2br(htmlspecialchars(trim($rawBody))),
            ];
        }

        return $messages;
    }

    private function parseHeaders(string $raw): array
    {
        $headers = [];
        $current = null;

        foreach (preg_split("/\r\n/", $raw) as $line) {
            if ($line === '') {
                continue;
            }

            if (preg_match('/^\s+/', $line) && $current) {
                $headers[$current] .= ' ' . trim($line);
                continue;
            }

            [$name, $value] = array_pad(explode(':', $line, 2), 2, '');
            $current = strtolower(trim($name));
            $headers[$current] = trim($value);
        }

        return $headers;
    }

    private function readBytes(int $length): string
    {
        $data = '';
        while (strlen($data) < $length && !feof($this->stream)) {
            $chunk = fread($this->stream, $length - strlen($data));
            if ($chunk === false) {
                break;
            }
            $data .= $chunk;
        }

        return $data;
    }

    private function readLine(): ?string
    {
        $line = fgets($this->stream);
        return $line === false ? null : $line;
    }

    private function quote(string $value): string
    {
        return '"' . addcslashes($value, "\\\"") . '"';
    }
}
