<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../src/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

// Strip /api prefix for routing consistency
$path = preg_replace('#^/api#', '', $path);

$mailService = new MailService();
$sendService = new SendService();

function readJsonBody(): array
{
    $raw = file_get_contents('php://input');
    return ($raw === false || $raw === '') ? [] : (json_decode($raw, true) ?: []);
}

try {
    if ($method === 'POST' && $path === '/v1/auth/session') {
        $payload = readJsonBody();
        $username = trim((string)($payload['username'] ?? ''));
        $password = (string)($payload['password'] ?? '');
        $user = $mailService->authenticate($username, $password);
        $_SESSION['imap_password'] = $password;
        SessionAuth::login($user['userId'], $user['email']);
        Response::json(['ok' => true, 'session' => $user]);
    }

    if ($method === 'DELETE' && $path === '/v1/auth/session') {
        SessionAuth::logout();
        Response::noContent();
    }

    if ($method === 'GET' && $path === '/v1/auth/session') {
        $user = SessionAuth::user();
        Response::json(['ok' => (bool)$user, 'session' => $user], $user ? 200 : 401);
    }

    if ($method === 'GET' && $path === '/v1/auth/me') {
        Response::json(['ok' => true, 'user' => SessionAuth::requireUser()]);
    }

    if ($method === 'GET' && $path === '/v1/mailboxes') {
        Response::json(['ok' => true, 'mailboxes' => $mailService->listMailboxes(SessionAuth::requireUser())]);
    }

    if ($method === 'GET' && preg_match('#^/v1/mailboxes/([^/]+)$#', $path, $matches)) {
        $user = SessionAuth::requireUser();
        if ($matches[1] !== $user['mailboxId']) Response::error('Forbidden', 403);
        
        $folder = $_GET['folder'] ?? 'inbox';
        $query = $_GET['q'] ?? '';
        Response::json([
            'ok' => true,
            'mailbox' => $mailService->listMailboxes($user)[0],
            'messages' => $mailService->listMessages($user, $folder, $query),
        ]);
    }

    if ($method === 'GET' && preg_match('#^/v1/messages/(.+)$#', $path, $matches)) {
        $message = $mailService->getMessage(SessionAuth::requireUser(), urldecode($matches[1]));
        if (!$message) Response::error('Message not found', 404);
        Response::json(['ok' => true, 'message' => $message]);
    }

    if ($method === 'POST' && $path === '/v1/messages/send') {
        $result = $sendService->send(SessionAuth::requireUser(), readJsonBody());
        Response::json(['ok' => true] + $result, 202);
    }

    Response::error('Not found', 404);
} catch (RuntimeException $e) {
    Response::error($e->getMessage(), 400);
} catch (Throwable $e) {
    Response::error('Internal server error', 500, ['detail' => $e->getMessage()]);
}
