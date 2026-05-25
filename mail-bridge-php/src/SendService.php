<?php

final class SendService
{
    public function send(array $user, array $payload, array $files = []): array
    {
        $to = trim((string)($payload['to'] ?? ''));
        $subject = trim((string)($payload['subject'] ?? ''));
        $body = trim((string)($payload['body'] ?? ''));

        if ($to === '') throw new RuntimeException('Recipient (To) is required');
        if ($subject === '') throw new RuntimeException('Subject is required');
        if ($body === '') throw new RuntimeException('Body is required');

        $from = Config::ALLOWED_MAILBOXES[$user['userId']] ?? $user['email'];
        $cc = trim((string)($payload['cc'] ?? ''));
        $bcc = trim((string)($payload['bcc'] ?? ''));

        $boundary = md5(uniqid((string)time()));
        
        $headers = [
            'From: ' . $from,
            'Reply-To: ' . $from,
            'X-Mailer: CodeCoder Webmail',
            'MIME-Version: 1.0',
            'Content-Type: multipart/mixed; boundary="' . $boundary . '"',
        ];

        if ($cc !== '') $headers[] = 'Cc: ' . $cc;
        if ($bcc !== '') $headers[] = 'Bcc: ' . $bcc;

        // Message Body
        $messageBody = "--$boundary\r\n";
        $messageBody .= "Content-Type: text/html; charset=UTF-8\r\n";
        $messageBody .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
        $messageBody .= $body . "\r\n\r\n";

        // Attachments
        if (!empty($files) && isset($files['name'])) {
            $fileCount = is_array($files['name']) ? count($files['name']) : 1;
            for ($i = 0; $i < $fileCount; $i++) {
                $tmpName = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
                $fileName = is_array($files['name']) ? $files['name'][$i] : $files['name'];
                $fileType = is_array($files['type']) ? $files['type'][$i] : $files['type'];

                if (is_uploaded_file($tmpName)) {
                    $content = file_get_contents($tmpName);
                    $encoded = chunk_split(base64_encode($content));
                    
                    $messageBody .= "--$boundary\r\n";
                    $messageBody .= "Content-Type: $fileType; name=\"$fileName\"\r\n";
                    $messageBody .= "Content-Transfer-Encoding: base64\r\n";
                    $messageBody .= "Content-Disposition: attachment; filename=\"$fileName\"\r\n\r\n";
                    $messageBody .= $encoded . "\r\n";
                }
            }
        }
        $messageBody .= "--$boundary--";

        // PHP mail() function: 3rd param is body, 4th is headers.
        // Use PHP_EOL for header separation to avoid "malformed newlines" warnings
        $headersString = implode("\r\n", $headers);
        $success = mail($to, $subject, $messageBody, $headersString, "-f $from");

        if (!$success) {
            throw new RuntimeException('System mail function failed to queue message');
        }

        // Save to Sent folder via IMAP
        try {
            $imap = new ImapClient();
            $imap->connect();
            $imap->login($from, $_SESSION['imap_password'] ?? '');
            
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

            $rawMessage = implode("\r\n", $imapHeaders) . "\r\n\r\n" . $messageBody;
            
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
