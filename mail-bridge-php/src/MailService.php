<?php

final class MailService
{
    public function authenticate(string $username, string $password): array
    {
        $email = Config::ALLOWED_MAILBOXES[$username] ?? null;
        if (!$email) {
            throw new RuntimeException('Unknown mailbox');
        }

        $imap = new ImapClient();

        try {
            $imap->connect();
            $imap->login($username, $password);
            return [
                'userId' => $username,
                'mailboxId' => $username,
                'email' => $email,
                'displayName' => ucfirst($username),
            ];
        } finally {
            $imap->logout();
        }
    }

    public function listMailboxes(array $user): array
    {
        return [
            [
                'id' => $user['mailboxId'],
                'email' => $user['email'],
                'name' => $user['displayName'],
                'initials' => strtoupper(substr($user['displayName'], 0, 2)),
                'status' => 'Primary mailbox',
                'folders' => $this->folderStats($user['userId']),
            ]
        ];
    }

    public function listMessages(array $user, string $folderId, string $query = ''): array
    {
        $folderName = Config::FOLDER_MAP[$folderId] ?? Config::FOLDER_MAP['inbox'];
        $imap = new ImapClient();

        try {
            $imap->connect();
            $imap->login($user['userId'], $_SESSION['imap_password']);
            $imap->selectMailbox($folderName);
            $headers = $imap->fetchHeaders($imap->searchUids(30));

            $messages = array_map(function (array $message) use ($user, $folderId) {
                $sender = $message['from'] ?: $user['email'];
                return [
                    'id' => base64_encode($user['mailboxId'] . '|' . $folderId . '|' . $message['uid']),
                    'mailboxId' => $user['mailboxId'],
                    'folder' => $folderId,
                    'senderName' => $this->extractDisplayName($sender),
                    'senderEmail' => $this->extractEmail($sender),
                    'recipients' => [$user['email']],
                    'subject' => $message['subject'],
                    'snippet' => '',
                    'timestamp' => $this->normalizeDate($message['date']),
                    'unread' => $message['unread'],
                    'starred' => $message['starred'],
                    'tags' => [],
                    'attachments' => [],
                ];
            }, $headers);

            if ($query !== '') {
                $q = strtolower($query);
                $messages = array_values(array_filter($messages, function (array $message) use ($q) {
                    return str_contains(strtolower($message['senderName'] . ' ' . $message['senderEmail'] . ' ' . $message['subject']), $q);
                }));
            }

            return $messages;
        } finally {
            $imap->logout();
        }
    }

    public function getMessage(array $user, string $messageId): ?array
    {
        [$mailboxId, $folderId, $uid] = $this->decodeMessageId($messageId);
        if ($mailboxId !== $user['mailboxId']) {
            throw new RuntimeException('Mailbox mismatch');
        }

        $folderName = Config::FOLDER_MAP[$folderId] ?? Config::FOLDER_MAP['inbox'];
        $imap = new ImapClient();

        try {
            $imap->connect();
            $imap->login($user['userId'], $_SESSION['imap_password']);
            $imap->selectMailbox($folderName);
            $message = $imap->fetchMessage((int) $uid);

            if (!$message) {
                return null;
            }

            $sender = $message['from'] ?: $user['email'];

            return [
                'id' => $messageId,
                'mailboxId' => $mailboxId,
                'folder' => $folderId,
                'senderName' => $this->extractDisplayName($sender),
                'senderEmail' => $this->extractEmail($sender),
                'recipients' => [$user['email']],
                'subject' => $message['subject'],
                'snippet' => '',
                'body' => $message['body'] ?: '<p>(No preview body available)</p>',
                'timestamp' => $this->normalizeDate($message['date']),
                'unread' => $message['unread'],
                'starred' => $message['starred'],
                'tags' => [],
                'attachments' => [],
                'thread' => [],
            ];
        } finally {
            $imap->logout();
        }
    }

    private function folderStats(string $username): array
    {
        $imap = new ImapClient();
        $folders = [];

        try {
            $imap->connect();
            $imap->login($username, $_SESSION['imap_password']);

            foreach (Config::FOLDER_MAP as $id => $imapName) {
                try {
                    $imap->selectMailbox($imapName);
                    $count = count($imap->searchUids(200));
                } catch (Throwable $e) {
                    $count = 0;
                }

                $folders[] = [
                    'id' => $id,
                    'label' => ucfirst($id),
                    'hint' => match ($id) {
                        'inbox' => 'Priority mail',
                        'sent' => 'Delivered mail',
                        'drafts' => 'Saved for later',
                        'spam' => 'Filtered mail',
                        'trash' => 'Deleted items',
                        default => '',
                    },
                    'count' => $count,
                    'icon' => substr($id, 0, 2),
                ];
            }
        } finally {
            $imap->logout();
        }

        return $folders;
    }

    private function decodeMessageId(string $messageId): array
    {
        $decoded = base64_decode($messageId, true);
        if (!$decoded) {
            throw new RuntimeException('Invalid message id');
        }

        $parts = explode('|', $decoded);
        if (count($parts) !== 3) {
            throw new RuntimeException('Invalid message id');
        }

        return $parts;
    }

    private function extractDisplayName(string $raw): string
    {
        if (preg_match('/^(.*?)\s*<.*>$/', $raw, $matches)) {
            return trim($matches[1], "\"' ") ?: $this->extractEmail($raw);
        }

        return $this->extractEmail($raw);
    }

    private function extractEmail(string $raw): string
    {
        if (preg_match('/<([^>]+)>/', $raw, $matches)) {
            return trim($matches[1]);
        }

        return trim($raw);
    }

    private function normalizeDate(string $date): string
    {
        $timestamp = strtotime($date);
        return $timestamp ? gmdate('c', $timestamp) : gmdate('c');
    }
}
