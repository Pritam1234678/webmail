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

    public function getMessageCount(string $folderName): int
    {
        try {
            $response = $this->execute('STATUS ' . $this->quote($folderName) . ' (MESSAGES)');
            foreach ($response['untagged'] as $line) {
                if (preg_match('/\* STATUS .*? \(MESSAGES (\d+)\)/i', $line, $matches)) {
                    return (int)$matches[1];
                }
            }
        } catch (Throwable $e) {
            // Folder might not exist yet
        }
        return 0;
    }

    public function getUnreadCount(string $folderName): int
    {
        try {
            $response = $this->execute('STATUS ' . $this->quote($folderName) . ' (UNSEEN)');
            foreach ($response['untagged'] as $line) {
                if (preg_match('/\* STATUS .*? \(UNSEEN (\d+)\)/i', $line, $matches)) {
                    return (int)$matches[1];
                }
            }
        } catch (Throwable $e) {
            // Folder might not exist yet
        }
        return 0;
    }

    public function selectMailbox(string $folderName): void
    {
        $this->executeSimple('SELECT ' . $this->quote($folderName));
    }

    public function searchUids(int $limit = 30, string $query = ''): array
    {
        $command = 'UID SEARCH ALL';
        if ($query !== '') {
            $safeQuery = $this->quote($query);
            $command = "UID SEARCH OR SUBJECT {$safeQuery} FROM {$safeQuery}";
        }

        $response = $this->execute($command);
        $uids = [];

        foreach ($response['untagged'] as $line) {
            if (preg_match('/^\* SEARCH(.*)$/i', trim($line), $matches)) {
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

    public function appendMessage(string $folderName, string $message): void
    {
        $tag = 'A' . str_pad((string) ++$this->tagCounter, 4, '0', STR_PAD_LEFT);
        $safeFolder = $this->quote($folderName);
        $length = strlen($message);
        
        fwrite($this->stream, "{$tag} APPEND {$safeFolder} (\\Seen) {{$length}}\r\n");
        
        $response = $this->readLine();
        if ($response === null || strpos($response, '+') !== 0) {
            throw new RuntimeException('IMAP append rejected literal');
        }
        
        fwrite($this->stream, $message . "\r\n");
        
        while (($line = $this->readLine()) !== null) {
            if (strpos($line, $tag . ' ') === 0) {
                if (stripos($line, 'OK') === false) {
                    throw new RuntimeException('IMAP append failed');
                }
                return;
            }
        }
        throw new RuntimeException('IMAP connection closed during append');
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
            if ($captureBlocks && preg_match('/^\* \d+ FETCH /i', $line)) {
                $fullResponse = $line;
                while (preg_match('/\{(\d+)\}\r\n$/', $fullResponse, $matches)) {
                    $literalLength = (int) $matches[1];
                    $fullResponse .= $this->readBytes($literalLength);
                    $nextPart = $this->readLine() ?? '';
                    $fullResponse .= $nextPart;
                }
                $blocks[] = $fullResponse;
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

            if (preg_match('/UID (\d+)/i', $block, $matches)) {
                $uid = (int) $matches[1];
            }

            if (preg_match('/RFC822\.SIZE (\d+)/i', $block, $matches)) {
                $size = (int) $matches[1];
            }

            if (preg_match('/FLAGS \((.*?)\)/i', $block, $matches)) {
                $flags = array_values(array_filter(explode(' ', trim($matches[1]))));
            }

            // Extract literals
            if (preg_match_all('/BODY\[(.*?)\] \{(\d+)\}\r\n/i', $block, $matches, PREG_OFFSET_CAPTURE)) {
                foreach ($matches[0] as $index => $match) {
                    $partName = strtoupper($matches[1][$index][0]);
                    $length = (int) $matches[2][$index][0];
                    $start = $match[1] + strlen($match[0]);
                    $content = substr($block, $start, $length);

                    if (str_contains($partName, 'HEADER')) {
                        $rawHeader = $content;
                    } elseif (str_contains($partName, 'TEXT') || $partName === '') {
                        $rawBody = $content;
                    }
                }
            }

            if (!$rawHeader && preg_match('/\r\n(From: .*?)\)\r\n$/si', $block, $matches)) {
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
                'body' => $this->extractMessageBody($rawHeader, $rawBody),
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

    private function extractMessageBody(string $rawHeader, string $rawBody): ?string
    {
        if (!$rawBody) {
            return null;
        }

        $headers = $this->parseHeaders($rawHeader);
        $contentType = $headers['content-type'] ?? 'text/plain';
        $encoding = strtolower($headers['content-transfer-encoding'] ?? '');

        $parsed = $this->parseMimePart($contentType, $encoding, $rawBody);
        
        if ($parsed['html'] !== '') {
            return trim($parsed['html']);
        }
        
        if ($parsed['text'] !== '') {
            return nl2br(htmlspecialchars(trim($parsed['text'])));
        }

        return nl2br(htmlspecialchars(trim($rawBody)));
    }

    private function parseMimePart(string $contentType, string $encoding, string $body): array
    {
        $html = '';
        $text = '';

        if (stripos($contentType, 'multipart/') === false) {
            $decoded = $this->decodeString($body, $encoding);
            if (stripos($contentType, 'text/html') !== false) {
                $html = $decoded;
            } else {
                $text = $decoded;
            }
            return ['html' => $html, 'text' => $text];
        }

        if (preg_match('/boundary="?([^";\s]+)"?/i', $contentType, $matches)) {
            $boundary = $matches[1];
            $parts = explode('--' . $boundary, $body);

            foreach ($parts as $part) {
                $part = preg_replace('/^\r?\n/', '', $part);
                if ($part === '' || $part === '--' || strpos($part, "--\r\n") === 0) continue;

                $split = preg_split("/\r\n\r\n|\n\n/", $part, 2);
                if (count($split) !== 2) continue;

                $partHeaders = $this->parseHeaders($split[0]);
                $partType = $partHeaders['content-type'] ?? 'text/plain';
                $partEncoding = strtolower($partHeaders['content-transfer-encoding'] ?? '');
                
                $result = $this->parseMimePart($partType, $partEncoding, $split[1]);
                if ($result['html'] !== '') $html = $result['html'];
                if ($result['text'] !== '' && $text === '') $text = $result['text'];
            }
        }

        return ['html' => $html, 'text' => $text];
    }

    private function decodeString(string $data, string $encoding): string
    {
        if (strpos($encoding, 'quoted-printable') !== false) {
            return quoted_printable_decode($data);
        }
        if (strpos($encoding, 'base64') !== false) {
            return base64_decode(trim($data));
        }
        return $data;
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
