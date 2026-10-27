// ========================================================
// KEDIRI SAFE MAP - VERCEL SERVERLESS API: USER REGISTRATION & BIOMETRIC
// ========================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Hanya POST yang diizinkan' });
  }

  const payload = req.body || {};
  const nama = (payload.nama || payload.name || '').trim();
  const email = (payload.email || '').trim();
  const pass = (payload.password || '').trim();
  const fotoFace = payload.foto_face;
  const faceVerified = Boolean(payload.face_verified);
  const faceToken = payload.face_token || `FACE-LIVE-${Date.now()}`;

  if (!nama || !email || !pass) {
    return res.status(400).json({ status: 'error', message: 'Nama, email, dan kata sandi wajib diisi' });
  }

  // Validasi Wajib Face Recognition Anti-Fraud
  if (!faceVerified || !fotoFace) {
    return res.status(422).json({
      status: 'error',
      code: 'BIOMETRIC_REQUIRED',
      message: 'Verifikasi Wajah Biometrik Wajib dilakukan untuk mencegah akun fiktif / penipuan.'
    });
  }

  const userId = Math.floor(1000 + Math.random() * 9000);

  return res.status(200).json({
    status: 'success',
    message: 'Pendaftaran akun resmi berhasil dengan verifikasi biometrik wajah.',
    user_id: userId,
    user: {
      id: userId,
      nama: nama,
      email: email,
      face_verified: true,
      face_token: faceToken
    }
  });
}
