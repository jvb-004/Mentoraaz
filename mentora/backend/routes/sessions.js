const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../auth');
const crypto = require('crypto');

// GET /api/sessions/my — student's upcoming + completed sessions
router.get('/my', requireAuth, (req, res) => {
  const upcoming = db.prepare(`
    SELECT s.*, u.name as tutor_name, u.photo_url as tutor_photo
    FROM sessions s
    JOIN users u ON u.id = s.tutor_id
    WHERE s.student_id = ? AND s.status = 'upcoming'
    ORDER BY s.start_time ASC
  `).all(req.userId);

  const completed = db.prepare(`
    SELECT s.*, u.name as tutor_name
    FROM sessions s
    JOIN users u ON u.id = s.tutor_id
    WHERE s.student_id = ? AND s.status = 'completed'
    ORDER BY s.start_time DESC
  `).all(req.userId);

  const totalMinutes = completed.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  const hoursLearned = Math.round((totalMinutes / 60) * 10) / 10;

  res.json({ upcoming, completed, hoursLearned });
});

// POST /api/sessions — book a session (tutor or admin creates)
router.post('/', requireAuth, (req, res) => {
  const { student_id, tutor_id, subject, start_time, duration_minutes } = req.body;
  if (!student_id || !tutor_id || !subject || !start_time)
    return res.status(400).json({ error: 'Bütün sahələr tələb olunur' });

  // Auto-generate a Jitsi room ID
  const jitsi_room_id = 'mentora-' + crypto.randomBytes(8).toString('hex');

  const result = db.prepare(`
    INSERT INTO sessions (student_id, tutor_id, subject, start_time, duration_minutes, status, jitsi_room_id)
    VALUES (?, ?, ?, ?, ?, 'upcoming', ?)
  `).run(student_id, tutor_id, subject, start_time, duration_minutes || 60, jitsi_room_id);

  res.status(201).json({ id: Number(result.lastInsertRowid), jitsi_room_id });
});

// POST /api/sessions/:id/complete — mark a session as completed
router.post('/:id/complete', requireAuth, (req, res) => {
  db.prepare(`UPDATE sessions SET status = 'completed' WHERE id = ?`).run(req.params.id);
  res.json({ ok: true });
});

// Seed demo sessions for a user (useful for testing — only creates if none exist)
router.post('/seed-demo', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT COUNT(*) as c FROM sessions WHERE student_id = ?').get(req.userId).c;
  if (existing > 0) return res.json({ ok: true, message: 'Demo sessions already exist' });

  // Find any tutor
  const tutor = db.prepare(`SELECT u.id, u.name FROM users u JOIN tutor_profiles tp ON tp.user_id = u.id LIMIT 1`).get();
  if (!tutor) return res.status(404).json({ error: 'No tutors found. Sign up as a tutor first.' });

  const now = new Date();

  // Upcoming session: tomorrow at 7pm
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);

  // Upcoming session 2: in 3 days
  const in3Days = new Date(now);
  in3Days.setDate(in3Days.getDate() + 3);
  in3Days.setHours(16, 30, 0, 0);

  // Completed session: yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(10, 0, 0, 0);

  const sessions = [
    { subject: 'İngilis dili (IELTS)', start_time: tomorrow.toISOString(), duration_minutes: 60, status: 'upcoming' },
    { subject: 'Riyaziyyat (SAT)', start_time: in3Days.toISOString(), duration_minutes: 90, status: 'upcoming' },
    { subject: 'İngilis dili', start_time: yesterday.toISOString(), duration_minutes: 60, status: 'completed' },
  ];

  for (const s of sessions) {
    const room = 'mentora-' + crypto.randomBytes(8).toString('hex');
    db.prepare(`
      INSERT INTO sessions (student_id, tutor_id, subject, start_time, duration_minutes, status, jitsi_room_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.userId, tutor.id, s.subject, s.start_time, s.duration_minutes, s.status, room);
  }

  res.json({ ok: true, message: 'Demo sessions created' });
});

module.exports = router;
