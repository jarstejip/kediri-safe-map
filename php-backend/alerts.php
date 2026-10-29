<?php
// ========================================================
// KEDIRI SAFE MAP - GOVERNMENT ALERTS API
// Integrasi BMKG, BPBD & Pemda Kediri (Anti SQL Injection)
// ========================================================

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/security.php';

if (PHP_SAPI !== 'cli') {
    header('Content-Type: application/json; charset=utf-8');
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// ========================================================
// POST: Input Alert dari Petugas BPBD / Webhook Resmi
// ========================================================
if ($method === 'POST') {
    rateLimit('alert_post', 20, 60);

    $rawInput = file_get_contents('php://input');
    $payload  = json_decode($rawInput, true);

    if (!is_array($payload)) {
        jsonError(400, 'Format payload JSON tidak valid');
    }

    if (!$pdo) {
        jsonError(500, 'Database tidak terhubung');
    }

    // Whitelist nilai yang diperbolehkan untuk kolom enum
    $allowedCategories = ['darurat', 'banjir', 'cuaca', 'medis', 'pemerintah', 'layanan'];
    $allowedLevels     = ['info', 'waspada', 'siaga', 'awas'];
    $allowedSources    = ['BMKG RI', 'BPBD Kota Kediri', 'Dinas Kesehatan', 'Polres Kediri', 'Pemkot Kediri'];

    $category = $payload['category'] ?? 'darurat';
    $level    = $payload['level']    ?? 'siaga';
    $source   = $payload['source']   ?? 'BPBD Kota Kediri';

    // Paksa ke nilai default jika tidak ada di whitelist
    if (!in_array($category, $allowedCategories, true)) $category = 'darurat';
    if (!in_array($level,    $allowedLevels,     true)) $level    = 'siaga';
    if (!in_array($source,   $allowedSources,    true)) $source   = 'BPBD Kota Kediri';

    $lat = isset($payload['latitude'])  ? (float)$payload['latitude']  : null;
    $lng = isset($payload['longitude']) ? (float)$payload['longitude'] : null;

    if ($lat !== null && !validateCoord($lat, -11.0, 6.0))  $lat = null;
    if ($lng !== null && !validateCoord($lng, 95.0, 141.0)) $lng = null;

    $title       = sanitizeString($payload['title']       ?? 'Peringatan Darurat', 255);
    $description = sanitizeString($payload['description'] ?? '', 2000);
    $location    = sanitizeString($payload['location']    ?? 'Kota Kediri', 200);
    $actionLabel = sanitizeString($payload['action_label']?? 'Lihat Detail', 100);

    // action_url harus berformat URL valid
    $actionUrl = null;
    if (!empty($payload['action_url'])) {
        $filtered = filter_var(trim($payload['action_url']), FILTER_VALIDATE_URL);
        if ($filtered && preg_match('/^https?:\/\//', $filtered)) {
            $actionUrl = $filtered;
        }
    }

    $extId = sanitizeString($payload['external_id'] ?? ('BPBD-' . time()), 100);

    try {
        // Semua nilai melalui binding — 0% SQL Injection
        $stmt = $pdo->prepare(
            "INSERT INTO government_alerts
                (source, category, level, title, description, location,
                 latitude, longitude, external_id, action_label, action_url)
             VALUES
                (:source, :category, :level, :title, :description, :location,
                 :lat, :lng, :ext_id, :action_label, :action_url)"
        );
        $stmt->execute([
            ':source'       => $source,
            ':category'     => $category,
            ':level'        => $level,
            ':title'        => $title,
            ':description'  => $description,
            ':location'     => $location,
            ':lat'          => $lat,
            ':lng'          => $lng,
            ':ext_id'       => $extId,
            ':action_label' => $actionLabel,
            ':action_url'   => $actionUrl
        ]);

        echo json_encode([
            'status'    => 'success',
            'message'   => 'Notifikasi bahaya pemerintah berhasil ditambahkan',
            'insert_id' => (int)$pdo->lastInsertId()
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (PDOException $e) {
        error_log('[KSM Alert POST Error] ' . $e->getMessage());
        jsonError(500, 'Gagal menyimpan alert. Silakan coba lagi.');
    }
}

// ========================================================
// GET: Ambil alert dari DB + Live BMKG
// ========================================================
rateLimit('alert_get', 60, 60);

$results = [];

// 1. Ambil dari MySQL — query statis, tidak ada input user
if ($pdo) {
    try {
        $stmt    = $pdo->query(
            "SELECT id, source, category, level, title, description,
                    location, latitude, longitude, action_label, action_url, created_at
             FROM government_alerts
             WHERE is_active = 1
             ORDER BY id DESC
             LIMIT 10"
        );
        $dbAlerts = $stmt->fetchAll();

        foreach ($dbAlerts as $item) {
            $cat = $item['category'];
            $badgeBg    = '#fee2e2';
            $badgeColor = '#dc2626';
            $icon       = '⚠️';

            if ($cat === 'banjir') {
                $icon = '🌊';
            } elseif ($cat === 'cuaca') {
                $icon = '⛈️'; $badgeBg = '#fef3c7'; $badgeColor = '#b45309';
            } elseif ($cat === 'medis') {
                $icon = '🏥'; $badgeBg = '#dcfce7'; $badgeColor = '#16a34a';
            }

            // Data dari DB dikembalikan apa adanya — sudah di-sanitasi saat INSERT
            $results[] = [
                'id'           => 'gov-db-' . (int)$item['id'],
                'source'       => $item['source'],
                'category'     => 'darurat',
                'categoryLabel'=> strtoupper($item['source']),
                'badgeColor'   => $badgeColor,
                'badgeBg'      => $badgeBg,
                'icon'         => $icon,
                'iconBg'       => $badgeBg,
                'title'        => $item['title'],
                'desc'         => $item['description'],
                'location'     => $item['location'],
                'time'         => date('d M H:i', strtotime($item['created_at'])) . ' WIB',
                'unread'       => true,
                'isGovernment' => true,
                'latitude'     => $item['latitude']  ? (float)$item['latitude']  : null,
                'longitude'    => $item['longitude'] ? (float)$item['longitude'] : null,
                'actionLabel'  => $item['action_label'] ?? 'Lihat di Peta',
                'actionUrl'    => $item['action_url'] ?? null
            ];
        }
    } catch (PDOException $e) {
        error_log('[KSM Alert GET Error] ' . $e->getMessage());
    }
}

// 2. Live BMKG — fetch dengan timeout ketat
try {
    $ctx     = stream_context_create(['http' => ['timeout' => 3, 'user_agent' => 'KediriSafeMap/1.0']]);
    $bmkgRaw = @file_get_contents('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json', false, $ctx);

    if ($bmkgRaw) {
        $bmkgData = json_decode($bmkgRaw, true);
        if (isset($bmkgData['Infogempa']['gempa'])) {
            $g      = $bmkgData['Infogempa']['gempa'];
            $coords = explode(',', (string)($g['Coordinates'] ?? ''));
            $lat    = isset($coords[0]) ? (float)$coords[0] : null;
            $lng    = isset($coords[1]) ? (float)$coords[1] : null;

            // Sanitasi data dari API BMKG sebelum dikembalikan
            $results[] = [
                'id'           => 'bmkg-quake-' . md5((string)($g['DateTime'] ?? time())),
                'source'       => 'BMKG RI',
                'category'     => 'darurat',
                'categoryLabel'=> 'RESMI BMKG • GEMPA M ' . htmlspecialchars((string)($g['Magnitude'] ?? '?'), ENT_QUOTES, 'UTF-8'),
                'badgeColor'   => '#991b1b',
                'badgeBg'      => '#fee2e2',
                'icon'         => '🌐',
                'iconBg'       => '#fef2f2',
                'title'        => 'Gempa Terkini M ' . htmlspecialchars((string)($g['Magnitude'] ?? '?'), ENT_QUOTES, 'UTF-8') . ' - ' . htmlspecialchars((string)($g['Wilayah'] ?? ''), ENT_QUOTES, 'UTF-8'),
                'desc'         => 'Kedalaman ' . htmlspecialchars((string)($g['Kedalaman'] ?? ''), ENT_QUOTES, 'UTF-8') . ' | ' . htmlspecialchars((string)($g['Potensi'] ?? ''), ENT_QUOTES, 'UTF-8'),
                'location'     => htmlspecialchars((string)($g['Wilayah'] ?? 'Indonesia'), ENT_QUOTES, 'UTF-8'),
                'time'         => htmlspecialchars((string)($g['Jam'] ?? ''), ENT_QUOTES, 'UTF-8') . ' (' . htmlspecialchars((string)($g['Tanggal'] ?? ''), ENT_QUOTES, 'UTF-8') . ')',
                'unread'       => true,
                'isGovernment' => true,
                'latitude'     => $lat,
                'longitude'    => $lng,
                'shakemap'     => !empty($g['Shakemap']) ? 'https://data.bmkg.go.id/DataMKG/TEWS/' . rawurlencode(basename((string)$g['Shakemap'])) : null,
                'actionLabel'  => 'Pusatkan Titik Gempa',
                'actionType'   => 'gempa'
            ];
        }
    }
} catch (Exception $e) {
    error_log('[KSM BMKG Error] ' . $e->getMessage());
}

echo json_encode([
    'status'    => 'success',
    'timestamp' => date('c'),
    'total'     => count($results),
    'data'      => $results
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
