const mangaModel = require('../models/mangaModel');
const chapterModel = require('../models/chapterModel');
const commentModel = require('../models/commentModel');
const userModel = require('../models/userModel');
const scraperIndex = require('../scraper/index');
const imageProcessor = require('../utils/imageProcessor');
const { slugify } = require('../utils/slugify');
const axios = require('axios');

const adminController = {
  /**
   * GET /admin - Dashboard admin
   */
  async dashboard(req, res) {
    try {
      // Get statistics
      const mangaCount = mangaModel.getList({ page: 1, limit: 1 }).total;
      const commentCount = commentModel.getCountByMangaId(0); // Dummy, bisa diperbaiki

      // Get recent comments
      const recentComments = commentModel.getAllWithDetails(10, 0);

      res.render('admin/dashboard', {
        mangaCount,
        commentCount,
        recentComments,
        title: 'Admin Dashboard'
      });
    } catch (error) {
      console.error('Error in admin dashboard:', error);
      res.status(500).send('Terjadi kesalahan');
    }
  },

  /**
   * POST /admin/manga/add - Add manga dari URL
   */
  async addManga(req, res) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'URL harus diisi' });
      }

      // Detect scraper
      const scraper = scraperIndex.detectScraper(url);
      if (!scraper) {
        return res.status(400).json({ error: 'URL tidak didukung' });
      }

      console.log(`Scraping manga dari ${url}...`);

      // Scrape detail
      const mangaData = await scraperIndex.fetchMangaDetail(url);

      // Generate slug
      let slug = slugify(mangaData.title);
      let counter = 1;
      while (mangaModel.slugExists(slug)) {
        slug = `${slugify(mangaData.title)}-${counter}`;
        counter++;
      }

      // Download & process cover
      console.log('Downloading cover...');
      const coverResponse = await axios.get(mangaData.coverUrl, {
        responseType: 'arraybuffer',
        timeout: 15000
      });
      const coverBuffer = Buffer.from(coverResponse.data);

      // Create manga record first (to get ID)
      const mangaId = mangaModel.create({
        title: mangaData.title,
        slug,
        cover_path: 'temp', // Temporary
        source_name: scraper.sourceName,
        status: mangaData.status,
        description: mangaData.description,
        genres_text: mangaData.genres,
        content_type: mangaData.contentType,
        type: mangaData.type,
        is_color: mangaData.isColor ? 1 : 0,
        popularity: 0
      });

      // Process & save cover
      const coverPath = await imageProcessor.processCover(coverBuffer, mangaId);

      // Update cover path
      mangaModel.update(mangaId, {
        title: mangaData.title,
        status: mangaData.status,
        description: mangaData.description,
        genres_text: mangaData.genres,
        content_type: mangaData.contentType,
        type: mangaData.type,
        is_color: mangaData.isColor ? 1 : 0
      });

      // Update cover_path manually
      const db = require('../models/db');
      const stmt = db.prepare('UPDATE manga SET cover_path = ? WHERE id = ?');
      stmt.run(coverPath, mangaId);

      // Insert chapters
      console.log(`Inserting ${mangaData.chapters.length} chapters...`);
      for (const ch of mangaData.chapters) {
        if (!chapterModel.exists(mangaId, ch.number)) {
          chapterModel.create(mangaId, ch.number, ch.title, ch.sourceUrl);
        }
      }

      console.log(`✓ Manga "${mangaData.title}" berhasil ditambahkan`);

      res.json({
        success: true,
        manga: {
          id: mangaId,
          title: mangaData.title,
          slug
        }
      });
    } catch (error) {
      console.error('Error adding manga:', error);
      res.status(500).json({ error: 'Gagal menambahkan manga: ' + error.message });
    }
  },

  /**
   * POST /admin/users/:id/ban - Ban user
   */
  async banUser(req, res) {
    try {
      const { id } = req.params;

      userModel.banUser(id);

      res.json({ success: true });
    } catch (error) {
      console.error('Error banning user:', error);
      res.status(500).json({ error: 'Terjadi kesalahan' });
    }
  },

  /**
   * POST /admin/users/:id/unban - Unban user
   */
  async unbanUser(req, res) {
    try {
      const { id } = req.params;

      userModel.unbanUser(id);

      res.json({ success: true });
    } catch (error) {
      console.error('Error unbanning user:', error);
      res.status(500).json({ error: 'Terjadi kesalahan' });
    }
  }
};

module.exports = adminController;
