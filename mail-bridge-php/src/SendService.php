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
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
        ];

        $phpMailHeaders = [
            'From: ' . $from,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
        ];

        if ($cc !== '') {
            $phpMailHeaders[] = 'Cc: ' . $cc;
        }

        $headersString = implode("\n", $phpMailHeaders);

        // Use PHP native mail function for reliability
        $success = mail($to, $subject, $body, $headersString);

        if (!$success) {
            throw new RuntimeException('PHP mail() function failed to send email');
        }

        // Add Date and standard Headers for the IMAP append
        $imapHeaders = [
            'From: ' . $from,
            'To: ' . $to,
            'Subject: ' . $subject,
            'Date: ' . date('r'),
            'Message-ID: <' . bin2hex(random_bytes(16)) . '@codecoder.in>',
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
        ];
        
        if ($cc !== '') {
            $imapHeaders[] = 'Cc: ' . $cc;
        }

        try {
            $imap = new ImapClient();
            $imap->connect();
            // Using session password that was saved during auth
            $imap->login($user['userId'], $_SESSION['imap_password']);
            
            $sentFolder = Config::FOLDER_MAP['sent'] ?? 'Sent';
            $rawMessage = implode("\r\n", $imapHeaders) . "\r\n\r\n" . $body;
            
            $imap->appendMessage($sentFolder, $rawMessage);
            $imap->logout();
        } catch (Throwable $e) {
            // Ignore if append fails, email was already sent successfully
        }

        return [
            'queued' => true,
            'id' => 'send_' . time(),
        ];
    }
}
