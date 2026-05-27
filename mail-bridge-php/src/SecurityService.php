<?php

final class SecurityService
{
    private static function getDb(): PDO
    {
        return new PDO(
            'mysql:host=127.0.0.1;dbname=mailserver;charset=utf8mb4',
            'mailuser',
            'mailuserpass',
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    }

    public static function checkIpBlock(): void
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $db = self::getDb();
        
        $stmt = $db->prepare("SELECT attempts, last_attempt FROM login_attempts WHERE ip_address = ?");
        $stmt->execute([$ip]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row && $row['attempts'] >= 5) {
            $lastTime = strtotime($row['last_attempt']);
            $diff = time() - $lastTime;
            
            if ($diff < 900) { // 15 minutes lockout
                $wait = ceil((900 - $diff) / 60);
                throw new RuntimeException("Too many failed attempts. Your IP is temporarily blocked. Please try again in $wait minutes.");
            } else {
                // Time passed, reset for another chance
                self::clearAttempts();
            }
        }
    }

    public static function registerFailure(): void
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $db = self::getDb();
        $db->prepare("INSERT INTO login_attempts (ip_address, attempts) VALUES (?, 1) 
                      ON DUPLICATE KEY UPDATE attempts = attempts + 1, last_attempt = CURRENT_TIMESTAMP")
           ->execute([$ip]);
    }

    public static function clearAttempts(): void
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $db = self::getDb();
        $db->prepare("DELETE FROM login_attempts WHERE ip_address = ?")->execute([$ip]);
    }
}
