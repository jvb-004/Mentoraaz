const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth, optionalAuth } = require('../auth');

// ============ SEARCH / BROWSE (public) ============
router.get('/', (req, res) => {
  const { category, q, online, district, minPrice, maxPrice } = req.query;

  let sql = `
    SELECT tp.*, u.name, u.photo_url, u.city,
      EXISTS(SELECT 1 FROM boosts b WHERE b.tutor_id = tp.id AND b.ends_at > datetime('now')) AS is_boosted
    FROM tutor_profiles tp
    JOIN users u ON u.id = tp.user_id
    WHERE tp.is_hidden = 0 AND tp.verification_status = 'verified'
  `;
  const params = [];

  if (category) {
    sql += ` AND tp.id IN (SELECT tutor_id FROM tutor_subjects ts JOIN categories c ON c.id = ts.category_id WHERE c.slug = ?)`;
    params.push(category);
  }
  if (q) {
    sql += ` AND (tp.headline LIKE ? OR tp.bio LIKE ? OR u.name LIKE ? OR tp.id IN (SELECT tutor_id FROM tutor_subjects WHERE subject_name LIKE ?))`;
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  if (online === '1') sql += ` AND tp.offers_online = 1`;
  if (district) { sql += ` AND tp.district = ?`; params.push(district); }
  if (minPrice) { sql += ` AND tp.price_amount >= ?`; params.push(Number(minPrice)); }
  if (maxPrice) { sql += ` AND tp.price_amount <= ?`; params.push(Number(maxPrice)); }

  sql += ` ORDER BY is_boosted DESC, tp.avg_rating DESC, tp.review_count DESC LIMIT 50`;

  const rows = db.prepare(sql).all(...params);

  const subjStmt = db.prepare(`
    SELECT ts.subject_name, c.slug as category_slug, c.name_az as category_name
    FROM tutor_subjects ts JOIN categories c ON c.id = ts.category_id
    WHERE ts.tutor_id = ?
  `);
  const result = rows.map(r => ({ ...r, subjects: subjStmt.all(r.id) }));

  res.json({ tutors: result, count: result.length });
});

router.get('/categories', (req, res) => {
  const cats = db.prepare('SELECT * FROM categories ORDER BY id').all();
  res.json({ categories: cats });
});

// ============ TUTOR SELF-MANAGEMENT (auth required) ============
// NOTE: these specific routes must be declared BEFORE the /:id catch-all below

router.get('/me/profile', requireAuth, (req, res) => {
  const tutor = db.prepare('SELECT * FROM tutor_profiles WHERE user_id = ?').get(req.userId);
  if (!tutor) return res.status(404).json({ error: 'Mütəxəssis profili yoxdur' });

  const subjects = db.prepare(`
    SELECT ts.id, ts.subject_name, c.slug as category_slug, c.name_az as category_name
    FROM tutor_subjects ts JOIN categories c ON c.id = ts.category_id WHERE ts.tutor_id = ?
  `).all(tutor.id);

  const credentials = db.prepare('SELECT * FROM credentials WHERE tutor_id = ?').all(tutor.id);

  res.json({ tutor: { ...tutor, subjects, credentials } });
});

router.put('/me/profile', requireAuth, (req, res) => {
  const tutor = db.prepare('SELECT * FROM tutor_profiles WHERE user_id = ?').get(req.userId);
  if (!tutor) return res.status(404).json({ error: 'Mütəxəssis profili yoxdur' });

  const { headline, bio, price_amount, price_unit, district, offers_online, offers_in_person } = req.body;

  db.prepare(`
    UPDATE tutor_profiles SET
      headline = COALESCE(?, headline),
      bio = COALESCE(?, bio),
      price_amount = COALESCE(?, price_amount),
      price_unit = COALESCE(?, price_unit),
      district = COALESCE(?, district),
      offers_online = COALESCE(?, offers_online),
      offers_in_person = COALESCE(?, offers_in_person),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    headline ?? null, bio ?? null, price_amount ?? null, price_unit ?? null,
    district ?? null, offers_online === undefined ? null : (offers_online ? 1 : 0),
    offers_in_person === undefined ? null : (offers_in_person ? 1 : 0),
    tutor.id
  );

  const updated = db.prepare('SELECT * FROM tutor_profiles WHERE id = ?').get(tutor.id);
  res.json({ tutor: updated });
});

router.post('/me/subjects', requireAuth, (req, res) => {
  const tutor = db.prepare('SELECT * FROM tutor_profiles WHERE user_id = ?').get(req.userId);
  if (!tutor) return res.status(404).json({ error: 'Mütəxəssis profili yoxdur' });

  const { category_slug, subject_name } = req.body;
  if (!category_slug || !subject_name) {
    return res.status(400).json({ error: 'Kateqoriya və fənn adı tələb olunur' });
  }

  const category = db.prepare('SELECT id FROM categories WHERE slug = ?').get(category_slug);
  if (!category) return res.status(400).json({ error: 'Yanlış kateqoriya' });

  const result = db.prepare(
    'INSERT INTO tutor_subjects (tutor_id, category_id, subject_name) VALUES (?, ?, ?)'
  ).run(tutor.id, category.id, subject_name.trim());

  res.status(201).json({ id: Number(result.lastInsertRowid), category_slug, subject_name });
});

router.delete('/me/subjects/:subjectId', requireAuth, (req, res) => {
  const tutor = db.prepare('SELECT * FROM tutor_profiles WHERE user_id = ?').get(req.userId);
  if (!tutor) return res.status(404).json({ error: 'Mütəxəssis profili yoxdur' });

  db.prepare('DELETE FROM tutor_subjects WHERE id = ? AND tutor_id = ?').run(req.params.subjectId, tutor.id);
  res.json({ ok: true });
});

router.post('/me/credentials', requireAuth, (req, res) => {
  const tutor = db.prepare('SELECT * FROM tutor_profiles WHERE user_id = ?').get(req.userId);
  if (!tutor) return res.status(404).json({ error: 'Mütəxəssis profili yoxdur' });

  const { type, title, file_url, external_url } = req.body;
  if (!type || !title) return res.status(400).json({ error: 'Növ və başlıq tələb olunur' });
  if (!file_url && !external_url) return res.status(400).json({ error: 'Fayl və ya keçid tələb olunur' });

  const result = db.prepare(`
    INSERT INTO credentials (tutor_id, type, title, file_url, external_url, review_status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(tutor.id, type, title, file_url || null, external_url || null);

  db.prepare(`
    UPDATE tutor_profiles SET verification_status = 
      CASE WHEN verification_status = 'unverified' THEN 'pending' ELSE verification_status END
    WHERE id = ?
  `).run(tutor.id);

  res.status(201).json({ id: Number(result.lastInsertRowid) });
});

// ============ PUBLIC PROFILE VIEW (catch-all, must be after /me routes) ============

router.get('/:id', optionalAuth, (req, res) => {
  const tutor = db.prepare(`
    SELECT tp.*, u.name, u.photo_url, u.city
    FROM tutor_profiles tp JOIN users u ON u.id = tp.user_id
    WHERE tp.id = ?
  `).get(req.params.id);

  if (!tutor) return res.status(404).json({ error: 'Profil tapılmadı' });

  if (tutor.is_hidden && tutor.user_id !== req.userId) {
    return res.status(404).json({ error: 'Profil tapılmadı' });
  }

  const subjects = db.prepare(`
    SELECT ts.subject_name, c.slug as category_slug, c.name_az as category_name
    FROM tutor_subjects ts JOIN categories c ON c.id = ts.category_id
    WHERE ts.tutor_id = ?
  `).all(tutor.id);

  const credentials = db.prepare(`
    SELECT id, type, title, file_url, external_url, review_status, created_at
    FROM credentials WHERE tutor_id = ? AND review_status = 'approved'
  `).all(tutor.id);

  const reviews = db.prepare(`
    SELECT r.rating, r.comment, r.created_at, u.name as reviewer_name
    FROM reviews r JOIN users u ON u.id = r.reviewer_user_id
    WHERE r.tutor_id = ? ORDER BY r.created_at DESC LIMIT 20
  `).all(tutor.id);

  if (tutor.user_id !== req.userId) {
    db.prepare('UPDATE tutor_profiles SET profile_views = profile_views + 1 WHERE id = ?').run(tutor.id);
  }

  res.json({ tutor: { ...tutor, subjects, credentials, reviews } });
});

router.post('/:id/reviews', requireAuth, (req, res) => {
  const tutorId = req.params.id;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: '1-5 arası reytinq seç' });
  }

  const tutor = db.prepare('SELECT * FROM tutor_profiles WHERE id = ?').get(tutorId);
  if (!tutor) return res.status(404).json({ error: 'Profil tapılmadı' });

  const convo = db.prepare(`
    SELECT id FROM conversations
    WHERE (user_a_id = ? AND user_b_id = ?) OR (user_a_id = ? AND user_b_id = ?)
  `).get(req.userId, tutor.user_id, tutor.user_id, req.userId);

  if (!convo) {
    return res.status(403).json({ error: 'Yalnız əlaqə saxladığın mütəxəssisə rəy yaza bilərsən' });
  }

  db.prepare('INSERT INTO reviews (tutor_id, reviewer_user_id, rating, comment) VALUES (?, ?, ?, ?)')
    .run(tutorId, req.userId, rating, comment || null);

  const agg = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE tutor_id = ?').get(tutorId);
  db.prepare('UPDATE tutor_profiles SET avg_rating = ?, review_count = ? WHERE id = ?')
    .run(agg.avg, agg.cnt, tutorId);

  res.status(201).json({ ok: true });
});

module.exports = router;
