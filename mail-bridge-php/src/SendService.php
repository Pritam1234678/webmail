<?php

final class SendService
{
    public function send(array $user, array $payload): array
    {
        $to = trim((string)($payload['to'] ?? ''));
        $subject = trim((string)($payload['subject'] ?? ''));
        $body = trim((string)($payload['body'] ?? ''));

        if ($to === '' || $subject === '' || $body === '') {
            throw new RuntimeException('Missing required fields');
        }

        $from = Config::ALLOWED_MAILBOXES[$user['userId']] ?? $user['email'];
        $cc = trim((string)($payload['cc'] ?? ''));

        $phpMailHeaders = [
            'From: ' . $from,
            'Reply-To: ' . $from,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
        ];

        if ($cc !== '') {
            $phpMailHeaders[] = 'Cc: ' . $cc;
        }

        $headersString = implode("\r\n", $phpMailHeaders);

        // Send via local sendmail (which Postfix relays to Brevo)
        // Use -f to set envelope sender for better relay compatibility
        $success = mail($to, $subject, $body, $headersString, "-f $from");

        if (!$success) {
            throw new RuntimeException('PHP mail() function failed');
        }

        // Save to Sent folder via IMAP
        try {
            $imap = new ImapClient();
            $imap->connect();
            // Crucial: Use full email for Dovecot login
            $imap->login($from, $_SESSION['imap_password']);
            
            $sentFolder = Config::FOLDER_MAP['sent'] ?? 'Sent';
            
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

            $rawMessage = implode("\r\n", $imapHeaders) . "\r\n\r\n" . $body;
            
            $imap->appendMessage($sentFolder, $rawMessage);
            $imap->logout();
        } catch (Throwable $e) {
            // Log but don't fail the request since mail was already sent
            error_log("IMAP Sent Append failed: " . $e->getMessage());
        }

        return [
            'queued' => true,
            'id' => 'send_' . time(),
        ];
    }
}
