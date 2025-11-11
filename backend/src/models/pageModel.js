const db = require('./db');

const pageModel = {
  // Buat page baru
  create(chapterId, pageNumber, imagePath) {
    const stmt = db.prepare(`
      INSERT INTO pages (chapter_id, page_number, image_path)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(chapterId, pageNumber, imagePath);
    return result.lastInsertRowid;
  },

  // Get semua pages untuk chapter tertentu
  getByChapterId(chapterId) {
    const stmt = db.prepare(`
      SELECT * FROM pages
      WHERE chapter_id = ?
      ORDER BY page_number ASC
    `);
    return stmt.all(chapterId);
  },

  // Get page count untuk chapter
  getCountByChapterId(chapterId) {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM pages WHERE chapter_id = ?');
    const result = stmt.get(chapterId);
    return result.count;
  },

  // Cek apakah page sudah ada
  exists(chapterId, pageNumber) {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM pages
      WHERE chapter_id = ? AND page_number = ?
    `);
    const result = stmt.get(chapterId, pageNumber);
    return result.count > 0;
  },

  // Hapus semua pages untuk chapter
  deleteByChapterId(chapterId) {
    const stmt = db.prepare('DELETE FROM pages WHERE chapter_id = ?');
    stmt.run(chapterId);
  },

  // Hapus page tertentu
  delete(id) {
    const stmt = db.prepare('DELETE FROM pages WHERE id = ?');
    stmt.run(id);
  }
};

module.exports = pageModel;
