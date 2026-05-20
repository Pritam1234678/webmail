<?php

final class SendService
{
    public function send(array $user, array $payload): array
    {
        $to = trim((string) ($payload['to'] ?? ''));
        $subject = trim((string) ($payload['subject'] ?? ''));
        $body = trim((string) ($payload['body'] ?? ''));

        if ($to === '' || $subject === '' || $body === '') {
            throw new RuntimeException('Missing required fields');
        }

        $from = Config::ALLOWED_MAILBOXES[$user['userId']] ?? $user['email'];
        $cc = trim((string) ($payload['cc'] ?? ''));

        $headers = [
            'From: ' . $from,
            'To: ' . $to,
            'Subject: ' . $subject,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
        ];

        if ($cc !== '') {
            $headers[] = 'Cc: ' . $cc;
        }

        $message = implode("\r\n", $headers) . "\r\n\r\n" . $body . "\r\n";

        $descriptors = [
            0 => ['pipe', 'w'],
            1 => ['pipe', 'r'],
            2 => ['pipe', 'r'],
        ];

        $process = proc_open(Config::SENDMAIL_PATH . ' -t -i', $descriptors, $pipes);
        if (!is_resource($process)) {
            throw new RuntimeException('Unable to start sendmail');
        }

        fwrite($pipes[0], $message);
        fclose($pipes[0]);
        $stdout = stream_get_contents($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);

        $exitCode = proc_close($process);
        if ($exitCode !== 0) {
            throw new RuntimeException('Sendmail failed: ' . trim($stderr ?: $stdout));
        }

        return [
            'queued' => true,
            'id' => 'send_' . time(),
        ];
    }
}
