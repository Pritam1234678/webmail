<?php

final class SessionAuth
{
    public static function boot(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        session_name(Config::SESSION_NAME);
        session_set_cookie_params([
            'lifetime' => 0,
            'path'     => '/',
            'secure'   => Config::COOKIE_SECURE,
            'httponly' => true,
            'samesite' => Config::COOKIE_SAMESITE,
        ]);

        session_start();
    }

    public static function login(string $username, string $email): void
    {
        $_SESSION['user'] = [
            'userId'      => $username,
            'mailboxId'   => $username,
            'email'       => $email,
            'displayName' => ucfirst($username),
        ];
    }

    public static function logout(): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(), '', time() - 42000,
                $params['path'],
                $params['domain'] ?? '',
                $params['secure'],
                $params['httponly']
            );
        }
        session_destroy();
    }

    public static function user(): ?array
    {
        self::boot();
        return $_SESSION['user'] ?? null;
    }

    public static function requireUser(): array
    {
        $user = self::user();
        if (!$user) {
            Response::error('Unauthorized', 401);
        }
        return $user;
    }

    public static function bootIfNeeded(): void
    {
        self::boot();
    }
}
