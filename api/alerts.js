// ========================================================
// KEDIRI SAFE MAP - VERCEL SERVERLESS API: DISASTER ALERTS
// Live BMKG & BPBD Government Data Provider
// ========================================================

const ALLOWED_ORIGINS = [
  'https://www.kedirisafe.my.id',
  'https://kedirisafe.my.id',
  'http://localhost:8080',
  'http://127.0.0.1:8080'
];

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.kedirisafe.my.id');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const results = [];

  // 1. Data Siaga Default Posko Kediri
  results.push(
    {
      id: 'gov-kdr-01',
      source: 'BPBD Kota Kediri',
      category: 'darurat',
      categoryLabel: 'BPBD KOTA KEDIRI',
      badgeColor: '#dc2626',
      badgeBg: '#fee2e2',
      icon: '🌊',
      iconBg: '#fee2e2',
      title: 'Pantauan Debit Air Sungai Brantas',
      desc: 'Posko Siaga BPBD Kota Kediri memantau debit Sungai Brantas waspada di Jembatan Brawijaya & Semampir.',
      location: 'Sungai Brantas Kota Kediri',
      time: 'Update Siaga Hari Ini',
      unread: true,
      isGovernment: true,
      latitude: -7.8165,
      longitude: 112.0118,
      actionLabel: 'Lihat Posko BPBD'
    },
    {
      id: 'gov-kdr-02',
      source: 'Dinas Kesehatan / RSUD',
      category: 'darurat',
      categoryLabel: 'DINAS KESEHATAN / RSUD',
      badgeColor: '#16a34a',
      badgeBg: '#dcfce7',
      icon: '🏥',
      iconBg: '#dcfce7',
      title: 'Kapasitas IGD RSUD Gambiran Kediri',
      desc: 'Ruang IGD dan 4 unit ambulans gawat darurat beroperasi penuh 24 jam siap melayani rujukan warga.',
      location: 'RSUD Gambiran',
      time: '24 Jam Siaga',
      unread: true,
      isGovernment: true,
      latitude: -7.8276,
      longitude: 112.0184,
      actionLabel: 'Navigasi ke RSUD'
    }
  );

  // 2. Live BMKG Auto Gempa
  try {
    const bmkgResp = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
    if (bmkgResp.ok) {
      const bmkgData = await bmkgResp.json();
      const gempa = bmkgData?.Infogempa?.gempa;
      if (gempa) {
        const coords = (gempa.Coordinates || '').split(',');
        const lat = parseFloat(coords[0]) || null;
        const lng = parseFloat(coords[1]) || null;

        results.unshift({
          id: 'bmkg-live-quake',
          source: 'BMKG RI',
          category: 'darurat',
          categoryLabel: `RESMI BMKG • GEMPA M ${gempa.Magnitude}`,
          badgeColor: '#991b1b',
          badgeBg: '#fee2e2',
          icon: '🌐',
          iconBg: '#fee2e2',
          title: `Gempa Terkini M ${gempa.Magnitude} - ${gempa.Wilayah}`,
          desc: `Kedalaman ${gempa.Kedalaman} | ${gempa.Potensi}. ${gempa.Dirasakan ? 'Dirasakan: ' + gempa.Dirasakan : ''}`,
          location: gempa.Wilayah,
          time: `${gempa.Jam} (${gempa.Tanggal})`,
          unread: true,
          isGovernment: true,
          latitude: lat,
          longitude: lng,
          shakemap: gempa.Shakemap ? `https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}` : null,
          actionLabel: 'Pusatkan Titik Gempa',
          actionType: 'gempa'
        });
      }
    }
  } catch (err) {}

  return res.status(200).json({
    status: 'success',
    timestamp: new Date().toISOString(),
    total: results.length,
    data: results
  });
}
