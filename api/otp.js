// ========================================================
// KEDIRI SAFE MAP - VERCEL SERVERLESS API: OTP DISPATCH (REAL GMAIL SMTP)
// Sends real 6-digit verification codes to the user's Gmail inbox
// using Nodemailer with Google App Password (SMTP)
// ========================================================

import crypto from 'crypto';
import nodemailer from 'nodemailer';

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

function buildOtpHtmlEmail(otpNumber, recipientEmail) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kode OTP Kediri Safe Map</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px; }
    .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #15803d 0%, #166534 100%); padding: 28px 24px; text-align: center; color: #ffffff; }
    .logo-title { font-size: 22px; font-weight: 800; letter-spacing: 0.5px; margin: 0 0 4px 0; color: #ffffff; }
    .sub-title { font-size: 12px; color: #bbf7d0; margin: 0; }
    .content { padding: 32px 24px; text-align: center; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .desc { font-size: 13.5px; color: #475569; line-height: 1.6; margin: 0 0 24px 0; }
    .otp-box { background: #f0fdf4; border: 2px dashed #86efac; border-radius: 12px; padding: 20px 16px; margin: 0 0 24px 0; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #15803d; }
    .expiry-badge { display: inline-block; background: #fef3c7; color: #b45309; border: 1px solid #fde68a; font-size: 11.5px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; margin-top: 10px; }
    .security-tip { background: #f8fafc; border-radius: 10px; padding: 14px; font-size: 12px; color: #64748b; line-height: 1.5; text-align: left; border-left: 4px solid #15803d; margin-bottom: 16px; }
    .footer { padding: 20px 24px; text-align: center; font-size: 11.5px; color: #94a3b8; border-top: 1px solid #f1f5f9; background: #fafafa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo-title">Kediri Safe Map</h1>
      <p class="sub-title">Sistem Tanggap Darurat & Informasi Warga Kota Kediri</p>
    </div>
    <div class="content">
      <div class="greeting">Halo Warga Kota Kediri,</div>
      <p class="desc">
        Terima kasih telah mendaftar di <b>Kediri Safe Map</b>. Untuk mengonfirmasi bahwa email ini benar milik Anda dan menghindari pendaftaran spam, silakan gunakan kode verifikasi OTP berikut:
      </p>
      <div class="otp-box">
        <div class="otp-code">${otpNumber}</div>
        <div class="expiry-badge">⏱️ Kode Berlaku Selama 5 Menit</div>
      </div>
      <div class="security-tip">
        <b>Penting:</b> Jangan berikan kode OTP ini kepada siapa pun. Petugas Kediri Safe Map tidak pernah meminta kode OTP rahasia Anda.
      </div>
    </div>
    <div class="footer">
      Pemerintah Kota Kediri • Siaga 112 • Kediri Safe Map<br>
      Pesan ini dikirimkan otomatis ke <b>${recipientEmail}</b> untuk validasi keamanan warga.
    </div>
  </div>
</body>
</html>`;
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

  // Konfigurasi Gmail SMTP dari Environment Variables
  const gmailUser = (process.env.GMAIL_USER || process.env.EMAIL_USER || '').trim();
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS || process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();

  let emailSentReal = false;
  let emailError = null;

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });

      await transporter.sendMail({
        from: `"Kediri Safe Map" <${gmailUser}>`,
        to: email,
        subject: `Kode Verifikasi OTP: ${otpNumber} - Kediri Safe Map`,
        text: `Kode OTP verifikasi Kediri Safe Map Anda adalah: ${otpNumber}. Kode berlaku 5 menit. Jangan berikan kepada siapapun.`,
        html: buildOtpHtmlEmail(otpNumber, email)
      });

      emailSentReal = true;
    } catch (err) {
      console.error('[Gmail SMTP Error]:', err);
      emailError = err.message;
    }
  }

  return res.status(200).json({
    status: 'success',
    message: emailSentReal
      ? `Kode OTP 6-digit berhasil dikirimkan langsung ke kotak masuk Gmail ${email}.`
      : `Kode OTP anti-spam berhasil diterbitkan untuk ${email}.`,
    sent_via_gmail: emailSentReal,
    otp: otpNumber,
    email: email,
    expires_in: 300, // 5 menit
    hint: !emailSentReal && (!gmailUser || !gmailPass)
      ? 'GMAIL_USER dan GMAIL_APP_PASSWORD belum diisi di Environment Variables Vercel.'
      : (emailError || null)
  });
}
