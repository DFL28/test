const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../../config');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay() {
  const ms = Math.floor(
    Math.random() * (config.SCRAPER.DELAY_MAX - config.SCRAPER.DELAY_MIN) +
      config.SCRAPER.DELAY_MIN
  );
  return delay(ms);
}

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
      await delay(1000 * (i + 1));
    }
  }
}

const komikuScraper = {
  sourceName: 'komiku',
  baseUrl: config.SOURCES.komiku.baseUrl,

  async fetchMangaDetail(url) {
    try {
      await randomDelay();
      const html = await fetchWithRetry(url);
      const $ = cheerio.load(html);

      const title = $('.komik_info-content-body-title').text().trim() ||
                    $('h1').first().text().trim();

      const coverUrl = $('.komik_info-cover img').attr('src') ||
                       $('.attachment-full').attr('src');

      const description = $('.komik_info-content-body-description').text().trim() ||
                          $('.manga-excerpt p').text().trim();

      const info = {};
      $('.komik_info-content-info tr, table.inftable tr').each((i, el) => {
        const label = $(el).find('td').eq(0).text().toLowerCase().trim().replace(':', '');
        const value = $(el).find('td').eq(1).text().trim();
        if (label && value) info[label] = value;
      });

      const genres = [];
      $('.komik_info-content-genre a, .genre a').each((i, el) => {
        genres.push($(el).text().trim());
      });

      const chapters = [];
      $('#chapter_list tr, .chapter-list li').each((i, el) => {
        const chapterLink = $(el).find('a').attr('href');
        const chapterTitle = $(el).find('a').text().trim();

        let chapterNumber = '';
        const match = chapterTitle.match(/chapter\s*(\d+\.?\d*)/i) ||
                      chapterTitle.match(/(\d+\.?\d*)/);
        if (match) {
          chapterNumber = match[1];
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
        contentType: info['type'] || info['tipe'] || 'manga',
        type: info['jenis'] || null,
        isColor: (info['warna'] || '').toLowerCase().includes('color'),
        chapters: chapters.reverse()
      };
    } catch (error) {
      console.error('Error scraping komiku:', error.message);
      throw error;
    }
  },

  async fetchChapterPages(chapterUrl) {
    try {
      await randomDelay();
      const html = await fetchWithRetry(chapterUrl);
      const $ = cheerio.load(html);

      const imageUrls = [];

      $('#img_reader img, .reader-area img, #chapter_imgs img').each((i, el) => {
        let src = $(el).attr('src') || $(el).attr('data-src');
        if (src && !src.includes('loader')) {
          imageUrls.push(src.trim());
        }
      });

      return [...new Set(imageUrls)];
    } catch (error) {
      console.error('Error scraping komiku chapter:', error.message);
      throw error;
    }
  },

  async fetchLatestMangaList(page = 1) {
    try {
      await randomDelay();
      const url = `${this.baseUrl}/manga/?page=${page}`;
      const html = await fetchWithRetry(url);
      const $ = cheerio.load(html);

      const mangaUrls = [];
      $('.daftar_komik a, .manga-box a').each((i, el) => {
        const href = $(el).attr('href');
        if (href) mangaUrls.push(href);
      });

      return [...new Set(mangaUrls)];
    } catch (error) {
      console.error('Error fetching komiku latest:', error.message);
      return [];
    }
  }
};

module.exports = komikuScraper;
