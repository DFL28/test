const db = require('./db');

const sessionModel = {
  // Buat session baru
  create(userId, sessionToken, expiresAt) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO sessions (user_id, session_token, created_at, last_active_at, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(userId, sessionToken, now, now, expiresAt);
    return result.lastInsertRowid;
  },

  // Cari session berdasarkan token
  findByToken(sessionToken) {
    const stmt = db.prepare('SELECT * FROM sessions WHERE session_token = ?');
    return stmt.get(sessionToken);
  },

  // Update last_active_at
  updateLastActive(sessionToken) {
    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE sessions SET last_active_at = ? WHERE session_token = ?');
    stmt.run(now, sessionToken);
  },

  // Update expires_at (untuk sliding expiration)
  updateExpiresAt(sessionToken, newExpiresAt) {
    const stmt = db.prepare('UPDATE sessions SET expires_at = ? WHERE session_token = ?');
    stmt.run(newExpiresAt, sessionToken);
  },

  // Hapus session berdasarkan token
  deleteByToken(sessionToken) {
    const stmt = db.prepare('DELETE FROM sessions WHERE session_token = ?');
    stmt.run(sessionToken);
  },

  // Hapus semua session user (untuk force logout)
  deleteAllUserSessions(userId) {
    const stmt = db.prepare('DELETE FROM sessions WHERE user_id = ?');
    stmt.run(userId);
  },

  // Hapus session yang sudah expired
  deleteExpired() {
    const now = new Date().toISOString();
    const stmt = db.prepare('DELETE FROM sessions WHERE expires_at < ?');
    const result = stmt.run(now);
    return result.changes;
  },

  // Cek apakah session masih valid
  isValid(sessionToken) {
    const session = this.findByToken(sessionToken);
    if (!session) return false;

    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    return now < expiresAt;
  }
};

module.exports = sessionModel;
