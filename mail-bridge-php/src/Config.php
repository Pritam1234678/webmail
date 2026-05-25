<?php

final class Config
{
    public const APP_NAME = 'Codecoder Mail API';
    public const SESSION_NAME = 'codecoder_mail_session';
    public const COOKIE_SECURE = true;
    public const COOKIE_SAMESITE = 'None';

    public const IMAP_HOST = '127.0.0.1';
    public const IMAP_PORT = 143;
    public const IMAP_TIMEOUT = 15;
    public const IMAP_USE_STARTTLS = false;

    public const SENDMAIL_PATH = '/usr/sbin/sendmail';

    public const ALLOWED_MAILBOXES = [
        'support' => 'support@codecoder.in',
        'noreply' => 'noreply@codecoder.in',
    ];

    public const FOLDER_MAP = [
        'inbox' => 'INBOX',
        'sent' => 'Sent',
        'drafts' => 'Drafts',
        'spam' => 'Junk',
        'trash' => 'Trash', 'archive' => 'Archive',
    ];
}
