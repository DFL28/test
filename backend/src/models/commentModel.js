const db = require('./db');

const commentModel = {
  // Buat comment baru
  create(mangaId, userId, content, parentId = null) {
    const stmt = db.prepare(`
      INSERT INTO comments (manga_id, user_id, content, parent_id, status)
      VALUES (?, ?, ?, ?, 'aktif')
    `);
    const result = stmt.run(mangaId, userId, content, parentId);
    return result.lastInsertRowid;
  },

  // Get semua comments untuk manga (hanya parent comments)
  getByMangaId(mangaId) {
    const stmt = db.prepare(`
      SELECT c.*, u.username, u.avatar_path
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.manga_id = ? AND c.parent_id IS NULL AND c.status = 'aktif'
      ORDER BY c.created_at DESC
    `);
    return stmt.all(mangaId);
  },

  // Get replies untuk comment tertentu
  getReplies(parentId) {
    const stmt = db.prepare(`
      SELECT c.*, u.username, u.avatar_path
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.parent_id = ? AND c.status = 'aktif'
      ORDER BY c.created_at ASC
    `);
    return stmt.all(parentId);
  },

  // Get comment count untuk manga (hanya yang aktif)
  getCountByMangaId(mangaId) {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM comments
      WHERE manga_id = ? AND status = 'aktif'
    `);
    const result = stmt.get(mangaId);
    return result.count;
  },

  // Get comment berdasarkan ID
  findById(id) {
    const stmt = db.prepare('SELECT * FROM comments WHERE id = ?');
    return stmt.get(id);
  },

  // Soft delete comment (set status = 'dihapus')
  softDelete(id) {
    const stmt = db.prepare("UPDATE comments SET status = 'dihapus' WHERE id = ?");
    stmt.run(id);
  },

  // Hard delete comment
  delete(id) {
    const stmt = db.prepare('DELETE FROM comments WHERE id = ?');
    stmt.run(id);
  },

  // Get all comments dengan replies (untuk admin dashboard)
  getAllWithDetails(limit = 50, offset = 0) {
    const stmt = db.prepare(`
      SELECT c.*, u.username, m.title as manga_title
      FROM comments c
      JOIN users u ON c.user_id = u.id
      JOIN manga m ON c.manga_id = m.id
      WHERE c.status = 'aktif'
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset);
  }
};

module.exports = commentModel;
