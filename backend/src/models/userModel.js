const db = require('./db');

const userModel = {
  // Buat user baru
  create(username, email, passwordHash) {
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash, is_admin, status)
      VALUES (?, ?, ?, 0, 'aktif')
    `);
    const result = stmt.run(username, email, passwordHash);
    return result.lastInsertRowid;
  },

  // Cari user berdasarkan email
  findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  // Cari user berdasarkan username
  findByUsername(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  },

  // Cari user berdasarkan email atau username
  findByEmailOrUsername(identifier) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?');
    return stmt.get(identifier, identifier);
  },

  // Cari user berdasarkan ID
  findById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  // Update avatar
  updateAvatar(userId, avatarPath) {
    const stmt = db.prepare('UPDATE users SET avatar_path = ? WHERE id = ?');
    stmt.run(avatarPath, userId);
  },

  // Update password
  updatePassword(userId, newPasswordHash) {
    const stmt = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    stmt.run(newPasswordHash, userId);
  },

  // Ban user
  banUser(userId) {
    const stmt = db.prepare("UPDATE users SET status = 'banned' WHERE id = ?");
    stmt.run(userId);
  },

  // Unban user
  unbanUser(userId) {
    const stmt = db.prepare("UPDATE users SET status = 'aktif' WHERE id = ?");
    stmt.run(userId);
  },

  // Cek apakah email sudah ada
  emailExists(email) {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?');
    const result = stmt.get(email);
    return result.count > 0;
  },

  // Cek apakah username sudah ada
  usernameExists(username) {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?');
    const result = stmt.get(username);
    return result.count > 0;
  }
};

module.exports = userModel;
