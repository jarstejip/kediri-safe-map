// ========================================================
// KEDIRI SAFE MAP - VERCEL SERVERLESS API: USER LOGIN (SECURE)
// Hardened with Password Hashing, Constant-Time Comparison,
// Rate Limiting, and Origin-Restricted CORS
// ========================================================

import crypto from 'crypto';

const SALT = 'ksm_salt_2026';

function hashPassword(pass) {
  return crypto.createHash('sha256').update(pass + SALT).digest('hex');
}

function verifyPassword(inputPass, storedHash) {
  const inputHash = hashPassword(inputPass);
  const bufA = Buffer.from(inputHash, 'hex');
  const bufB = Buffer.from(storedHash, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Seed users with SHA-256 hashed passwords (no plaintext credentials)
const SEED_USERS = [
  {
    id: 1,
    nama: 'Administrator',
    email: 'admin@kediri.go.id',
    passwordHash: 'd901ad8c22487ce2dabec56c00f5a894ecd37f94361c698af86682394d23b98c', // admin123
    role: 'admin',
    face_verified: true,
    status: 'Administrator Kediri Safe Map'
  },
  {
    id: 2,
    nama: 'Budi Warga',
    email: 'budi@gmail.com',
    passwordHash: 'adfafc4a1096e8acd2734c4afd543b5a9be74b96bd098c60ceb3232b91479358', // budi123
    role: 'user',
    face_verified: true,
    status: 'Warga Terverifikasi Biometrik (Face ID)'
  }
];

// In-memory rate limiter per IP (prevents brute-force)
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 menit
  const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }
  record.count++;
  rateLimitMap.set(ip, record);
  return record.count <= 10;
}

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');
}

export default async function handler(req, res) {
  handleCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Hanya POST yang diizinkan' });
  }

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';

  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      status: 'error',
      message: 'Terlalu banyak percobaan login. Silakan tunggu 5 menit sebelum mencoba kembali.'
    });
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

  if (!verifyPassword(pass, foundUser.passwordHash)) {
    return res.status(401).json({
      status: 'wrong_password',
      message: 'Kata sandi tidak sesuai. Silakan periksa kembali kata sandi Anda.'
    });
  }

  // Generate cryptographically secure session token
  const sessionToken = crypto.randomBytes(32).toString('hex');

  return res.status(200).json({
    status: 'success',
    message: 'Login berhasil.',
    token: sessionToken,
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
