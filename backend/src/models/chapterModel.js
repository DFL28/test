const db = require('./db');

const chapterModel = {
  // Buat chapter baru
  create(mangaId, chapterNumber, title, sourceUrl) {
    const stmt = db.prepare(`
      INSERT INTO chapters (manga_id, chapter_number, title, source_url)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(mangaId, chapterNumber, title, sourceUrl);
    return result.lastInsertRowid;
  },

  // Cari chapter berdasarkan ID
  findById(id) {
    const stmt = db.prepare('SELECT * FROM chapters WHERE id = ?');
    return stmt.get(id);
  },

  // Cari chapter berdasarkan manga_id dan chapter_number
  findByMangaAndNumber(mangaId, chapterNumber) {
    const stmt = db.prepare('SELECT * FROM chapters WHERE manga_id = ? AND chapter_number = ?');
    return stmt.get(mangaId, chapterNumber);
  },

  // Get semua chapter untuk manga tertentu
  getByMangaId(mangaId) {
    const stmt = db.prepare(`
      SELECT * FROM chapters
      WHERE manga_id = ?
      ORDER BY CAST(chapter_number AS REAL) ASC
    `);
    return stmt.all(mangaId);
  },

  // Get chapter count untuk manga
  getCountByMangaId(mangaId) {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM chapters WHERE manga_id = ?');
    const result = stmt.get(mangaId);
    return result.count;
  },

  // Get chapter terbaru untuk manga
  getLatestByMangaId(mangaId) {
    const stmt = db.prepare(`
      SELECT * FROM chapters
      WHERE manga_id = ?
      ORDER BY CAST(chapter_number AS REAL) DESC
      LIMIT 1
    `);
    return stmt.get(mangaId);
  },

  // Get previous chapter
  getPrevious(mangaId, currentChapterNumber) {
    const stmt = db.prepare(`
      SELECT * FROM chapters
      WHERE manga_id = ? AND CAST(chapter_number AS REAL) < CAST(? AS REAL)
      ORDER BY CAST(chapter_number AS REAL) DESC
      LIMIT 1
    `);
    return stmt.get(mangaId, currentChapterNumber);
  },

  // Get next chapter
  getNext(mangaId, currentChapterNumber) {
    const stmt = db.prepare(`
      SELECT * FROM chapters
      WHERE manga_id = ? AND CAST(chapter_number AS REAL) > CAST(? AS REAL)
      ORDER BY CAST(chapter_number AS REAL) ASC
      LIMIT 1
    `);
    return stmt.get(mangaId, currentChapterNumber);
  },

  // Cek apakah chapter sudah ada
  exists(mangaId, chapterNumber) {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM chapters
      WHERE manga_id = ? AND chapter_number = ?
    `);
    const result = stmt.get(mangaId, chapterNumber);
    return result.count > 0;
  },

  // Hapus chapter
  delete(id) {
    const stmt = db.prepare('DELETE FROM chapters WHERE id = ?');
    stmt.run(id);
  }
};

module.exports = chapterModel;
