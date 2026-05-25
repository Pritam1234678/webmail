<?php

require_once __DIR__ . '/../src/bootstrap.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = preg_replace('#^/api#', '', $path);

$mailService = new MailService();
$sendService = new SendService();

function readJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

try {
    if ($method === 'POST' && $path === '/v1/auth/session') {
        $payload = readJsonBody();
        $username = trim((string) ($payload['username'] ?? ''));
        $password = (string) ($payload['password'] ?? '');
        $user = $mailService->authenticate($username, $password);
        $_SESSION['imap_password'] = $password;
        SessionAuth::login($user['userId'], $user['email']);
        Response::json(['ok' => true, 'session' => $user]);
    }

    if ($method === 'DELETE' && $path === '/v1/auth/session') {
        SessionAuth::logout();
        Response::noContent();
    }

    // GET /v1/auth/session — check current session status
    if ($method === 'GET' && $path === '/v1/auth/session') {
        $user = SessionAuth::user();
        if ($user) {
            Response::json(['ok' => true, 'session' => $user]);
        } else {
            Response::json(['ok' => false, 'session' => null], 401);
        }
    }

    if ($method === 'GET' && $path === '/v1/auth/me') {
        $user = SessionAuth::requireUser();
        Response::json(['ok' => true, 'user' => $user]);
    }

    if ($method === 'GET' && $path === '/v1/mailboxes') {
        $user = SessionAuth::requireUser();
        Response::json(['ok' => true, 'mailboxes' => $mailService->listMailboxes($user)]);
    }

    if ($method === 'GET' && preg_match('#^/v1/mailboxes/([^/]+)$#', $path, $matches)) {
        $user = SessionAuth::requireUser();
        $mailboxId = $matches[1];
        if ($mailboxId !== $user['mailboxId']) {
            Response::error('Forbidden', 403);
        }

        $folder = $_GET['folder'] ?? 'inbox';
        $query = $_GET['q'] ?? '';
        Response::json([
            'ok' => true,
            'mailbox' => $mailService->listMailboxes($user)[0],
            'messages' => $mailService->listMessages($user, $folder, $query),
        ]);
    }

    if ($method === 'GET' && preg_match('#^/v1/messages/(.+)$#', $path, $matches)) {
        $user = SessionAuth::requireUser();
        $message = $mailService->getMessage($user, $matches[1]);
        if (!$message) {
            Response::error('Message not found', 404);
        }
        Response::json(['ok' => true, 'message' => $message]);
    }

    if ($method === 'POST' && $path === '/v1/messages/send') {
        $user = SessionAuth::requireUser();
        $result = $sendService->send($user, readJsonBody());
        Response::json(['ok' => true] + $result, 202);
    }

    Response::error('Not found', 404);
} catch (RuntimeException $e) {
    Response::error($e->getMessage(), 400);
} catch (Throwable $e) {
    Response::error('Internal server error', 500, ['detail' => $e->getMessage()]);
}
