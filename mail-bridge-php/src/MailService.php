<?php

final class MailService
{
    public function authenticate(string $username, string $password): array
    {
        $email = null; $mailboxId = null;
        foreach (Config::ALLOWED_MAILBOXES as $id => $mappedEmail) {
            if ($username === $id || $username === $mappedEmail) {
                $email = $mappedEmail; $mailboxId = $id; break;
            }
        }
        if (!$email) throw new RuntimeException('Unknown mailbox: ' . $username);
        $imap = new ImapClient();
        try {
            $imap->connect(); $imap->login($email, $password);
            return ['userId' => $mailboxId, 'mailboxId' => $mailboxId, 'email' => $email, 'displayName' => ucfirst($mailboxId)];
        } finally { $imap->logout(); }
    }

    private function getConnectedClient(string $mailboxId, string $password): ImapClient
    {
        $email = Config::ALLOWED_MAILBOXES[$mailboxId] ?? null;
        if (!$email) throw new RuntimeException('Invalid mailbox session');
        $imap = new ImapClient(); $imap->connect(); $imap->login($email, $password);
        return $imap;
    }

    public function listMailboxes(array $user): array
    {
        $imap = $this->getConnectedClient($user['userId'], $_SESSION['imap_password']);
        try {
            return [[
                'id' => $user['mailboxId'], 'email' => $user['email'], 'name' => $user['displayName'],
                'initials' => strtoupper(substr($user['displayName'], 0, 2)), 'status' => 'Primary mailbox',
                'folders' => $this->folderStats($imap),
            ]];
        } finally { $imap->logout(); }
    }

    public function listMessages(array $user, string $folderId, string $query = ''): array
    {
        $folderName = Config::FOLDER_MAP[$folderId] ?? 'INBOX';
        $imap = $this->getConnectedClient($user['userId'], $_SESSION['imap_password']);
        try {
            try { $imap->selectMailbox($folderName); } catch (Throwable $e) { return []; }
            $uids = $imap->searchUids(30, $query);
            $headers = $imap->fetchHeaders($uids);
            return array_map(function (array $message) use ($user, $folderId) {
                $sender = $message['from'] ?: $user['email'];
                return [
                    'id' => base64_encode($user['mailboxId'] . '|' . $folderId . '|' . $message['uid']),
                    'mailboxId' => $user['mailboxId'], 'folder' => $folderId,
                    'senderName' => $this->extractDisplayName($sender), 'senderEmail' => $this->extractEmail($sender),
                    'recipients' => array_filter(array_map('trim', explode(',', $message['to'] ?: ''))), 'subject' => $message['subject'], 'snippet' => '',
                    'timestamp' => $this->normalizeDate($message['date']), 'unread' => $message['unread'],
                    'starred' => $message['starred'], 'tags' => [], 'attachments' => [],
                ];
            }, $headers);
        } finally { $imap->logout(); }
    }

    public function getMessage(array $user, string $messageId): ?array
    {
        [$mailboxId, $folderId, $uid] = explode('|', base64_decode($messageId));
        if ($mailboxId !== $user['mailboxId']) throw new RuntimeException('Mailbox mismatch');
        $folderName = Config::FOLDER_MAP[$folderId] ?? 'INBOX';
        $imap = $this->getConnectedClient($user['userId'], $_SESSION['imap_password']);
        try {
            $imap->selectMailbox($folderName);
            $message = $imap->fetchMessage((int)$uid);
            if (!$message) return null;
            // Mark as seen automatically when fetching detail
            $imap->setFlag((int)$uid, '\\Seen', true);
            $sender = $message['from'] ?: $user['email'];
            return [
                'id' => $messageId, 'mailboxId' => $mailboxId, 'folder' => $folderId,
                'senderName' => $this->extractDisplayName($sender), 'senderEmail' => $this->extractEmail($sender),
                'recipients' => array_filter(array_map('trim', explode(',', $message['to'] ?: ''))), 'subject' => $message['subject'], 'snippet' => '',
                'body' => $message['body'] ?: '<p>(No preview body available)</p>',
                'timestamp' => $this->normalizeDate($message['date']), 'unread' => false,
                'starred' => $message['starred'], 'tags' => [], 'attachments' => [],
            ];
        } finally { $imap->logout(); }
    }

    public function updateMessage(array $user, string $messageId, array $payload): void
    {
        [$mailboxId, $folderId, $uid] = explode('|', base64_decode($messageId));
        $imap = $this->getConnectedClient($user['userId'], $_SESSION['imap_password']);
        try {
            $imap->selectMailbox(Config::FOLDER_MAP[$folderId] ?? 'INBOX');
            if (isset($payload['unread'])) $imap->setFlag((int)$uid, '\\Seen', !$payload['unread']);
            if (isset($payload['starred'])) $imap->setFlag((int)$uid, '\\Flagged', $payload['starred']);
            if (isset($payload['folder']) && $payload['folder'] !== $folderId) {
                $target = Config::FOLDER_MAP[$payload['folder']] ?? null;
                if ($target) $imap->moveMessage((int)$uid, $target);
            }
        } finally { $imap->logout(); }
    }

    public function deleteMessage(array $user, string $messageId): void
    {
        [$mailboxId, $folderId, $uid] = explode('|', base64_decode($messageId));
        $imap = $this->getConnectedClient($user['userId'], $_SESSION['imap_password']);
        try {
            $imap->selectMailbox(Config::FOLDER_MAP[$folderId] ?? 'INBOX');
            $imap->deleteMessage((int)$uid);
        } finally { $imap->logout(); }
    }

    private function folderStats(ImapClient $imap): array
    {
        $stats = [];
        foreach (Config::FOLDER_MAP as $id => $name) {
            $count = $imap->getMessageCount($name);
            $unread = $imap->getUnreadCount($name);
            $stats[] = ['id' => $id, 'name' => ucfirst($id), 'count' => $count, 'unread' => $unread, 'icon' => $this->getFolderIcon($id)];
        }
        return $stats;
    }

    private function getFolderIcon(string $id): string
    {
        return match($id) { 'inbox'=>'inbox', 'sent'=>'send', 'drafts'=>'file', 'spam'=>'alert-circle', 'trash'=>'trash-2', default=>'folder' };
    }

    private function extractDisplayName(string $from): string
    {
        if (preg_match('/^"?(.*?)"?\s*<.*?>/', $from, $matches)) return trim($matches[1]);
        return explode('@', $from)[0];
    }

    private function extractEmail(string $from): string
    {
        if (preg_match('/<(.*?)>/', $from, $matches)) return $matches[1];
        return $from;
    }

    private function normalizeDate(string $date): string
    {
        $ts = strtotime($date); return $ts ? date('c', $ts) : date('c');
    }
}
