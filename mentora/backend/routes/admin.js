const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../auth');

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

function requireAdmin(req, res, next) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return res.status(403).json({ error: 'Admin girişi tələb olunur' });
  }
  next();
}

router.get('/pending-credentials', requireAuth, requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT cr.*, tp.id as tutor_id, u.name as tutor_name, u.email as tutor_email
    FROM credentials cr
    JOIN tutor_profiles tp ON tp.id = cr.tutor_id
    JOIN users u ON u.id = tp.user_id
    WHERE cr.review_status = 'pending'
    ORDER BY cr.created_at ASC
  `).all();
  res.json({ credentials: rows });
});

router.post('/credentials/:id/approve', requireAuth, requireAdmin, (req, res) => {
  const cred = db.prepare('SELECT * FROM credentials WHERE id = ?').get(req.params.id);
  if (!cred) return res.status(404).json({ error: 'Sənəd tapılmadı' });

  db.prepare(`UPDATE credentials SET review_status = 'approved', reviewer_note = ? WHERE id = ?`)
    .run(req.body.note || null, cred.id);

  const approvedCount = db.prepare(
    `SELECT COUNT(*) as c FROM credentials WHERE tutor_id = ? AND review_status = 'approved'`
  ).get(cred.tutor_id).c;

  if (approvedCount > 0) {
    db.prepare(
      `UPDATE tutor_profiles SET verification_status = 'verified', is_hidden = 0 WHERE id = ?`
    ).run(cred.tutor_id);
  }

  res.json({ ok: true });
});

router.post('/credentials/:id/reject', requireAuth, requireAdmin, (req, res) => {
  const cred = db.prepare('SELECT * FROM credentials WHERE id = ?').get(req.params.id);
  if (!cred) return res.status(404).json({ error: 'Sənəd tapılmadı' });

  db.prepare(`UPDATE credentials SET review_status = 'rejected', reviewer_note = ? WHERE id = ?`)
    .run(req.body.note || 'Sənəd qəbul olunmadı', cred.id);

  res.json({ ok: true });
});

router.get('/reports', requireAuth, requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT r.*, u.name as reporter_name, t.name as target_name
    FROM reports r
    JOIN users u ON u.id = r.reporter_id
    LEFT JOIN users t ON t.id = r.target_user_id
    WHERE r.status = 'open'
    ORDER BY r.created_at ASC
  `).all();
  res.json({ reports: rows });
});

router.get('/stats', requireAuth, requireAdmin, (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const totalTutors = db.prepare('SELECT COUNT(*) as c FROM tutor_profiles').get().c;
  const verifiedTutors = db.prepare(`SELECT COUNT(*) as c FROM tutor_profiles WHERE verification_status = 'verified'`).get().c;
  const pendingCredentials = db.prepare(`SELECT COUNT(*) as c FROM credentials WHERE review_status = 'pending'`).get().c;
  const totalMessages = db.prepare('SELECT COUNT(*) as c FROM messages').get().c;
  const activeSubs = db.prepare(`SELECT COUNT(*) as c FROM subscriptions WHERE status = 'active'`).get().c;

  res.json({ totalUsers, totalTutors, verifiedTutors, pendingCredentials, totalMessages, activeSubs });
});

module.exports = router;
