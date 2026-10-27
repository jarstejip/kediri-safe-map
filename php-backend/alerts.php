<?php
// ========================================================
// KEDIRI SAFE MAP - GOVERNMENT DISASTER & EMERGENCY API
// Integrasi Data Bahaya Resmi: BMKG, BPBD, & Pemda Kediri
// ========================================================

require_once __DIR__ . '/db.php';
if (PHP_SAPI !== 'cli') {
    header('Content-Type: application/json; charset=utf-8');
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Handle POST: Input Laporan Bahaya Baru dari Petugas BPBD / Webhook Pemerintah
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);

    if (!$payload) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Format payload JSON tidak valid']);
        exit;
    }

    // Validasi API Key BPBD jika dikirim
    $receivedKey = $_SERVER['HTTP_X_API_KEY'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? ($payload['api_key'] ?? '');
    
    if (!$pdo) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database tidak terhubung']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO government_alerts 
            (source, category, level, title, description, location, latitude, longitude, external_id, action_label, action_url) 
            VALUES (:source, :category, :level, :title, :description, :location, :lat, :lng, :ext_id, :action_label, :action_url)");
        
        $stmt->execute([
            ':source' => $payload['source'] ?? 'BPBD Kota Kediri',
            ':category' => $payload['category'] ?? 'darurat',
            ':level' => $payload['level'] ?? 'siaga',
            ':title' => $payload['title'] ?? 'Peringatan Darurat',
            ':description' => $payload['description'] ?? '',
            ':location' => $payload['location'] ?? 'Kota Kediri',
            ':lat' => $payload['latitude'] ?? null,
            ':lng' => $payload['longitude'] ?? null,
            ':ext_id' => $payload['external_id'] ?? ('BPBD-' . time()),
            ':action_label' => $payload['action_label'] ?? 'Lihat Detail',
            ':action_url' => $payload['action_url'] ?? null
        ]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Notifikasi bahaya pemerintah berhasil ditambahkan',
            'insert_id' => $pdo->lastInsertId()
        ]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        exit;
    }
}

// Handle GET: Ambil notifikasi dari Database MySQL + Live BMKG RI
$results = [];

// 1. Ambil data dari tabel MySQL kediri_safe_map.government_alerts
if ($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM government_alerts WHERE is_active = 1 ORDER BY id DESC LIMIT 10");
        $dbAlerts = $stmt->fetchAll();
        foreach ($dbAlerts as $item) {
            $badgeBg = '#fee2e2';
            $badgeColor = '#dc2626';
            $icon = '⚠️';

            if ($item['category'] === 'banjir') {
                $icon = '🌊';
                $badgeBg = '#fee2e2';
                $badgeColor = '#dc2626';
            } elseif ($item['category'] === 'cuaca') {
                $icon = '⛈️';
                $badgeBg = '#fef3c7';
                $badgeColor = '#b45309';
            } elseif ($item['category'] === 'medis') {
                $icon = '🏥';
                $badgeBg = '#dcfce7';
                $badgeColor = '#16a34a';
            }

            $results[] = [
                'id' => 'gov-db-' . $item['id'],
                'source' => $item['source'],
                'category' => 'darurat',
                'categoryLabel' => strtoupper($item['source']),
                'badgeColor' => $badgeColor,
                'badgeBg' => $badgeBg,
                'icon' => $icon,
                'iconBg' => $badgeBg,
                'title' => $item['title'],
                'desc' => $item['description'],
                'location' => $item['location'],
                'time' => date('d M H:i', strtotime($item['created_at'])) . ' WIB',
                'unread' => true,
                'isGovernment' => true,
                'latitude' => $item['latitude'] ? (float)$item['latitude'] : null,
                'longitude' => $item['longitude'] ? (float)$item['longitude'] : null,
                'actionLabel' => $item['action_label'] ?? 'Lihat di Peta',
                'actionUrl' => $item['action_url'] ?? null
            ];
        }
    } catch (Exception $e) {
        // Lanjutkan
    }
}

// 2. Integrasi Live BMKG Auto Gempa (Realtime Badan Meteorologi RI)
try {
    $bmkgContext = stream_context_create([
        'http' => ['timeout' => 3, 'user_agent' => 'KediriSafeMap/1.0']
    ]);
    $bmkgRaw = @file_get_contents('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json', false, $bmkgContext);
    
    if ($bmkgRaw) {
        $bmkgData = json_decode($bmkgRaw, true);
        if (isset($bmkgData['Infogempa']['gempa'])) {
            $g = $bmkgData['Infogempa']['gempa'];
            $coords = explode(',', $g['Coordinates']);
            $lat = isset($coords[0]) ? (float)$coords[0] : null;
            $lng = isset($coords[1]) ? (float)$coords[1] : null;

            $results[] = [
                'id' => 'bmkg-quake-' . md5($g['DateTime']),
                'source' => 'BMKG RI',
                'category' => 'darurat',
                'categoryLabel' => 'RESMI BMKG • GEMPA M ' . $g['Magnitude'],
                'badgeColor' => '#991b1b',
                'badgeBg' => '#fee2e2',
                'icon' => '🌐',
                'iconBg' => '#fef2f2',
                'title' => 'Gempa Terkini M ' . $g['Magnitude'] . ' - ' . $g['Wilayah'],
                'desc' => 'Kedalaman ' . $g['Kedalaman'] . ' | ' . $g['Potensi'] . '. ' . ($g['Dirasakan'] ? 'Dirasakan: ' . $g['Dirasakan'] : ''),
                'location' => $g['Wilayah'],
                'time' => $g['Jam'] . ' (' . $g['Tanggal'] . ')',
                'unread' => true,
                'isGovernment' => true,
                'latitude' => $lat,
                'longitude' => $lng,
                'shakemap' => 'https://data.bmkg.go.id/DataMKG/TEWS/' . $g['Shakemap'],
                'actionLabel' => 'Pusatkan Titik Gempa',
                'actionType' => 'gempa'
            ];
        }
    }
} catch (Exception $e) {}

// Return JSON response
echo json_encode([
    'status' => 'success',
    'timestamp' => date('c'),
    'total' => count($results),
    'data' => $results
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
