const mangaModel = require('../models/mangaModel');
const chapterModel = require('../models/chapterModel');
const { generatePagination } = require('../utils/pagination');
const { timeAgoShort } = require('../utils/timeFormat');
const config = require('../../config');

const searchController = {
  /**
   * GET /search - Search page (desktop)
   */
  async search(req, res) {
    try {
      const query = req.query.q || '';
      const page = parseInt(req.query.page) || 1;

      if (!query.trim()) {
        return res.render('search', {
          mangaList: [],
          pagination: null,
          query: '',
          title: 'Search'
        });
      }

      const result = mangaModel.search(query, page, config.PAGE_SIZE);

      // Tambahkan info chapter terbaru
      const mangaList = result.data.map(manga => {
        const latestChapter = chapterModel.getLatestByMangaId(manga.id);
        return {
          ...manga,
          latestChapter: latestChapter ? `CH ${latestChapter.chapter_number}` : 'N/A',
          updatedAgo: timeAgoShort(manga.updated_at)
        };
      });

      const pagination = generatePagination(page, result.totalPages);

      res.render('search', {
        mangaList,
        pagination,
        query,
        title: `Search: ${query}`
      });
    } catch (error) {
      console.error('Error in search:', error);
      res.status(500).send('Terjadi kesalahan');
    }
  },

  /**
   * GET /api/search - Search API (mobile AJAX)
   */
  async searchAPI(req, res) {
    try {
      const query = req.query.q || '';

      if (!query.trim()) {
        return res.json({ results: [] });
      }

      // Limit 10 untuk mobile quick search
      const result = mangaModel.search(query, 1, 10);

      // Format hasil untuk JSON
      const results = result.data.map(manga => {
        const latestChapter = chapterModel.getLatestByMangaId(manga.id);
        return {
          id: manga.id,
          title: manga.title,
          slug: manga.slug,
          cover_path: manga.cover_path,
          latestChapter: latestChapter ? `CH ${latestChapter.chapter_number}` : 'N/A',
          updatedAgo: timeAgoShort(manga.updated_at)
        };
      });

      res.json({ results });
    } catch (error) {
      console.error('Error in searchAPI:', error);
      res.status(500).json({ error: 'Terjadi kesalahan' });
    }
  }
};

module.exports = searchController;
