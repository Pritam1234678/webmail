<?php

final class SendService
{
    public function send(array $user, array $payload, array $files = []): array
    {
        $to = trim((string)($payload['to'] ?? ''));
        $subject = trim((string)($payload['subject'] ?? ''));
        $body = trim((string)($payload['body'] ?? ''));

        if ($to === '' || $subject === '' || $body === '') {
            throw new RuntimeException('Missing required fields');
        }

        $from = Config::ALLOWED_MAILBOXES[$user['userId']] ?? $user['email'];
        $cc = trim((string)($payload['cc'] ?? ''));
        $bcc = trim((string)($payload['bcc'] ?? ''));

        $boundary = md5(time());
        
        $headers = [
            'From: ' . $from,
            'Reply-To: ' . $from,
            'MIME-Version: 1.0',
            'Content-Type: multipart/mixed; boundary="' . $boundary . '"',
        ];

        if ($cc !== '') $headers[] = 'Cc: ' . $cc;
        if ($bcc !== '') $headers[] = 'Bcc: ' . $bcc;

        // Build message body with boundary
        $message = "--$boundary\r\n";
        $message .= "Content-Type: text/html; charset=UTF-8\r\n";
        $message .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
        $message .= $body . "\r\n\r\n";

        // Handle Attachments
        if (!empty($files)) {
            // Normalize files array (PHP files array can be tricky)
            $fileCount = is_array($files['name']) ? count($files['name']) : 1;
            for ($i = 0; $i < $fileCount; $i++) {
                $tmpName = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
                $fileName = is_array($files['name']) ? $files['name'][$i] : $files['name'];
                $fileType = is_array($files['type']) ? $files['type'][$i] : $files['type'];

                if (is_uploaded_file($tmpName)) {
                    $content = file_get_contents($tmpName);
                    $encoded = chunk_split(base64_encode($content));
                    
                    $message .= "--$boundary\r\n";
                    $message .= "Content-Type: $fileType; name=\"$fileName\"\r\n";
                    $message .= "Content-Transfer-Encoding: base64\r\n";
                    $message .= "Content-Disposition: attachment; filename=\"$fileName\"\r\n\r\n";
                    $message .= $encoded . "\r\n";
                }
            }
        }
        $message .= "--$boundary--";

        // Send via local sendmail (relayed to Brevo)
        $success = mail($to, $subject, '', implode("\r\n", $headers) . "\r\n" . $message, "-f $from");

        if (!$success) {
            throw new RuntimeException('PHP mail() function failed');
        }

        // Save to Sent folder via IMAP
        try {
            $imap = new ImapClient();
            $imap->connect();
            $imap->login($from, $_SESSION['imap_password']);
            
            $sentFolder = Config::FOLDER_MAP['sent'] ?? 'Sent';
            
            $imapHeaders = [
                'From: ' . $from,
                'To: ' . $to,
                'Subject: ' . $subject,
                'Date: ' . date('r'),
                'Message-ID: <' . bin2hex(random_bytes(16)) . '@codecoder.in>',
                'MIME-Version: 1.0',
                'Content-Type: multipart/mixed; boundary="' . $boundary . '"',
            ];
            if ($cc !== '') $imapHeaders[] = 'Cc: ' . $cc;

            $rawMessage = implode("\r\n", $imapHeaders) . "\r\n\r\n" . $message;
            
            $imap->appendMessage($sentFolder, $rawMessage);
            $imap->logout();
        } catch (Throwable $e) {
            error_log("IMAP Sent Append failed: " . $e->getMessage());
        }

        return [
            'queued' => true,
            'id' => 'send_' . time(),
        ];
    }
}
