<?php
// ========================================================
// KEDIRI SAFE MAP - REPORTS API (LARAGON MYSQL)
// Endpoint untuk Laporan Warga & Riwayat Status
// ========================================================

require_once __DIR__ . '/db.php';
if (PHP_SAPI !== 'cli') {
    header('Content-Type: application/json; charset=utf-8');
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// 1. POST: Buat Laporan Baru dari Warga
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);

    if (!$payload) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Format payload tidak valid']);
        exit;
    }

    if (!$pdo) {
        // Fallback jika DB offline
        echo json_encode(['status' => 'offline', 'message' => 'Laporan disimpan di browser']);
        exit;
    }

    try {
        // Mapping kategori string ke category_id
        $catMap = [
            'Kerusakan Jalan' => 1,
            'Jalan Rusak' => 1,
            'Genangan Air & Banjir' => 2,
            'Banjir' => 2,
            'Pohon Tumbang' => 3,
            'Lampu Jalan Mati' => 4,
            'Lampu Jalan Rusak' => 4,
            'Sampah' => 5
        ];

        $categoryName = $payload['category'] ?? 'Laporan Kejadian';
        $categoryId = $catMap[$categoryName] ?? 1;

        $stmt = $pdo->prepare("INSERT INTO reports 
            (user_id, category_id, judul, deskripsi, latitude, longitude, status, created_at) 
            VALUES (:user_id, :cat_id, :judul, :deskripsi, :lat, :lng, 'Diterima', NOW())");
        
        $stmt->execute([
            ':user_id' => $payload['user_id'] ?? 2, // Default user 'Budi Warga'
            ':cat_id' => $categoryId,
            ':judul' => $payload['title'] ?? ($categoryName . ' di ' . ($payload['location'] ?? 'Kediri')),
            ':deskripsi' => $payload['desc'] ?? '',
            ':lat' => $payload['latitude'] ?? -7.8190,
            ':lng' => $payload['longitude'] ?? 112.0125
        ]);

        $reportId = $pdo->lastInsertId();

        // Masukkan riwayat status awal
        $stmtHist = $pdo->prepare("INSERT INTO report_status_history (report_id, changed_by, status, keterangan, created_at) VALUES (?, 1, 'Diterima', 'Laporan masuk ke sistem Siaga 112', NOW())");
        $stmtHist->execute([$reportId]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Laporan berhasil disimpan ke database Laragon',
            'report_id' => $reportId
        ]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        exit;
    }
}

// 2. GET: Ambil Daftar Laporan Warga & Status Stepper
$reports = [];
if ($pdo) {
    try {
        $query = "SELECT r.*, c.nama_kategori 
                  FROM reports r 
                  LEFT JOIN report_categories c ON r.category_id = c.id 
                  ORDER BY r.id DESC";
        $stmt = $pdo->query($query);
        $rows = $stmt->fetchAll();

        foreach ($rows as $row) {
            $st = strtolower($row['status']);
            $step = 1;
            if ($st === 'diverifikasi') $step = 2;
            elseif ($st === 'diproses') $step = 3;
            elseif ($st === 'selesai') $step = 4;

            $reports[] = [
                'id' => (int)$row['id'],
                'title' => $row['judul'],
                'category' => $row['nama_kategori'] ?? 'Laporan Kejadian',
                'location' => 'Kota Kediri',
                'desc' => $row['deskripsi'],
                'status' => $st,
                'statusText' => strtoupper($row['status']),
                'step' => $step,
                'officer' => 'Dinas Terkait / Siaga 112 Kota Kediri',
                'time' => date('d M H:i', strtotime($row['created_at'])) . ' WIB',
                'latitude' => (float)$row['latitude'],
                'longitude' => (float)$row['longitude']
            ];
        }
    } catch (Exception $e) {}
}

echo json_encode([
    'status' => 'success',
    'total' => count($reports),
    'data' => $reports
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
