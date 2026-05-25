<?php

final class Config
{
    public const APP_NAME    = 'Codecoder Mail API';
    public const SESSION_NAME = 'codecoder_mail_session';

    // Cookie: detect if running over HTTPS (production) or HTTP (localhost dev)
    public static function isHttps(): bool
    {
        return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || ($_SERVER['SERVER_PORT'] ?? 80) == 443
            || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    }

    public static function cookieSecure(): bool
    {
        return self::isHttps();
    }

    public static function cookieSameSite(): string
    {
        // SameSite=None requires Secure — use None on HTTP (localhost dev)
        return self::isHttps() ? 'None' : 'None';
    }

    // Keep constants for legacy compat
    public const COOKIE_SECURE   = true;   // overridden at runtime via methods above
    public const COOKIE_SAMESITE = 'None'; // overridden at runtime via methods above

    public const IMAP_HOST        = '127.0.0.1';
    public const IMAP_PORT        = 143;
    public const IMAP_TIMEOUT     = 8;
    public const IMAP_USE_STARTTLS = false;

    public const SENDMAIL_PATH = '/usr/sbin/sendmail';

    public const ALLOWED_MAILBOXES = [
        'support' => 'support@codecoder.in',
        'noreply' => 'noreply@codecoder.in',
    ];

    public const FOLDER_MAP = [
        'inbox'  => 'INBOX',
        'sent'   => 'Sent',
        'drafts' => 'Drafts',
        'spam'   => 'Junk',
        'trash'  => 'Trash',
    ];
}
