const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { requireAuth } = require('../auth');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, safeName);
  },
});

const ALLOWED_TYPES = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB max
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_TYPES.includes(ext)) {
      return cb(new Error('Yalnız JPG, PNG, WEBP və ya PDF fayllarına icazə verilir'));
    }
    cb(null, true);
  },
});

// POST /api/uploads/file - generic authenticated file upload, returns a URL
router.post('/file', requireAuth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Fayl tapılmadı' });
    res.json({ url: `/uploads/${req.file.filename}`, originalName: req.file.originalname });
  });
});

module.exports = router;
