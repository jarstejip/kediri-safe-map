// ========================================================
// KEDIRI SAFE MAP - VERCEL SERVERLESS API: USER LOGIN
// ========================================================

const SEED_USERS = [
  {
    id: 1,
    nama: 'Administrator',
    email: 'admin@kediri.go.id',
    password: 'admin123',
    role: 'admin',
    face_verified: true,
    status: 'Administrator Kediri Safe Map'
  },
  {
    id: 2,
    nama: 'Budi Warga',
    email: 'budi@gmail.com',
    password: 'budi123',
    role: 'user',
    face_verified: true,
    status: 'Warga Terverifikasi Biometrik (Face ID)'
  }
];

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
  const email = (payload.email || '').trim().toLowerCase();
  const pass = (payload.password || '').trim();

  if (!email || !pass) {
    return res.status(400).json({ status: 'error', message: 'Email dan kata sandi wajib diisi' });
  }

  const foundUser = SEED_USERS.find(u => u.email.toLowerCase() === email);

  if (!foundUser) {
    return res.status(404).json({
      status: 'not_found',
      message: 'Akun belum terdaftar. Silakan Sign Up terlebih dahulu atau Masuk dengan Google.'
    });
  }

  if (foundUser.password !== pass) {
    return res.status(401).json({
      status: 'wrong_password',
      message: 'Kata sandi tidak sesuai. Silakan periksa kembali kata sandi Anda.'
    });
  }

  return res.status(200).json({
    status: 'success',
    message: 'Login berhasil.',
    user: {
      id: foundUser.id,
      nama: foundUser.nama,
      email: foundUser.email,
      role: foundUser.role,
      face_verified: foundUser.face_verified,
      status: foundUser.status
    }
  });
}
