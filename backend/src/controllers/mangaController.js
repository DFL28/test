const mangaModel = require('../models/mangaModel');
const chapterModel = require('../models/chapterModel');
const commentModel = require('../models/commentModel');
const { generatePagination } = require('../utils/pagination');
const { timeAgo, timeAgoShort } = require('../utils/timeFormat');
const config = require('../../config');

const mangaController = {
  /**
   * GET / - Home page
   */
  async home(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;

      // Get manga list dengan latest update
      const result = mangaModel.getList({
        page,
        limit: config.PAGE_SIZE,
        orderBy: 'updated_at',
        orderDir: 'DESC'
      });

      // Tambahkan info chapter terbaru untuk setiap manga
      const mangaList = result.data.map(manga => {
        const latestChapter = chapterModel.getLatestByMangaId(manga.id);
        return {
          ...manga,
          latestChapter: latestChapter ? `CH ${latestChapter.chapter_number}` : 'N/A',
          updatedAgo: timeAgoShort(manga.updated_at)
        };
      });

      const pagination = generatePagination(page, result.totalPages);

      res.render('index', {
        mangaList,
        pagination,
        title: 'Home'
      });
    } catch (error) {
      console.error('Error in home:', error);
      res.status(500).send('Terjadi kesalahan');
    }
  },

  /**
   * GET /manga/:slug - Detail manga
   */
  async detail(req, res) {
    try {
      const { slug } = req.params;
      const manga = mangaModel.findBySlug(slug);

      if (!manga) {
        return res.status(404).send('Manga tidak ditemukan');
      }

      // Get chapters
      const chapters = chapterModel.getByMangaId(manga.id);

      // Get comments (hanya parent)
      const comments = commentModel.getByMangaId(manga.id);

      // Get replies untuk setiap comment
      const commentsWithReplies = comments.map(comment => {
        const replies = commentModel.getReplies(comment.id);
        return {
          ...comment,
          timeAgo: timeAgo(comment.created_at),
          replies: replies.map(reply => ({
            ...reply,
            timeAgo: timeAgo(reply.created_at)
          }))
        };
      });

      const commentCount = commentModel.getCountByMangaId(manga.id);

      res.render('detail', {
        manga,
        chapters,
        comments: commentsWithReplies,
        commentCount,
        title: manga.title
      });
    } catch (error) {
      console.error('Error in detail:', error);
      res.status(500).send('Terjadi kesalahan');
    }
  },

  /**
   * GET /genre - Halaman genre dengan filter
   */
  async genre(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const {
        genre,
        status,
        content_type: contentType,
        type,
        color,
        order
      } = req.query;

      // Mapping order parameter
      let orderBy = 'updated_at';
      let orderDir = 'DESC';
      if (order === 'latest') {
        orderBy = 'updated_at';
        orderDir = 'DESC';
      } else if (order === 'popular') {
        orderBy = 'popularity';
        orderDir = 'DESC';
      } else if (order === 'title') {
        orderBy = 'title';
        orderDir = 'ASC';
      }

      // Get manga list dengan filter
      const result = mangaModel.getList({
        page,
        limit: config.PAGE_SIZE,
        genre,
        status,
        contentType,
        type,
        isColor: color,
        orderBy,
        orderDir
      });

      // Tambahkan info chapter terbaru
      const mangaList = result.data.map(manga => {
        const latestChapter = chapterModel.getLatestByMangaId(manga.id);
        return {
          ...manga,
          latestChapter: latestChapter ? `CH ${latestChapter.chapter_number}` : 'N/A',
          updatedAgo: timeAgoShort(manga.updated_at)
        };
      });

      // Get all unique genres untuk filter
      const allGenres = mangaModel.getAllGenres();

      const pagination = generatePagination(page, result.totalPages);

      // Build query string untuk pagination (pertahankan filter)
      const queryParams = { genre, status, content_type: contentType, type, color, order };
      const queryString = Object.entries(queryParams)
        .filter(([_, v]) => v)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');

      res.render('genre', {
        mangaList,
        pagination,
        allGenres,
        filters: {
          genre: genre || 'all',
          status: status || 'all',
          contentType: contentType || 'all',
          type: type || 'all',
          color: color || 'all',
          order: order || 'default'
        },
        queryString,
        title: 'Genre'
      });
    } catch (error) {
      console.error('Error in genre:', error);
      res.status(500).send('Terjadi kesalahan');
    }
  }
};

module.exports = mangaController;
