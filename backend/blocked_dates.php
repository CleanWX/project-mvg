<?php
// =============================================
// blocked_dates.php
//
// ADMIN (session required):
//   GET    ?action=list             List all blocked dates
//   POST   ?action=block            Block a date  { date }
//   DELETE ?action=unblock&id=N     Unblock a date
// =============================================

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// ---- List ----
if ($action === 'list' && $method === 'GET') {
    require_auth();
    $db   = get_db();
    $rows = $db->query(
        'SELECT id, blocked_date, reason, created_at FROM blocked_dates ORDER BY blocked_date ASC'
    )->fetchAll();
    json_response(['blocked_dates' => $rows]);
}

// ---- Block a date ----
if ($action === 'block' && $method === 'POST') {
    require_auth();
    $body   = request_body();
    $date   = $body['date']   ?? '';
    $reason = trim($body['reason'] ?? '');

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        json_error('Date must be YYYY-MM-DD');
    }

    $db   = get_db();
    $stmt = $db->prepare(
        'INSERT IGNORE INTO blocked_dates (blocked_date, reason) VALUES (?, ?)'
    );
    $stmt->execute([$date, $reason ?: null]);

    json_response(['success' => true, 'id' => (int)$db->lastInsertId()], 201);
}

// ---- Unblock a date ----
if ($action === 'unblock' && $method === 'DELETE') {
    require_auth();
    $id   = (int)($_GET['id'] ?? 0);
    if ($id <= 0) json_error('Invalid id');

    $db   = get_db();
    $stmt = $db->prepare('DELETE FROM blocked_dates WHERE id = ?');
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) json_error('Blocked date not found', 404);

    json_response(['success' => true]);
}

json_error('Invalid action or method', 405);
