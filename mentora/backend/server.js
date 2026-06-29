const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('./db');
const { hashPassword, verifyPassword, signToken, requireAuth, optionalAuth } = require('./auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('./email');

const app = express();
const PORT = process.env.PORT || 4000;
const IS_PROD = process.env.NODE_ENV === 'production';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || null;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR));

const COOKIE_OPTS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function publicUser(row) {
  if (!row) return null;
  const { password_hash, google_id, ...rest } = row;
  return rest;
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ============ AUTH ROUTES ============

// SIGNUP with email verification
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name, isTutor } = req.body;

  if (!email || !isValidEmail(email))
    return res.status(400).json({ error: 'Düzgün e-poçt ünvanı daxil et' });
  if (!password || password.length < 8)
    return res.status(400).json({ error: 'Şifrə ən azı 8 simvol olmalıdır' });
  if (!name || name.trim().length < 2)
    return res.status(400).json({ error: 'Adını daxil et' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Bu e-poçt artıq qeydiyyatdan keçib' });

  const passwordHash = await hashPassword(password);
  const result = db.prepare(
    'INSERT INTO users (email, password_hash, name, is_tutor, email_verified) VALUES (?, ?, ?, ?, 0)'
  ).run(email.toLowerCase(), passwordHash, name.trim(), isTutor ? 1 : 0);

  const userId = Number(result.lastInsertRowid);

  if (isTutor) {
    db.prepare(
      `INSERT INTO tutor_profiles (user_id, is_hidden, verification_status) VALUES (?, 1, 'unverified')`
    ).run(userId);
  }

  // Create verification token (expires in 24 hours)
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)')
    .run(userId, token, expiresAt);

  // Send verification email (prints to console in dev mode)
  try {
    await sendVerificationEmail(email.toLowerCase(), name.trim(), token);
  } catch (e) {
    console.error('Email send error:', e.message);
  }

  // Log them in immediately — they can browse but we'll prompt to verify
  const sessionToken = signToken(userId);
  res.cookie('mentora_session', sessionToken, COOKIE_OPTS);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  res.status(201).json({
    user: publicUser(user),
    message: 'E-poçtuna doğrulama linki göndərildi'
  });
});

// VERIFY EMAIL
app.get('/api/auth/verify-email', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token tapılmadı' });

  const record = db.prepare(
    `SELECT * FROM email_verifications WHERE token = ? AND used_at IS NULL AND expires_at > datetime('now')`
  ).get(token);

  if (!record) return res.status(400).json({ error: 'Keçid etibarsız və ya müddəti bitib' });

  db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').run(record.user_id);
  db.prepare(`UPDATE email_verifications SET used_at = datetime('now') WHERE id = ?`).run(record.id);

  res.json({ ok: true, message: 'E-poçt uğurla təsdiqləndi!' });
});

// RESEND VERIFICATION EMAIL
app.post('/api/auth/resend-verification', requireAuth, async (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'İstifadəçi tapılmadı' });
  if (user.email_verified) return res.status(400).json({ error: 'E-poçt artıq təsdiqlənib' });

  // Delete old tokens
  db.prepare('DELETE FROM email_verifications WHERE user_id = ?').run(req.userId);

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)')
    .run(req.userId, token, expiresAt);

  try {
    await sendVerificationEmail(user.email, user.name, token);
  } catch (e) {
    console.error('Email send error:', e.message);
  }

  res.json({ ok: true, message: 'Doğrulama e-poçtu yenidən göndərildi' });
});

// FORGOT PASSWORD
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email))
    return res.status(400).json({ error: 'Düzgün e-poçt daxil et' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

  // Always return success to prevent email enumeration
  if (user) {
    db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(user.id);
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    db.prepare('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)')
      .run(user.id, token, expiresAt);
    try {
      await sendPasswordResetEmail(user.email, user.name, token);
    } catch (e) {
      console.error('Email send error:', e.message);
    }
  }

  res.json({ ok: true, message: 'E-poçtuna şifrə yeniləmə linki göndərildi (əgər hesab mövcuddursa)' });
});

