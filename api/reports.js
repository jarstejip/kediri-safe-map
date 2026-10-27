// ========================================================
// KEDIRI SAFE MAP - VERCEL SERVERLESS API: CITIZEN REPORTS
// ========================================================

const defaultReports = [
  {
    id: 1,
    title: 'Pohon Tumbang Menutup Jalan Brawijaya',
    category: 'Pohon Tumbang',
    location: 'Kota Kediri',
    desc: 'Pohon tumbang menghalangi sebagian badan jalan pasca hujan deras disertai angin kencang.',
    status: 'diverifikasi',
    statusText: 'DIVERIFIKASI',
    step: 2,
    officer: 'DLHKP / BPBD Kota Kediri',
    time: '27 Okt 13:40 WIB',
    latitude: -7.8185,
    longitude: 112.0120
  },
  {
    id: 2,
    title: 'Lampu Penerangan Jalan Umum Padam',
    category: 'Lampu Jalan Rusak',
    location: 'Kota Kediri',
    desc: 'Lampu PJU sepanjang jalan padam sejak 2 hari, jalanan gelap rawan tindak kejahatan.',
    status: 'diproses',
    statusText: 'DIPROSES',
    step: 3,
    officer: 'Dinas Perhubungan Kota Kediri',
    time: '26 Okt 20:15 WIB',
    latitude: -7.8240,
    longitude: 112.0085
  },
  {
    id: 3,
    title: 'Genangan Air di Simpang Dhoho',
    category: 'Genangan Air & Banjir',
    location: 'Kota Kediri',
    desc: 'Drainase tersumbat menyebabkan genangan air setinggi 15 cm setelah hujan.',
    status: 'selesai',
    statusText: 'SELESAI',
    step: 4,
    officer: 'DPUPR Kota Kediri',
    time: '25 Okt 16:30 WIB',
    latitude: -7.8160,
    longitude: 112.0150
  }
];

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
