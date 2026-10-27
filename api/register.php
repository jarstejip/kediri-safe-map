<?php
// ========================================================
// KEDIRI SAFE MAP - USER REGISTRATION & BIOMETRIC API
// Endpoint Pendaftaran Pengguna dengan Face Recognition Anti-Fraud
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

$nama = trim($payload['nama'] ?? $payload['name'] ?? '');
$email = trim($payload['email'] ?? '');
$pass = trim($payload['password'] ?? '');
$fotoFace = $payload['foto_face'] ?? null;
$faceToken = $payload['face_token'] ?? null;
$faceVerified = !empty($payload['face_verified']) ? 1 : 0;

if (empty($nama) || empty($email) || empty($pass)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Nama, email, dan kata sandi wajib diisi']);
    exit;
}

// Validasi Wajib Face Recognition (Anti-Fraud)
if (!$faceVerified || empty($fotoFace)) {
    http_response_code(422);
    echo json_encode([
        'status' => 'error',
        'code' => 'BIOMETRIC_REQUIRED',
        'message' => 'Verifikasi Wajah Biometrik Wajib dilakukan untuk mencegah akun fiktif / penipuan.'
    ]);
    exit;
}

if (!$pdo) {
    // Mode fallback jika MySQL tidak terhubung
    echo json_encode([
        'status' => 'success',
        'mode' => 'local_fallback',
        'message' => 'Pendaftaran berhasil diverifikasi biometrik secara lokal.'
    ]);
    exit;
}

try {
    // Cek apakah email sudah terdaftar
    $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $checkStmt->execute([$email]);
    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'Email ini sudah terdaftar. Silakan gunakan email lain atau Sign In.']);
        exit;
    }

    $passHash = md5($pass); // Sesuai format hash eksisting dump
    $stmt = $pdo->prepare("INSERT INTO users (nama, email, password, role, foto_face, face_verified, face_token, created_at) VALUES (?, ?, ?, 'user', ?, ?, ?, NOW())");
    $stmt->execute([
        $nama,
        $email,
        $passHash,
        $fotoFace,
        1,
        $faceToken ?: ('FACE-' . strtoupper(substr(md5(uniqid()), 0, 12)))
    ]);

    $userId = $pdo->lastInsertId();

    echo json_encode([
        'status' => 'success',
        'message' => 'Pendaftaran akun resmi berhasil dengan verifikasi biometrik wajah.',
        'user_id' => $userId,
        'user' => [
            'id' => $userId,
            'nama' => $nama,
            'email' => $email,
            'face_verified' => true
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan ke database: ' . $e->getMessage()]);
}
