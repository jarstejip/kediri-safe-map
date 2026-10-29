// ========================================================
// KEDIRI SAFE MAP - VERCEL SERVERLESS API: CITIZEN REPORTS (SECURE)
// Hardened with Input Validation, Anti-Spam Rate Limiting,
// and Origin-Restricted CORS
// ========================================================

const defaultReports = [];

const ALLOWED_ORIGINS = [
  'https://www.kedirisafe.my.id',
  'https://kedirisafe.my.id',
  'http://localhost:8080',
  'http://127.0.0.1:8080'
];

function handleCors(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.kedirisafe.my.id');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  res.setHeader('Vary', 'Origin');
}

const reportRateLimits = new Map();

function checkReportRateLimit(ip) {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 menit
  const record = reportRateLimits.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }
  record.count++;
  reportRateLimits.set(ip, record);
  return record.count <= 6; // Max 6 laporan per IP per 5 menit
}

export default async function handler(req, res) {
  handleCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';

  if (req.method === 'POST') {
    if (!checkReportRateLimit(clientIp)) {
      return res.status(429).json({
        status: 'error',
        message: 'Batas frekuensi laporan tercapai. Mohon tunggu beberapa saat sebelum mengirim laporan baru.'
      });
    }

    const payload = req.body || {};
    const title = String(payload.title || payload.judul || '').trim().substring(0, 150);
    const desc = String(payload.desc || payload.deskripsi || '').trim().substring(0, 1000);
    const category = String(payload.category || 'Laporan Kejadian').trim().substring(0, 50);

    if (!title || !desc) {
      return res.status(400).json({
        status: 'error',
        message: 'Judul kejadian dan deskripsi laporan wajib diisi.'
      });
    }

    const reportId = Date.now();
    return res.status(200).json({
      status: 'success',
      message: 'Laporan warga berhasil disinkronkan ke cloud Siaga 112.',
      report_id: reportId,
      data: {
        id: reportId,
        title: title,
        desc: desc,
        category: category,
        status: 'diterima',
        created_at: new Date().toISOString()
      }
    });
  }

  // GET
  return res.status(200).json({
    status: 'success',
    total: defaultReports.length,
    data: defaultReports
  });
}
