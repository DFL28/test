const db = require('./db');

const mangaModel = {
  // Buat manga baru
  create(data) {
    const stmt = db.prepare(`
      INSERT INTO manga (title, slug, cover_path, source_name, status, description,
                         genres_text, content_type, type, is_color, popularity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.title,
      data.slug,
      data.cover_path,
      data.source_name,
      data.status || null,
      data.description || null,
      data.genres_text || null,
      data.content_type || null,
      data.type || null,
      data.is_color || 0,
      data.popularity || 0
    );
    return result.lastInsertRowid;
  },

  // Cari manga berdasarkan ID
  findById(id) {
    const stmt = db.prepare('SELECT * FROM manga WHERE id = ?');
    return stmt.get(id);
  },

  // Cari manga berdasarkan slug
  findBySlug(slug) {
    const stmt = db.prepare('SELECT * FROM manga WHERE slug = ?');
    return stmt.get(slug);
  },

  // Cek apakah slug sudah ada
  slugExists(slug) {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM manga WHERE slug = ?');
    const result = stmt.get(slug);
    return result.count > 0;
  },

  // Update manga
  update(id, data) {
    const stmt = db.prepare(`
      UPDATE manga
      SET title = ?, status = ?, description = ?, genres_text = ?,
          content_type = ?, type = ?, is_color = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      data.title,
      data.status,
      data.description,
      data.genres_text,
      data.content_type,
      data.type,
      data.is_color,
      id
    );
  },

  // Update waktu update manga
  touchUpdatedAt(id) {
    const stmt = db.prepare('UPDATE manga SET updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);
  },

  // Get manga list dengan pagination dan filter
  getList(options = {}) {
    const {
      page = 1,
      limit = 15,
      genre,
      status,
      contentType,
      type,
      isColor,
      orderBy = 'updated_at',
      orderDir = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    let whereClauses = [];
    let params = [];

    // Filter berdasarkan genre
    if (genre && genre !== 'all') {
      whereClauses.push('genres_text LIKE ?');
      params.push(`%${genre}%`);
    }

    // Filter berdasarkan status
    if (status && status !== 'all') {
      whereClauses.push('LOWER(status) = LOWER(?)');
      params.push(status);
    }

    // Filter berdasarkan content type
    if (contentType && contentType !== 'all') {
      whereClauses.push('LOWER(content_type) = LOWER(?)');
      params.push(contentType);
    }

    // Filter berdasarkan type
    if (type && type !== 'all') {
      whereClauses.push('LOWER(type) = LOWER(?)');
      params.push(type);
    }

    // Filter berdasarkan color
    if (isColor === 'color') {
      whereClauses.push('is_color = 1');
    } else if (isColor === 'bw') {
      whereClauses.push('is_color = 0');
    }

    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Validasi orderBy untuk keamanan
    const validOrderBy = ['title', 'updated_at', 'created_at', 'popularity'];
    const safeOrderBy = validOrderBy.includes(orderBy) ? orderBy : 'updated_at';
    const safeOrderDir = orderDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Query untuk data
    const query = `
      SELECT * FROM manga
      ${whereClause}
      ORDER BY ${safeOrderBy} ${safeOrderDir}
      LIMIT ? OFFSET ?
    `;
    const stmt = db.prepare(query);
    const data = stmt.all(...params, limit, offset);

    // Query untuk total count
    const countQuery = `SELECT COUNT(*) as total FROM manga ${whereClause}`;
    const countStmt = db.prepare(countQuery);
    const countResult = countStmt.get(...params);

    return {
      data,
      total: countResult.total,
      page,
      totalPages: Math.ceil(countResult.total / limit)
    };
  },

  // Search manga berdasarkan title
  search(query, page = 1, limit = 15) {
    const offset = (page - 1) * limit;
    const searchPattern = `%${query.toLowerCase()}%`;

    const stmt = db.prepare(`
      SELECT * FROM manga
      WHERE LOWER(title) LIKE ? OR LOWER(slug) LIKE ?
      ORDER BY popularity DESC, updated_at DESC
      LIMIT ? OFFSET ?
    `);
    const data = stmt.all(searchPattern, searchPattern, limit, offset);

    const countStmt = db.prepare(`
      SELECT COUNT(*) as total FROM manga
      WHERE LOWER(title) LIKE ? OR LOWER(slug) LIKE ?
    `);
    const countResult = countStmt.get(searchPattern, searchPattern);

    return {
      data,
      total: countResult.total,
      page,
      totalPages: Math.ceil(countResult.total / limit)
    };
  },

  // Get unique genres dari database
  getAllGenres() {
    const stmt = db.prepare('SELECT DISTINCT genres_text FROM manga WHERE genres_text IS NOT NULL');
    const rows = stmt.all();

    const genresSet = new Set();
    rows.forEach(row => {
      if (row.genres_text) {
        const genres = row.genres_text.split(',').map(g => g.trim());
        genres.forEach(g => genresSet.add(g));
      }
    });

    return Array.from(genresSet).sort();
  },

  // Get manga dengan chapter terbaru (untuk homepage)
  getLatestUpdated(limit = 15, offset = 0) {
    const stmt = db.prepare(`
      SELECT m.*, MAX(c.created_at) as latest_chapter_time
      FROM manga m
      LEFT JOIN chapters c ON m.id = c.manga_id
      GROUP BY m.id
      ORDER BY latest_chapter_time DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset);
  }
};

module.exports = mangaModel;
