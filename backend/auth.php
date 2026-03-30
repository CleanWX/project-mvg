<?php
// =============================================
// auth.php
// POST /api/auth.php?action=login   { username, password }
// POST /api/auth.php?action=logout
// GET  /api/auth.php?action=check
// =============================================

require_once __DIR__ . '/config.php';
session_start();

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// ---- CHECK SESSION ----
if ($action === 'check') {
    if (!empty($_SESSION['admin_id'])) {
        json_response(['authenticated' => true, 'username' => $_SESSION['admin_username']]);
    }
    json_response(['authenticated' => false]);
}

// ---- LOGIN ----
if ($action === 'login' && $method === 'POST') {
    $body = request_body();
    $username = trim($body['username'] ?? '');
    $password  = $body['password'] ?? '';

    if ($username === '' || $password === '') {
        json_error('Username and password are required');
    }

    $db = get_db();
    $stmt = $db->prepare('SELECT id, username, password_hash FROM gp_admins WHERE username = ?');
    $stmt->execute([$username]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin['password_hash'])) {
        json_error('Invalid credentials', 401);
    }

    session_regenerate_id(true);
    $_SESSION['admin_id']       = $admin['id'];
    $_SESSION['admin_username'] = $admin['username'];

    json_response(['success' => true, 'username' => $admin['username']]);
}

// ---- LOGOUT ----
if ($action === 'logout' && $method === 'POST') {
    session_destroy();
    json_response(['success' => true]);
}

json_error('Invalid action or method', 405);
