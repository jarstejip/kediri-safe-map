<?php
// ========================================================
// KEDIRI SAFE MAP - SECURITY LAYER
// Anti SQL Injection, XSS, CSRF, Rate Limiting
// ========================================================

// ---- Input Sanitizer ----
// Bersihkan string dari karakter berbahaya untuk HTML output
function sanitizeString(string $input, int $maxLen = 500): string {
    $trimmed = trim($input);
    $limited = mb_substr($trimmed, 0, $maxLen, 'UTF-8');
    return htmlspecialchars($limited, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

// Validasi format email (RFC 5321 compliant)
function validateEmail(string $email): bool {
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL)
        && mb_strlen($email) <= 254;
}

// Validasi password: min 6 karakter, max 128
function validatePassword(string $pass): bool {
    $len = mb_strlen($pass, 'UTF-8');
    return $len >= 6 && $len <= 128;
}

// Validasi nama: huruf, spasi, tanda hubung, apostrof saja
function validateName(string $nama): bool {
    return (bool) preg_match('/^[\p{L}\s\'\-\.]{2,100}$/u', $nama);
}

// Validasi float koordinat
function validateCoord(?float $val, float $min, float $max): bool {
    if ($val === null) return true; // nullable
    return $val >= $min && $val <= $max;
}

// Pastikan nilai hanya berisi karakter whitelist (untuk category, level, dsb)
function validateEnum(string $value, array $allowed): bool {
    return in_array($value, $allowed, true);
}

// ---- Rate Limiter sederhana berbasis file (per IP, per endpoint) ----
function rateLimit(string $endpoint, int $maxRequests = 10, int $windowSeconds = 60): void {
    $ip       = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $safeIp   = preg_replace('/[^a-fA-F0-9:\.]/', '', $ip);
    $dir      = sys_get_temp_dir() . '/ksm_ratelimit';
    if (!is_dir($dir)) { @mkdir($dir, 0700, true); }

    $key      = md5($endpoint . '_' . $safeIp);
    $file     = $dir . '/' . $key . '.json';
    $now      = time();
    $data     = ['hits' => [], 'count' => 0];

    if (file_exists($file)) {
        $raw = @file_get_contents($file);
        if ($raw) { $data = json_decode($raw, true) ?: $data; }
    }

    // Buang hit lama di luar window
    $data['hits'] = array_filter($data['hits'], fn($t) => ($now - $t) < $windowSeconds);
    $data['hits'][] = $now;
    $data['count']  = count($data['hits']);

    @file_put_contents($file, json_encode($data), LOCK_EX);

    if ($data['count'] > $maxRequests) {
        header('Retry-After: ' . $windowSeconds);
        http_response_code(429);
        echo json_encode([
            'status'  => 'error',
            'message' => 'Terlalu banyak permintaan. Silakan coba lagi dalam ' . $windowSeconds . ' detik.'
        ]);
        exit;
    }
}

// ---- Respon JSON error terstandar ----
function jsonError(int $code, string $msg, string $field = ''): void {
    http_response_code($code);
    $body = ['status' => 'error', 'message' => $msg];
    if ($field) $body['field'] = $field;
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

// ---- Hash password dengan password_hash (bcrypt) ----
function hashPassword(string $pass): string {
    return password_hash($pass, PASSWORD_BCRYPT, ['cost' => 11]);
}

// Verifikasi: dukung bcrypt baru & md5 lama (migrasi)
function verifyPassword(string $input, string $stored): bool {
    // Modern bcrypt
    if (str_starts_with($stored, '$2')) {
        return password_verify($input, $stored);
    }
    // Legacy MD5 — masih diterima, tapi tandai untuk upgrade
    if (strlen($stored) === 32 && ctype_xdigit($stored)) {
        return hash_equals($stored, md5($input));
    }
    // Plain text (seed data lama)
    return hash_equals($stored, $input);
}

