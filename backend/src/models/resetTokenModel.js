const db = require('./db');

const resetTokenModel = {
  // Buat reset token baru
  create(userId, token, expiresAt) {
    const stmt = db.prepare(`
      INSERT INTO reset_tokens (user_id, token, expires_at, used)
      VALUES (?, ?, ?, 0)
    `);
    const result = stmt.run(userId, token, expiresAt);
    return result.lastInsertRowid;
  },

  // Cari token berdasarkan token string
  findByToken(token) {
    const stmt = db.prepare('SELECT * FROM reset_tokens WHERE token = ?');
    return stmt.get(token);
  },

  // Validasi token (cek exists, not used, not expired)
  isValid(token) {
    const stmt = db.prepare(`
      SELECT * FROM reset_tokens
      WHERE token = ? AND used = 0 AND expires_at > datetime('now')
    `);
    const result = stmt.get(token);
    return result !== undefined;
  },

  // Mark token sebagai used
  markAsUsed(token) {
    const stmt = db.prepare('UPDATE reset_tokens SET used = 1 WHERE token = ?');
    stmt.run(token);
  },

  // Hapus token expired dan used
  cleanupOld() {
    const stmt = db.prepare(`
      DELETE FROM reset_tokens
      WHERE used = 1 OR expires_at < datetime('now')
    `);
    const result = stmt.run();
    return result.changes;
  },

  // Hapus semua token untuk user tertentu
  deleteByUserId(userId) {
    const stmt = db.prepare('DELETE FROM reset_tokens WHERE user_id = ?');
    stmt.run(userId);
  }
};

module.exports = resetTokenModel;
