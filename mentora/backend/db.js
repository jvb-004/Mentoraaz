const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, 'mentora.db');
const db = new DatabaseSync(DB_PATH);

// Pragmas for sane defaults
db.exec('PRAGMA foreign_keys = ON;');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      photo_url TEXT,
      city TEXT DEFAULT 'Bakı',
      is_tutor INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tutor_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      headline TEXT,
      bio TEXT,
      price_amount REAL,
      price_unit TEXT DEFAULT 'saat',   -- 'saat' (hour) or 'dərs' (lesson)
      district TEXT,
      offers_online INTEGER DEFAULT 0,
      offers_in_person INTEGER DEFAULT 1,
      verification_status TEXT DEFAULT 'unverified', -- unverified | pending | verified | rejected
      is_hidden INTEGER DEFAULT 1, -- hidden from search until verified=1 (locked-in decision)
      avg_rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      profile_views INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name_az TEXT NOT NULL,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS tutor_subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tutor_id INTEGER NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      subject_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tutor_id INTEGER NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
      type TEXT NOT NULL,         -- 'diploma' | 'certificate' | 'link' | 'work_history'
      title TEXT NOT NULL,
      file_url TEXT,              -- for uploaded docs
      external_url TEXT,          -- for linked proof (LinkedIn etc)
      review_status TEXT DEFAULT 'pending', -- pending | approved | rejected
      reviewer_note TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tutor_id INTEGER NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
      reviewer_user_id INTEGER NOT NULL REFERENCES users(id),
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_a_id INTEGER NOT NULL REFERENCES users(id),
      user_b_id INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_a_id, user_b_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id INTEGER NOT NULL REFERENCES users(id),
      body TEXT,
      attachment_url TEXT,
      read_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS boosts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tutor_id INTEGER NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
      starts_at TEXT DEFAULT (datetime('now')),
      ends_at TEXT NOT NULL,
      stripe_payment_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT DEFAULT 'pro',
      status TEXT DEFAULT 'active', -- active | canceled | past_due
      stripe_subscription_id TEXT,
      current_period_end TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_id INTEGER NOT NULL REFERENCES users(id),
      target_user_id INTEGER REFERENCES users(id),
      conversation_id INTEGER REFERENCES conversations(id),
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'open', -- open | reviewed | dismissed
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_tutor_subjects_tutor ON tutor_subjects(tutor_id);
    CREATE INDEX IF NOT EXISTS idx_tutor_subjects_cat ON tutor_subjects(category_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_credentials_tutor ON credentials(tutor_id);
  `);

  // Seed categories if empty
  const count = db.prepare('SELECT COUNT(*) as c FROM categories').get();
  if (count.c === 0) {
    const insert = db.prepare('INSERT INTO categories (slug, name_az, icon) VALUES (?, ?, ?)');
    insert.run('akademik', 'Akademik', '📘');
    insert.run('idman', 'İdman', '🥊');
    insert.run('incesenet', 'İncəsənət', '🎨');
    insert.run('dil', 'Dil', '🗣');
  }
}

migrate();

module.exports = db;
