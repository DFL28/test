const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../../config');

/**
 * Delay helper
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Random delay berdasarkan config
 */
function randomDelay() {
  const ms = Math.floor(
    Math.random() * (config.SCRAPER.DELAY_MAX - config.SCRAPER.DELAY_MIN) +
      config.SCRAPER.DELAY_MIN
  );
  return delay(ms);
}

/**
 * Fetch dengan retry
 */
async function fetchWithRetry(url, retries = config.SCRAPER.RETRY_ATTEMPTS) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        timeout: config.SCRAPER.TIMEOUT,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(1000 * (i + 1)); // Exponential backoff
    }
  }
}

const komikindoScraper = {
  sourceName: 'komikindo',
  baseUrl: config.SOURCES.komikindo.baseUrl,

  /**
   * Scrape detail manga dari komikindo
   * @param {string} url - URL detail manga
   * @returns {object} Data manga
   */
  async fetchMangaDetail(url) {
    try {
      await randomDelay();
      const html = await fetchWithRetry(url);
      const $ = cheerio.load(html);

      // Parsing struktur komikindo (sesuaikan dengan struktur actual)
      const title = $('.post-title h1').text().trim() ||
                    $('h1.entry-title').text().trim() ||
                    $('title').text().split('|')[0].trim();

      const coverUrl = $('.thumb img').attr('src') ||
                       $('.post-thumb img').attr('src') ||
                       $('img[itemprop="image"]').attr('src');

      const description = $('.entry-content p').first().text().trim() ||
                          $('.summary p').text().trim();

      // Parse info (genre, status, type, dll)
      const info = {};
      $('.info-content .spe span').each((i, el) => {
        const label = $(el).find('b').text().toLowerCase();
        const value = $(el).find('b').remove().end().text().trim();
        info[label] = value;
      });

      // Alternative parsing
      $('.tsinfo .imptdt').each((i, el) => {
        const label = $(el).find('i').text().toLowerCase().replace(':', '');
        const value = $(el).text().replace($(el).find('i').text(), '').trim();
        if (label && value) info[label] = value;
      });

      const genres = [];
      $('.genre-info a, .mgen a, .genxed a').each((i, el) => {
        genres.push($(el).text().trim());
      });

      // Parse chapters
      const chapters = [];
      $('.chapter-list li, #chapterlist li, .eplister li').each((i, el) => {
        const chapterLink = $(el).find('a').attr('href');
        const chapterTitle = $(el).find('a').text().trim();

        // Extract chapter number dari title atau URL
        let chapterNumber = '';
        const match = chapterTitle.match(/chapter\s*(\d+\.?\d*)/i);
        if (match) {
          chapterNumber = match[1];
        } else {
          // Try from URL
          const urlMatch = chapterLink.match(/chapter-(\d+\.?\d*)/i);
          if (urlMatch) chapterNumber = urlMatch[1];
        }

        if (chapterLink && chapterNumber) {
          chapters.push({
            number: chapterNumber,
            title: chapterTitle,
            sourceUrl: chapterLink
          });
        }
      });

      return {
        title,
        coverUrl,
        description,
        genres: genres.join(', '),
        status: info['status'] || info['estado'] || 'unknown',
        contentType: info['type'] || info['tipo'] || 'manga',
        type: info['serialization'] || info['jenis'] || null,
        isColor: false, // Default, bisa di-detect dari info jika ada
        chapters: chapters.reverse() // Reverse agar chapter 1 di awal
      };
    } catch (error) {
      console.error('Error scraping komikindo:', error.message);
      throw error;
    }
  },

  /**
   * Scrape halaman chapter
   * @param {string} chapterUrl - URL chapter
   * @returns {array} Array URL gambar
   */
  async fetchChapterPages(chapterUrl) {
    try {
      await randomDelay();
      const html = await fetchWithRetry(chapterUrl);
      const $ = cheerio.load(html);

      const imageUrls = [];

      // Parse images dari berbagai selector komikindo
      $('#readerarea img, .reader-area img, #chimg img').each((i, el) => {
        let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
        if (src && !src.includes('loader') && !src.includes('loading')) {
          imageUrls.push(src.trim());
        }
      });

      // Filter duplicate
      return [...new Set(imageUrls)];
    } catch (error) {
      console.error('Error scraping chapter pages:', error.message);
      throw error;
    }
  },

  /**
   * Fetch list manga terbaru (untuk batch update)
   * @param {number} page - Nomor halaman
   * @returns {array} Array URL manga
   */
  async fetchLatestMangaList(page = 1) {
    try {
      await randomDelay();
      const url = `${this.baseUrl}/manga/?page=${page}&order=update`;
      const html = await fetchWithRetry(url);
      const $ = cheerio.load(html);

      const mangaUrls = [];
      $('.listupd .bs .bsx a, .utao .uta .luf a').each((i, el) => {
        const href = $(el).attr('href');
        if (href) mangaUrls.push(href);
      });

      return mangaUrls;
    } catch (error) {
      console.error('Error fetching latest manga list:', error.message);
      return [];
    }
  }
};

module.exports = komikindoScraper;
