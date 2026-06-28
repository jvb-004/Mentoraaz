const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const { hashPassword, verifyPassword, signToken, requireAuth, optionalAuth } = require('./auth');

const app = express();
const PORT = process.env.PORT || 4000;
const IS_PROD = process.env.NODE_ENV === 'production';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Static file serving for uploaded credentials/photos
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR));

const COOKIE_OPTS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// ---------- validation helpers ----------
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function publicUser(row) {
  if (!row) return null;
  const { password_hash, ...rest } = row;
  return rest;
}

// ============ AUTH ROUTES ============

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name, isTutor } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Düzgün e-poçt ünvanı daxil et' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Şifrə ən azı 8 simvol olmalıdır' });
  }
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Adını daxil et' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Bu e-poçt artıq qeydiyyatdan keçib' });
  }

  const passwordHash = await hashPassword(password);
  const result = db.prepare(
    'INSERT INTO users (email, password_hash, name, is_tutor) VALUES (?, ?, ?, ?)'
  ).run(email.toLowerCase(), passwordHash, name.trim(), isTutor ? 1 : 0);

  const userId = Number(result.lastInsertRowid);

  // If signing up as tutor, create the (hidden) tutor profile immediately
  if (isTutor) {
    db.prepare(
      `INSERT INTO tutor_profiles (user_id, is_hidden, verification_status) VALUES (?, 1, 'unverified')`
    ).run(userId);
  }

  const token = signToken(userId);
  res.cookie('mentora_session', token, COOKIE_OPTS);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  res.status(201).json({ user: publicUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-poçt və şifrə tələb olunur' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'E-poçt və ya şifrə yanlışdır' });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'E-poçt və ya şifrə yanlışdır' });
  }

  const token = signToken(user.id);
  res.cookie('mentora_session', token, COOKIE_OPTS);
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('mentora_session', COOKIE_OPTS);
  res.json({ ok: true });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'İstifadəçi tapılmadı' });
  res.json({ user: publicUser(user) });
});

// ============ Mount feature routers ============
app.use('/api/tutors', require('./routes/tutors'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/admin', require('./routes/admin'));

// Update own account (name, city, photo)
app.put('/api/auth/me', requireAuth, (req, res) => {
  const { name, city, photo_url } = req.body;
  if (name && name.trim().length < 2) {
    return res.status(400).json({ error: 'Ad ən azı 2 simvol olmalıdır' });
  }
  db.prepare(`UPDATE users SET name=COALESCE(?,name), city=COALESCE(?,city), photo_url=COALESCE(?,photo_url), updated_at=datetime('now') WHERE id=?`)
    .run(name?.trim()||null, city||null, photo_url||null, req.userId);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  res.json({ user: publicUser(user) });
});

// Account deletion - real, immediate, removes personal data (legal requirement)
app.delete('/api/auth/me', requireAuth, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.userId); // cascades via foreign keys
  res.clearCookie('mentora_session', COOKIE_OPTS);
  res.json({ ok: true });
});

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`Mentora backend running on http://localhost:${PORT}`);
});

module.exports = app;
