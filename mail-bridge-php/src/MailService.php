<?php

final class MailService
{
    public function authenticate(string $username, string $password): array
    {
        // Find mapping: user might provide 'support' or 'support@codecoder.in'
        $email = null;
        $mailboxId = null;

        foreach (Config::ALLOWED_MAILBOXES as $id => $mappedEmail) {
            if ($username === $id || $username === $mappedEmail) {
                $email = $mappedEmail;
                $mailboxId = $id;
                break;
            }
        }

        if (!$email) {
            throw new RuntimeException('Unknown mailbox: ' . $username);
        }

        $imap = new ImapClient();

        try {
            $imap->connect();
            // Dovecot expects full email as username
            $imap->login($email, $password);
            
            return [
                'userId' => $mailboxId,
                'mailboxId' => $mailboxId,
                'email' => $email,
                'displayName' => ucfirst($mailboxId),
            ];
        } finally {
            $imap->logout();
        }
    }

    private function getConnectedClient(string $mailboxId, string $password): ImapClient
    {
        $email = Config::ALLOWED_MAILBOXES[$mailboxId] ?? null;
        if (!$email) throw new RuntimeException('Invalid mailbox session');

        $imap = new ImapClient();
        $imap->connect();
        $imap->login($email, $password);
        return $imap;
    }

    public function listMailboxes(array $user): array
    {
        $imap = $this->getConnectedClient($user['userId'], $_SESSION['imap_password']);
        try {
            return [
                [
                    'id' => $user['mailboxId'],
                    'email' => $user['email'],
                    'name' => $user['displayName'],
                    'initials' => strtoupper(substr($user['displayName'], 0, 2)),
                    'status' => 'Primary mailbox',
                    'folders' => $this->folderStats($imap),
                ]
            ];
        } finally {
            $imap->logout();
        }
    }

    public function listMessages(array $user, string $folderId, string $query = ''): array
    {
        $folderName = Config::FOLDER_MAP[$folderId] ?? Config::FOLDER_MAP['inbox'];
        $imap = $this->getConnectedClient($user['userId'], $_SESSION['imap_password']);

        try {
            $imap->selectMailbox($folderName);
            $uids = $imap->searchUids(30, $query);
            $headers = $imap->fetchHeaders($uids);

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
        $imap = $this->getConnectedClient($user['userId'], $_SESSION['imap_password']);

        try {
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
            ];
        } finally {
            $imap->logout();
        }
    }

    private function folderStats(ImapClient $imap): array
    {
        $stats = [];
        foreach (Config::FOLDER_MAP as $id => $name) {
            $count = $imap->getMessageCount($name);
            $unread = $imap->getUnreadCount($name);
            $stats[] = [
                'id' => $id,
                'name' => ucfirst($id),
                'count' => $count,
                'unread' => $unread,
                'icon' => $this->getFolderIcon($id),
            ];
        }
        return $stats;
    }

    private function getFolderIcon(string $id): string
    {
        return match($id) {
            'inbox' => 'inbox',
            'sent' => 'send',
            'drafts' => 'file',
            'spam' => 'alert-circle',
            'trash' => 'trash-2',
            default => 'folder',
        };
    }

    private function extractDisplayName(string $from): string
    {
        if (preg_match('/^"?(.*?)"?\s*<.*?>/', $from, $matches)) {
            return $matches[1];
        }
        return explode('@', $from)[0];
    }

    private function extractEmail(string $from): string
    {
        if (preg_match('/<(.*?)>/', $from, $matches)) {
            return $matches[1];
        }
        return $from;
    }

    private function normalizeDate(string $date): string
    {
        $ts = strtotime($date);
        return $ts ? date('c', $ts) : date('c');
    }

    private function decodeMessageId(string $id): array
    {
        return explode('|', base64_decode($id));
    }
}
