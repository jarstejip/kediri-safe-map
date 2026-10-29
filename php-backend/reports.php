<?php
// ========================================================
// KEDIRI SAFE MAP - REPORTS API
// Endpoint Laporan Warga (Anti SQL Injection)
// ========================================================

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/security.php';

if (PHP_SAPI !== 'cli') {
    header('Content-Type: application/json; charset=utf-8');
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// ========================================================
// POST: Buat Laporan Baru dari Warga
// ========================================================
if ($method === 'POST') {
    // Rate limit: max 5 laporan per IP per menit
    rateLimit('report_post', 5, 60);

    $raw     = file_get_contents('php://input');
    $payload = json_decode($raw, true);

    if (!is_array($payload)) {
        jsonError(400, 'Format payload tidak valid');
    }

    if (!$pdo) {
        echo json_encode(['status' => 'offline', 'message' => 'Laporan disimpan di browser'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ---- Whitelist kategori yang valid ----
    $catMap = [
        'Kerusakan Jalan'      => 1,
        'Jalan Rusak'          => 1,
        'Genangan Air & Banjir'=> 2,
        'Banjir'               => 2,
        'Pohon Tumbang'        => 3,
        'Lampu Jalan Mati'     => 4,
        'Lampu Jalan Rusak'    => 4,
        'Kecelakaan Lalu Lintas'=> 5,
        'Darurat Medis'        => 6,
        'Sampah'               => 7,
        'Laporan Kejadian'     => 1
    ];

    $categoryName = trim($payload['category'] ?? 'Laporan Kejadian');
    // Hanya terima kategori yang ada di whitelist
    if (!array_key_exists($categoryName, $catMap)) {
        $categoryName = 'Laporan Kejadian';
    }
    $categoryId = $catMap[$categoryName];

    // Sanitasi & validasi semua field teks
    $userId   = abs((int)($payload['user_id'] ?? 2));
    $location = sanitizeString($payload['location'] ?? 'Kota Kediri', 200);
    $title    = sanitizeString(
        $payload['title'] ?? ($categoryName . ' di ' . $location),
        255
    );
    $desc     = sanitizeString($payload['desc'] ?? '', 2000);

    // Validasi koordinat
    $lat = isset($payload['latitude'])  ? (float)$payload['latitude']  : -7.8190;
    $lng = isset($payload['longitude']) ? (float)$payload['longitude'] : 112.0125;

    if (!validateCoord($lat, -11.0, 6.0) || !validateCoord($lng, 95.0, 141.0)) {
        jsonError(422, 'Koordinat tidak valid untuk wilayah Indonesia');
    }

    try {
        // Semua parameter melalui prepared statement — tidak ada interpolasi string
        $stmt = $pdo->prepare(
            "INSERT INTO reports
                (user_id, category_id, judul, deskripsi, latitude, longitude, status, created_at)
             VALUES
                (:user_id, :cat_id, :judul, :deskripsi, :lat, :lng, 'Diterima', NOW())"
        );
        $stmt->execute([
            ':user_id'   => $userId,
            ':cat_id'    => $categoryId,
            ':judul'     => $title,
            ':deskripsi' => $desc,
            ':lat'       => $lat,
            ':lng'       => $lng
        ]);

        $reportId = $pdo->lastInsertId();

        // Riwayat status awal
        $stmtHist = $pdo->prepare(
            "INSERT INTO report_status_history
                (report_id, changed_by, status, keterangan, created_at)
             VALUES (?, 1, 'Diterima', 'Laporan masuk ke sistem Siaga 112', NOW())"
        );
        $stmtHist->execute([(int)$reportId]);

        echo json_encode([
            'status'    => 'success',
            'message'   => 'Laporan berhasil disimpan ke database Siaga 112',
            'report_id' => (int)$reportId
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (PDOException $e) {
        error_log('[KSM Report POST Error] ' . $e->getMessage());
        jsonError(500, 'Gagal menyimpan laporan. Silakan coba lagi.');
    }
}

// ========================================================
// GET: Ambil Daftar Laporan
// ========================================================
rateLimit('report_get', 60, 60);

$reports = [];
if ($pdo) {
    try {
        // Query statis tanpa input user — aman dari injection
        $stmt = $pdo->query(
            "SELECT r.id, r.judul, r.deskripsi, r.status, r.latitude, r.longitude,
                    r.created_at, c.nama_kategori
             FROM reports r
             LEFT JOIN report_categories c ON r.category_id = c.id
             ORDER BY r.id DESC
             LIMIT 100"
        );
        $rows = $stmt->fetchAll();

        foreach ($rows as $row) {
            $st   = strtolower((string)$row['status']);
            $step = match($st) {
                'diverifikasi' => 2,
                'diproses'     => 3,
                'selesai'      => 4,
                default        => 1
            };

            $reports[] = [
                'id'         => (int)$row['id'],
                'title'      => $row['judul'],
                'category'   => $row['nama_kategori'] ?? 'Laporan Kejadian',
                'location'   => 'Kota Kediri',
                'desc'       => $row['deskripsi'],
                'status'     => $st,
                'statusText' => strtoupper((string)$row['status']),
                'step'       => $step,
                'officer'    => 'Dinas Terkait / Siaga 112 Kota Kediri',
                'time'       => date('d M H:i', strtotime($row['created_at'])) . ' WIB',
                'latitude'   => (float)$row['latitude'],
                'longitude'  => (float)$row['longitude']
            ];
        }
    } catch (PDOException $e) {
        error_log('[KSM Report GET Error] ' . $e->getMessage());
    }
}

echo json_encode([
    'status' => 'success',
    'total'  => count($reports),
    'data'   => $reports
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
