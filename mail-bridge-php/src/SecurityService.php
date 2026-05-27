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
                throw new RuntimeException("Too many failed attempts. IP temporarily blocked. Try again in $wait minutes.");
            } else {
                self::clearAttempts();
            }
        }
    }

    public static function verifyTurnstile(?string $token): void
    {
        if (!$token) {
            throw new RuntimeException('Security verification token missing.');
        }

        $secret = '0x4AAAAAADW9JIobaeU9IYhKahFzO2gh61A';
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';

        $url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        $data = [
            'secret' => $secret,
            'response' => $token,
            'remoteip' => $ip
        ];

        $options = [
            'http' => [
                'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                'method'  => 'POST',
                'content' => http_build_query($data)
            ]
        ];

        $context  = stream_context_create($options);
        $response = file_get_contents($url, false, $context);
        $result = json_decode($response, true);

        if (!$result || !($result['success'] ?? false)) {
            throw new RuntimeException('Security verification failed. Please try again.');
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
