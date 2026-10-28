<?php
// ========================================================
// KEDIRI SAFE MAP - USER LOGIN API
// Endpoint Autentikasi Pengguna
// ========================================================

require_once __DIR__ . '/db.php';
if (PHP_SAPI !== 'cli') {
    header('Content-Type: application/json; charset=utf-8');
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Hanya metode POST yang diizinkan']);
    exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);

if (!$payload) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Format payload tidak valid']);
    exit;
}

$email = trim($payload['email'] ?? '');
$pass = trim($payload['password'] ?? '');

if (empty($email) || empty($pass)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email dan kata sandi wajib diisi']);
    exit;
}

if (!$pdo) {
    // Mode offline / fallback
    $seedUsers = [
        ['id' => 1, 'nama' => 'Administrator', 'email' => 'admin@kediri.go.id', 'password' => 'admin123', 'role' => 'admin'],
        ['id' => 2, 'nama' => 'Budi Warga', 'email' => 'budi@gmail.com', 'password' => 'budi123', 'role' => 'user']
    ];
    $found = null;
    foreach ($seedUsers as $u) {
        if (strtolower($u['email']) === strtolower($email)) {
            $found = $u;
            break;
        }
    }
    if (!$found) {
        http_response_code(404);
        echo json_encode(['status' => 'not_found', 'message' => 'Akun belum terdaftar. Silakan Sign Up terlebih dahulu atau Masuk dengan Google.']);
        exit;
    }
    if ($found['password'] !== $pass) {
        http_response_code(401);
        echo json_encode(['status' => 'wrong_password', 'message' => 'Kata sandi tidak sesuai. Silakan periksa kembali.']);
        exit;
    }
    echo json_encode(['status' => 'success', 'user' => $found]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, nama, email, password, role, foto_face, face_verified, face_token FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['status' => 'not_found', 'message' => 'Akun belum terdaftar. Silakan Sign Up terlebih dahulu atau Masuk dengan Google.']);
        exit;
    }

    $passHash = md5($pass);
    if ($user['password'] !== $pass && $user['password'] !== $passHash) {
        http_response_code(401);
        echo json_encode(['status' => 'wrong_password', 'message' => 'Kata sandi salah. Silakan periksa kembali kata sandi Anda.']);
        exit;
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Login berhasil.',
        'user' => [
            'id' => $user['id'],
            'nama' => $user['nama'],
            'email' => $user['email'],
            'role' => $user['role'],
            'foto_face' => $user['foto_face'],
            'face_verified' => (bool)$user['face_verified'],
            'face_token' => $user['face_token']
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Kesalahan server: ' . $e->getMessage()]);
}