// RESET PASSWORD
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 8)
    return res.status(400).json({ error: 'Token və ən azı 8 simvol olan şifrə tələb olunur' });

  const record = db.prepare(
    `SELECT * FROM password_resets WHERE token = ? AND used_at IS NULL AND expires_at > datetime('now')`
  ).get(token);

  if (!record) return res.status(400).json({ error: 'Keçid etibarsız və ya müddəti bitib' });

  const passwordHash = await hashPassword(password);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, record.user_id);
  db.prepare(`UPDATE password_resets SET used_at = datetime('now') WHERE id = ?`).run(record.id);

  res.json({ ok: true, message: 'Şifrə uğurla yeniləndi' });
});

// GOOGLE SIGN-IN
// How it works:
// 1. Frontend sends the Google ID token (from Google's OAuth flow)
// 2. We verify it with Google, extract email + name
// 3. If user exists → log them in; if not → create account and log them in
app.post('/api/auth/google', async (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(503).json({ error: 'Google giriş hələ aktiv deyil. GOOGLE_CLIENT_ID-i .env-ə əlavə et.' });
  }

  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Google token tapılmadı' });

  try {
    // Verify Google token by calling Google's tokeninfo endpoint
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const payload = await googleRes.json();

    if (payload.error || payload.aud !== GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: 'Etibarsız Google token' });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

    if (user) {
      // Update google_id and mark email as verified if not already
      db.prepare('UPDATE users SET google_id = ?, email_verified = 1, photo_url = COALESCE(photo_url, ?) WHERE id = ?')
        .run(googleId, picture || null, user.id);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    } else {
      // Create new user (Google users are auto-verified)
      const result = db.prepare(
        'INSERT INTO users (email, password_hash, name, is_tutor, email_verified, google_id, photo_url) VALUES (?, ?, ?, 0, 1, ?, ?)'
      ).run(email.toLowerCase(), '', name, googleId, picture || null);
      const userId = Number(result.lastInsertRowid);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }

    const token = signToken(user.id);
    res.cookie('mentora_session', token, COOKIE_OPTS);
    res.json({ user: publicUser(user) });

  } catch (e) {
    console.error('Google auth error:', e);
    res.status(500).json({ error: 'Google ilə giriş zamanı xəta baş verdi' });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'E-poçt və şifrə tələb olunur' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) return res.status(401).json({ error: 'E-poçt və ya şifrə yanlışdır' });

  // Google-only accounts have no password
  if (!user.password_hash) {
    return res.status(401).json({ error: 'Bu hesab Google ilə qeydiyyatdan keçib. Google ilə daxil ol.' });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'E-poçt və ya şifrə yanlışdır' });

  const token = signToken(user.id);
  res.cookie('mentora_session', token, COOKIE_OPTS);
  res.json({ user: publicUser(user) });
});

// LOGOUT
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('mentora_session', COOKIE_OPTS);
  res.json({ ok: true });
});

// GET ME
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'İstifadəçi tapılmadı' });
  res.json({ user: publicUser(user) });
});

// UPDATE ME
app.put('/api/auth/me', requireAuth, (req, res) => {
  const { name, city, photo_url } = req.body;
  if (name && name.trim().length < 2)
    return res.status(400).json({ error: 'Ad ən azı 2 simvol olmalıdır' });

  db.prepare(
    `UPDATE users SET name=COALESCE(?,name), city=COALESCE(?,city), photo_url=COALESCE(?,photo_url), updated_at=datetime('now') WHERE id=?`
  ).run(name?.trim() || null, city || null, photo_url || null, req.userId);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  res.json({ user: publicUser(user) });
});

// DELETE ACCOUNT
app.delete('/api/auth/me', requireAuth, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.userId);
  res.clearCookie('mentora_session', COOKIE_OPTS);
  res.json({ ok: true });
});

// ============ Feature routers ============
app.use('/api/tutors', require('./routes/tutors'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/sessions', require('./routes/sessions'));

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`Mentora backend running on http://localhost:${PORT}`);
  if (!process.env.RESEND_API_KEY) {
    console.log('💡 RESEND_API_KEY not set — emails will be printed to console (dev mode)');
  }
  if (!GOOGLE_CLIENT_ID) {
    console.log('💡 GOOGLE_CLIENT_ID not set — Google Sign-In disabled until configured');
  }
});

module.exports = app;
