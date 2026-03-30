<?php
// =============================================
// bookings.php — full CRUD for bookings
//
// PUBLIC:
//   POST   ?action=create          Submit a booking
//   GET    ?action=unavailable     Get unavailable dates (for calendar)
//
// ADMIN (session required):
//   GET    ?action=list            All bookings (supports sort & filter)
//   PUT    ?action=update&id=N     Update status / archive
//   DELETE ?action=delete&id=N    Delete booking permanently
// =============================================

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// =============================================
// PUBLIC: Submit a booking
// =============================================
if ($action === 'create' && $method === 'POST') {
    $body = request_body();

    $date            = $body['date'] ?? '';
    $name            = trim($body['name'] ?? '');
    $email           = trim($body['email'] ?? '');
    $additional_info = trim($body['additionalInfo'] ?? '');

    // Validation
    if ($date === '' || $name === '' || $email === '') {
        json_error('Date, name and email are required');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('Invalid email address');
    }
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        json_error('Date must be YYYY-MM-DD');
    }
    $parsed = DateTime::createFromFormat('Y-m-d', $date);
    if (!$parsed || $parsed->format('Y-m-d') !== $date) {
        json_error('Invalid date');
    }

    $db = get_db();

    // Check if date is blocked
    $stmt = $db->prepare('SELECT id FROM blocked_dates WHERE blocked_date = ?');
    $stmt->execute([$date]);
    if ($stmt->fetch()) {
        json_error('This date is not available for booking');
    }

    // Check if date already has an approved booking
    $stmt = $db->prepare(
        "SELECT id FROM bookings WHERE booking_date = ? AND status = 'approved' AND is_archived = 0"
    );
    $stmt->execute([$date]);
    if ($stmt->fetch()) {
        json_error('This date is already booked');
    }

    $stmt = $db->prepare(
        'INSERT INTO bookings (booking_date, name, email, additional_info)
         VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([$date, $name, $email, $additional_info]);
    $id = $db->lastInsertId();

    json_response(['success' => true, 'id' => (int)$id], 201);
}

// =============================================
// PUBLIC: Get unavailable dates for calendar
// =============================================
if ($action === 'unavailable' && $method === 'GET') {
    $db = get_db();

    // Blocked by admin
    $blocked = $db->query('SELECT blocked_date FROM blocked_dates')->fetchAll(PDO::FETCH_COLUMN);

    // Approved bookings
    $approved = $db->query(
        "SELECT booking_date FROM bookings WHERE status = 'approved' AND is_archived = 0"
    )->fetchAll(PDO::FETCH_COLUMN);

    $all = array_values(array_unique(array_merge($blocked, $approved)));

    json_response(['unavailable' => $all]);
}

// =============================================
// ADMIN: List bookings (with sort & filter)
// =============================================
if ($action === 'list' && $method === 'GET') {
    require_auth();
    $db = get_db();

    $where   = [];
    $params  = [];

    // Filter by status
    $status = $_GET['status'] ?? '';
    if (in_array($status, ['pending', 'approved', 'declined'], true)) {
        $where[]  = 'status = ?';
        $params[] = $status;
    }

    // Filter by archived
    $archived = $_GET['archived'] ?? '0';
    $where[]  = 'is_archived = ?';
    $params[] = $archived === '1' ? 1 : 0;

    // Filter by date range
    $from = $_GET['from'] ?? '';
    $to   = $_GET['to']   ?? '';
    if ($from !== '') { $where[] = 'booking_date >= ?'; $params[] = $from; }
    if ($to   !== '') { $where[] = 'booking_date <= ?'; $params[] = $to;   }

    // Sort
    $sort_col = $_GET['sort'] ?? 'submitted_at';
    $sort_dir = strtoupper($_GET['dir'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';
    $allowed_sort = ['booking_date', 'name', 'email', 'status', 'submitted_at'];
    if (!in_array($sort_col, $allowed_sort, true)) $sort_col = 'submitted_at';

    $sql = 'SELECT * FROM bookings';
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
    $sql .= " ORDER BY $sort_col $sort_dir";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $bookings = $stmt->fetchAll();

    // Cast types
    foreach ($bookings as &$b) {
        $b['id']          = (int)$b['id'];
        $b['is_archived'] = (bool)$b['is_archived'];
    }

    json_response(['bookings' => $bookings]);
}

// =============================================
// ADMIN: Update booking (status / archive)
// =============================================
if ($action === 'update' && $method === 'PUT') {
    require_auth();
    $id   = (int)($_GET['id'] ?? 0);
    $body = request_body();
    $db   = get_db();

    if ($id <= 0) json_error('Invalid id');

    $stmt = $db->prepare('SELECT id FROM bookings WHERE id = ?');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) json_error('Booking not found', 404);

    $fields = [];
    $params = [];

    if (isset($body['status'])) {
        if (!in_array($body['status'], ['pending', 'approved', 'declined'], true)) {
            json_error('Invalid status');
        }
        $fields[] = 'status = ?';
        $params[] = $body['status'];
    }

    if (isset($body['is_archived'])) {
        $fields[] = 'is_archived = ?';
        $params[] = $body['is_archived'] ? 1 : 0;
    }

    if (isset($body['name']))            { $fields[] = 'name = ?';            $params[] = trim($body['name']); }
    if (isset($body['email']))           { $fields[] = 'email = ?';           $params[] = trim($body['email']); }
    if (isset($body['additional_info'])) { $fields[] = 'additional_info = ?'; $params[] = trim($body['additional_info']); }
    if (isset($body['booking_date']))    { $fields[] = 'booking_date = ?';    $params[] = $body['booking_date']; }

    if (empty($fields)) json_error('Nothing to update');

    $params[] = $id;
    $stmt = $db->prepare('UPDATE bookings SET ' . implode(', ', $fields) . ' WHERE id = ?');
    $stmt->execute($params);

    json_response(['success' => true]);
}

// =============================================
// ADMIN: Delete booking
// =============================================
if ($action === 'delete' && $method === 'DELETE') {
    require_auth();
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) json_error('Invalid id');

    $db   = get_db();
    $stmt = $db->prepare('DELETE FROM bookings WHERE id = ?');
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) json_error('Booking not found', 404);

    json_response(['success' => true]);
}

json_error('Invalid action or method', 405);
