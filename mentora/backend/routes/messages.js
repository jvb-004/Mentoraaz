const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../auth');

function getOrCreateConversation(userA, userB) {
  const [a, b] = [userA, userB].sort((x, y) => x - y);
  let convo = db.prepare(
    'SELECT * FROM conversations WHERE user_a_id = ? AND user_b_id = ?'
  ).get(a, b);

  if (!convo) {
    const result = db.prepare(
      'INSERT INTO conversations (user_a_id, user_b_id) VALUES (?, ?)'
    ).run(a, b);
    convo = db.prepare('SELECT * FROM conversations WHERE id = ?').get(Number(result.lastInsertRowid));
  }
  return convo;
}

// GET /api/messages/conversations - list my conversations with last message preview
router.get('/conversations', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT c.*,
      CASE WHEN c.user_a_id = ? THEN c.user_b_id ELSE c.user_a_id END as other_user_id
    FROM conversations c
    WHERE c.user_a_id = ? OR c.user_b_id = ?
  `).all(req.userId, req.userId, req.userId);

  const result = rows.map(c => {
    const other = db.prepare('SELECT id, name, photo_url FROM users WHERE id = ?').get(c.other_user_id);
    const lastMsg = db.prepare(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1'
    ).get(c.id);
    const unreadCount = db.prepare(
      `SELECT COUNT(*) as c FROM messages WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL`
    ).get(c.id, req.userId).c;

    return { conversationId: c.id, otherUser: other, lastMessage: lastMsg, unreadCount };
  }).sort((x, y) => {
    const tx = x.lastMessage ? new Date(x.lastMessage.created_at) : 0;
    const ty = y.lastMessage ? new Date(y.lastMessage.created_at) : 0;
    return ty - tx;
  });

  res.json({ conversations: result });
});

// POST /api/messages/conversations/start - start (or get) a conversation with another user
router.post('/conversations/start', requireAuth, (req, res) => {
  const { otherUserId } = req.body;
  if (!otherUserId) return res.status(400).json({ error: 'İstifadəçi ID tələb olunur' });
  if (Number(otherUserId) === req.userId) return res.status(400).json({ error: 'Özünə mesaj yaza bilməzsən' });

  const otherUser = db.prepare('SELECT id FROM users WHERE id = ?').get(otherUserId);
  if (!otherUser) return res.status(404).json({ error: 'İstifadəçi tapılmadı' });

  const convo = getOrCreateConversation(req.userId, Number(otherUserId));
  res.json({ conversationId: convo.id });
});

// GET /api/messages/conversations/:id - get messages in a conversation (must be a participant)
router.get('/conversations/:id', requireAuth, (req, res) => {
  const convo = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id);
  if (!convo) return res.status(404).json({ error: 'Söhbət tapılmadı' });
  if (convo.user_a_id !== req.userId && convo.user_b_id !== req.userId) {
    return res.status(403).json({ error: 'Bu söhbətə girişin yoxdur' });
  }

  const messages = db.prepare(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
  ).all(req.params.id);

  db.prepare(
    `UPDATE messages SET read_at = datetime('now') WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL`
  ).run(req.params.id, req.userId);

  const otherUserId = convo.user_a_id === req.userId ? convo.user_b_id : convo.user_a_id;
  const otherUser = db.prepare('SELECT id, name, photo_url FROM users WHERE id = ?').get(otherUserId);

  res.json({ messages, otherUser });
});

function looksLikeEarlyContactRequest(text) {
  const patterns = /(\+?\d[\d\s\-\(\)]{6,}\d)|whatsapp|telegram|instagram|@gmail|@mail|nömrə|nomre/i;
  return patterns.test(text);
}

// POST /api/messages/conversations/:id - send a message
router.post('/conversations/:id', requireAuth, (req, res) => {
  const convo = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id);
  if (!convo) return res.status(404).json({ error: 'Söhbət tapılmadı' });
  if (convo.user_a_id !== req.userId && convo.user_b_id !== req.userId) {
    return res.status(403).json({ error: 'Bu söhbətə girişin yoxdur' });
  }

  const { body, attachment_url } = req.body;
  if (!body && !attachment_url) return res.status(400).json({ error: 'Mesaj boş ola bilməz' });

  const result = db.prepare(
    'INSERT INTO messages (conversation_id, sender_id, body, attachment_url) VALUES (?, ?, ?, ?)'
  ).run(req.params.id, req.userId, body || null, attachment_url || null);

  const messageCount = db.prepare('SELECT COUNT(*) as c FROM messages WHERE conversation_id = ?').get(req.params.id).c;
  const earlyFlag = messageCount <= 3 && body && looksLikeEarlyContactRequest(body);

  const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(Number(result.lastInsertRowid));
  res.status(201).json({ message, safetyNotice: earlyFlag ? 'early_contact_request' : null });
});

// POST /api/messages/conversations/:id/report - report the other user in this conversation
router.post('/conversations/:id/report', requireAuth, (req, res) => {
  const convo = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id);
  if (!convo) return res.status(404).json({ error: 'Söhbət tapılmadı' });
  if (convo.user_a_id !== req.userId && convo.user_b_id !== req.userId) {
    return res.status(403).json({ error: 'Bu söhbətə girişin yoxdur' });
  }

  const { reason, details } = req.body;
  if (!reason) return res.status(400).json({ error: 'Şikayət səbəbi tələb olunur' });

  const targetUserId = convo.user_a_id === req.userId ? convo.user_b_id : convo.user_a_id;

  db.prepare(`
    INSERT INTO reports (reporter_id, target_user_id, conversation_id, reason, details)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.userId, targetUserId, convo.id, reason, details || null);

  res.status(201).json({ ok: true });
});

module.exports = router;
