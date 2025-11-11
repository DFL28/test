const Database = require('better-sqlite3');
const path = require('path');
const config = require('../../config');

// Inisialisasi database
const dbPath = path.resolve(__dirname, '../../db/manga.db');
const db = new Database(dbPath);

// Enable WAL mode untuk performa lebih baik
db.pragma('journal_mode = WAL');

// Fungsi untuk inisialisasi semua tabel
function initDatabase() {
  // Tabel users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      avatar_path TEXT,
      status TEXT DEFAULT 'aktif',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabel sessions
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      created_at DATETIME NOT NULL,
      last_active_at DATETIME NOT NULL,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Index untuk session_token
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_session_token ON sessions(session_token)
  `);

  // Tabel manga
  db.exec(`
    CREATE TABLE IF NOT EXISTS manga (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      cover_path TEXT NOT NULL,
      source_name TEXT NOT NULL,
      status TEXT,
      description TEXT,
      genres_text TEXT,
      content_type TEXT,
      type TEXT,
      is_color INTEGER DEFAULT 0,
      popularity INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Index untuk slug dan pencarian
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_manga_slug ON manga(slug)
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_manga_title ON manga(title)
  `);

  // Tabel chapters
  db.exec(`
    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      manga_id INTEGER NOT NULL,
      chapter_number TEXT NOT NULL,
      title TEXT,
      source_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE,
      UNIQUE(manga_id, chapter_number)
    )
  `);

  // Index untuk chapter queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_chapters_manga ON chapters(manga_id)
  `);

  // Tabel pages
  db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id INTEGER NOT NULL,
      page_number INTEGER NOT NULL,
      image_path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
      UNIQUE(chapter_id, page_number)
    )
  `);

  // Index untuk page queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_pages_chapter ON pages(chapter_id)
  `);

  // Tabel comments
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      manga_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      parent_id INTEGER,
      status TEXT DEFAULT 'aktif',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
    )
  `);

  // Index untuk comment queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_comments_manga ON comments(manga_id)
  `);

  // Tabel reset_tokens
  db.exec(`
    CREATE TABLE IF NOT EXISTS reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Index untuk token lookup
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_reset_token ON reset_tokens(token)
  `);

  console.log('✓ Database tables initialized');
}

// Jalankan inisialisasi
initDatabase();

module.exports = db;
