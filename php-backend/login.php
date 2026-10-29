<?php
// ========================================================
// KEDIRI SAFE MAP - USER LOGIN API
// Endpoint Autentikasi Pengguna (Anti SQL Injection)
// ========================================================

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/security.php';

if (PHP_SAPI !== 'cli') {
    header('Content-Type: application/json; charset=utf-8');
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method !== 'POST') {
    jsonError(405, 'Hanya metode POST yang diizinkan');
}

// Rate limit: max 10 percobaan login per IP per menit
rateLimit('login', 10, 60);

$raw     = file_get_contents('php://input');
$payload = json_decode($raw, true);

if (!is_array($payload)) {
    jsonError(400, 'Format payload tidak valid');
}

// ---- Ambil & validasi input ----
$email = trim($payload['email'] ?? '');
$pass  = trim($payload['password'] ?? '');

if (empty($email) || empty($pass)) {
    jsonError(400, 'Email dan kata sandi wajib diisi');
}

if (!validateEmail($email)) {
    jsonError(422, 'Format email tidak valid', 'email');
}

if (!validatePassword($pass)) {
    jsonError(422, 'Kata sandi minimal 6 karakter', 'password');
}

// ---- Mode offline / fallback (tanpa DB) ----
if (!$pdo) {
    $seedUsers = [
        ['id' => 1, 'nama' => 'Administrator', 'email' => 'admin@kediri.go.id', 'password' => 'admin123', 'role' => 'admin'],
        ['id' => 2, 'nama' => 'Budi Warga',    'email' => 'budi@gmail.com',     'password' => 'budi123',  'role' => 'user']
    ];
    $found = null;
    foreach ($seedUsers as $u) {
        if (strtolower($u['email']) === strtolower($email)) {
            $found = $u;
            break;
        }
    }
    if (!$found) {
        jsonError(404, 'Akun belum terdaftar. Silakan Sign Up terlebih dahulu.');
    }
    if (!verifyPassword($pass, $found['password'])) {
        jsonError(401, 'Kata sandi tidak sesuai. Silakan periksa kembali.');
    }
    unset($found['password']);
    echo json_encode(['status' => 'success', 'user' => $found], JSON_UNESCAPED_UNICODE);
    exit;
}

// ---- Query dengan Prepared Statement (100% safe dari SQL Injection) ----
try {
    $stmt = $pdo->prepare(
        "SELECT id, nama, email, password, role, foto_face, face_verified, face_token
         FROM users
         WHERE email = ?
         LIMIT 1"
    );
    $stmt->execute([$email]); // email sudah divalidasi format, PDO binding cegah injection
    $user = $stmt->fetch();

    if (!$user) {
        jsonError(404, 'Akun belum terdaftar. Silakan Sign Up terlebih dahulu atau Masuk dengan Google.');
    }

    if (!verifyPassword($pass, $user['password'])) {
        jsonError(401, 'Kata sandi salah. Silakan periksa kembali kata sandi Anda.');
    }

    // Upgrade password lama (MD5/plain) ke bcrypt secara otomatis
    if (!str_starts_with($user['password'], '$2')) {
        $newHash = hashPassword($pass);
        $upd = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $upd->execute([$newHash, $user['id']]);
    }

    // Jangan kirim hash password ke client
    unset($user['password']);

    echo json_encode([
        'status'  => 'success',
        'message' => 'Login berhasil.',
        'user'    => [
            'id'           => (int)$user['id'],
            'nama'         => $user['nama'],
            'email'        => $user['email'],
            'role'         => $user['role'],
            'foto_face'    => $user['foto_face'],
            'face_verified'=> (bool)$user['face_verified'],
            'face_token'   => $user['face_token']
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    // Jangan expose detail error ke client
    error_log('[KSM Login Error] ' . $e->getMessage());
    jsonError(500, 'Kesalahan server. Silakan coba lagi.');
}
