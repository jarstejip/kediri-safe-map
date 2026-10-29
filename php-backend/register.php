<?php
// ========================================================
// KEDIRI SAFE MAP - USER REGISTRATION & BIOMETRIC API
// Endpoint Pendaftaran Pengguna (Anti SQL Injection)
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

// Rate limit: max 5 pendaftaran per IP per 5 menit
rateLimit('register', 5, 300);

$raw     = file_get_contents('php://input');
$payload = json_decode($raw, true);

if (!is_array($payload)) {
    jsonError(400, 'Format payload tidak valid');
}

// ---- Ambil & validasi input ----
$nama         = trim($payload['nama'] ?? $payload['name'] ?? '');
$email        = trim($payload['email'] ?? '');
$pass         = trim($payload['password'] ?? '');
$fotoFace     = $payload['foto_face'] ?? null;
$faceToken    = $payload['face_token'] ?? null;
$faceVerified = !empty($payload['face_verified']) ? 1 : 0;

if (empty($nama) || empty($email) || empty($pass)) {
    jsonError(400, 'Nama, email, dan kata sandi wajib diisi');
}

if (!validateName($nama)) {
    jsonError(422, 'Nama hanya boleh berisi huruf, spasi, dan tanda hubung (2-100 karakter)', 'nama');
}

if (!validateEmail($email)) {
    jsonError(422, 'Format email tidak valid', 'email');
}

if (!validatePassword($pass)) {
    jsonError(422, 'Kata sandi minimal 6 karakter dan maksimal 128 karakter', 'password');
}

// Validasi biometrik (wajib)
if (!$faceVerified || empty($fotoFace)) {
    http_response_code(422);
    echo json_encode([
        'status'  => 'error',
        'code'    => 'BIOMETRIC_REQUIRED',
        'message' => 'Verifikasi Wajah Biometrik wajib dilakukan untuk mencegah akun fiktif / penipuan.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Validasi ukuran foto (base64 foto wajah, max ~2MB)
if (strlen($fotoFace) > 2_800_000) {
    jsonError(413, 'Ukuran foto wajah terlalu besar (maks 2MB)');
}

// ---- Mode fallback (tanpa DB) ----
if (!$pdo) {
    echo json_encode([
        'status'  => 'success',
        'mode'    => 'local_fallback',
        'message' => 'Pendaftaran berhasil diverifikasi biometrik secara lokal.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ---- Query dengan Prepared Statement ----
try {
    // Cek apakah email sudah terdaftar — binding cegah SQL Injection
    $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $checkStmt->execute([$email]);
    if ($checkStmt->fetch()) {
        jsonError(409, 'Email ini sudah terdaftar. Silakan gunakan email lain atau Sign In.');
    }

    // Hash password dengan bcrypt (bukan MD5!)
    $passHash  = hashPassword($pass);
    $safeToken = $faceToken ?: ('FACE-' . strtoupper(bin2hex(random_bytes(6))));

    $stmt = $pdo->prepare(
        "INSERT INTO users (nama, email, password, role, foto_face, face_verified, face_token, created_at)
         VALUES (?, ?, ?, 'user', ?, 1, ?, NOW())"
    );
    $stmt->execute([
        $nama,      // sudah divalidasi
        $email,     // sudah divalidasi format
        $passHash,  // bcrypt hash
        $fotoFace,  // base64 image
        $safeToken
    ]);

    $userId = $pdo->lastInsertId();

    echo json_encode([
        'status'  => 'success',
        'message' => 'Pendaftaran akun resmi berhasil dengan verifikasi biometrik wajah.',
        'user_id' => (int)$userId,
        'user'    => [
            'id'           => (int)$userId,
            'nama'         => $nama,
            'email'        => $email,
            'face_verified'=> true
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    error_log('[KSM Register Error] ' . $e->getMessage());
    jsonError(500, 'Gagal menyimpan akun. Silakan coba lagi.');
}
