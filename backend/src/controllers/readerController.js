const mangaModel = require('../models/mangaModel');
const chapterModel = require('../models/chapterModel');
const pageModel = require('../models/pageModel');
const scraperIndex = require('../scraper/index');
const imageProcessor = require('../utils/imageProcessor');
const axios = require('axios');

const readerController = {
  /**
   * GET /manga/:slug/chapter/:chapterNumber - Reader page
   */
  async read(req, res) {
    try {
      const { slug, chapterNumber } = req.params;

      // Get manga
      const manga = mangaModel.findBySlug(slug);
      if (!manga) {
        return res.status(404).send('Manga tidak ditemukan');
      }

      // Get chapter
      const chapter = chapterModel.findByMangaAndNumber(manga.id, chapterNumber);
      if (!chapter) {
        return res.status(404).send('Chapter tidak ditemukan');
      }

      // Get all chapters untuk navigation
      const allChapters = chapterModel.getByMangaId(manga.id);

      // Get prev & next chapter
      const prevChapter = chapterModel.getPrevious(manga.id, chapterNumber);
      const nextChapter = chapterModel.getNext(manga.id, chapterNumber);

      // Check apakah pages sudah di-cache
      let pages = pageModel.getByChapterId(chapter.id);

      // Jika pages kosong atau tidak lengkap, scraping live
      if (pages.length === 0) {
        console.log(`Scraping chapter ${chapterNumber} of ${manga.title}...`);

        try {
          // Scrape image URLs
          const imageUrls = await scraperIndex.fetchChapterPages(chapter.source_url);

          if (imageUrls.length === 0) {
            return res.status(500).send('Gagal memuat gambar chapter');
          }

          // Download & process images (concurrent dengan limit)
          const processPromises = [];
          const MAX_CONCURRENT = 2; // Mode medium

          for (let i = 0; i < imageUrls.length; i++) {
            const imageUrl = imageUrls[i];
            const pageNumber = i + 1;

            const processTask = (async () => {
              try {
                // Download image
                const response = await axios.get(imageUrl, {
                  responseType: 'arraybuffer',
                  timeout: 15000,
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': chapter.source_url
                  }
                });

                const imageBuffer = Buffer.from(response.data);

                // Process & save image
                const imagePath = await imageProcessor.processPage(
                  imageBuffer,
                  manga.id,
                  chapter.id,
                  pageNumber
                );

                // Save to database
                pageModel.create(chapter.id, pageNumber, imagePath);

                console.log(`✓ Processed page ${pageNumber}/${imageUrls.length}`);
              } catch (error) {
                console.error(`Error processing page ${pageNumber}:`, error.message);
              }
            })();

            processPromises.push(processTask);

            // Control concurrency
            if (processPromises.length >= MAX_CONCURRENT) {
              await Promise.race(processPromises);
              processPromises.splice(
                processPromises.findIndex(p => p.constructor.name === 'Promise' && p.resolved),
                1
              );
            }
          }

          // Wait for all remaining
          await Promise.all(processPromises);

          // Reload pages dari database
          pages = pageModel.getByChapterId(chapter.id);
        } catch (error) {
          console.error('Error scraping chapter:', error);
          return res.status(500).send('Gagal memuat chapter. Silakan coba lagi nanti.');
        }
      }

      res.render('reader', {
        manga,
        chapter,
        pages,
        allChapters,
        prevChapter,
        nextChapter,
        title: `${manga.title} - Chapter ${chapterNumber}`
      });
    } catch (error) {
      console.error('Error in read:', error);
      res.status(500).send('Terjadi kesalahan');
    }
  }
};

module.exports = readerController;
