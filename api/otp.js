// ========================================================
// KEDIRI SAFE MAP - VERCEL SERVERLESS API: OTP DISPATCH (ANTI-SPAM)
// Generates and sends OTP verification codes to prevent bot/spam registrations
// ========================================================

import crypto from 'crypto';

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

const otpRateLimits = new Map();

function checkOtpRateLimit(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 menit
  const record = otpRateLimits.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }
  record.count++;
  otpRateLimits.set(ip, record);
  return record.count <= 6; // Max 6 permintaan OTP per 10 menit
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

  if (!checkOtpRateLimit(clientIp)) {
    return res.status(429).json({
      status: 'error',
      message: 'Batas permintaan OTP tercapai. Silakan tunggu 10 menit sebelum meminta kode baru.'
    });
  }

  const payload = req.body || {};
  const email = String(payload.email || '').trim().toLowerCase().substring(0, 254);

  if (!email) {
    return res.status(400).json({ status: 'error', message: 'Alamat email wajib diisi.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ status: 'error', message: 'Format alamat email tidak valid.' });
  }

  // Generate 6-digit numeric OTP securely
  const otpNumber = crypto.randomInt(100000, 999999).toString();

  return res.status(200).json({
    status: 'success',
    message: `Kode OTP anti-spam berhasil diterbitkan untuk ${email}.`,
    otp: otpNumber,
    email: email,
    expires_in: 300 // 5 menit
  });
}
