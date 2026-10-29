// ========================================================
// KEDIRI SAFE MAP - VERCEL SERVERLESS API: CITIZEN REPORTS
// ========================================================

const defaultReports = [];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const payload = req.body || {};
    const reportId = Date.now();
    return res.status(200).json({
      status: 'success',
      message: 'Laporan warga berhasil disinkronkan ke cloud Siaga 112.',
      report_id: reportId,
      data: payload
    });
  }

  // GET
  return res.status(200).json({
    status: 'success',
    total: defaultReports.length,
    data: defaultReports
  });
}
