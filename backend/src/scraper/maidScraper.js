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

const maidScraper = {
  sourceName: 'maid',
  baseUrl: config.SOURCES.maid.baseUrl,

  async fetchMangaDetail(url) {
    try {
      await randomDelay();
      const html = await fetchWithRetry(url);
      const $ = cheerio.load(html);

      const title = $('.entry-title').text().trim() ||
                    $('h1').first().text().trim();

      const coverUrl = $('.thumb img').attr('src') ||
                       $('.attachment-full').attr('src');

      const description = $('.entry-content p').first().text().trim() ||
                          $('.summary__content p').text().trim();

      const info = {};
      $('.post-content_item, .fmed').each((i, el) => {
        const label = $(el).find('.summary-heading, h3').text().toLowerCase().trim();
        const value = $(el).find('.summary-content, span').text().trim();
        if (label && value) info[label] = value;
      });

      const genres = [];
      $('.genres-content a, .mgen a').each((i, el) => {
        genres.push($(el).text().trim());
      });

      const chapters = [];
      $('.eph-num a, .chapter-link').each((i, el) => {
        const chapterLink = $(el).attr('href');
        const chapterTitle = $(el).text().trim();

        let chapterNumber = '';
        const match = chapterTitle.match(/chapter\s*(\d+\.?\d*)/i) ||
                      chapterTitle.match(/ch\s*(\d+\.?\d*)/i);
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
        status: info['status'] || 'unknown',
        contentType: info['type'] || 'manga',
        type: info['jenis'] || null,
        isColor: false,
        chapters: chapters.reverse()
      };
    } catch (error) {
      console.error('Error scraping maid:', error.message);
      throw error;
    }
  },

  async fetchChapterPages(chapterUrl) {
    try {
      await randomDelay();
      const html = await fetchWithRetry(chapterUrl);
      const $ = cheerio.load(html);

      const imageUrls = [];

      $('#readerarea img, .rdminimal img, .chapter-content img').each((i, el) => {
        let src = $(el).attr('src') || $(el).attr('data-src');
        if (src && !src.includes('loader')) {
          imageUrls.push(src.trim());
        }
      });

      return [...new Set(imageUrls)];
    } catch (error) {
      console.error('Error scraping maid chapter:', error.message);
      throw error;
    }
  },

  async fetchLatestMangaList(page = 1) {
    try {
      await randomDelay();
      const url = `${this.baseUrl}/manga/?page=${page}&order=update`;
      const html = await fetchWithRetry(url);
      const $ = cheerio.load(html);

      const mangaUrls = [];
      $('.listupd a, .manga-item a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.includes('/manga/')) mangaUrls.push(href);
      });

      return [...new Set(mangaUrls)];
    } catch (error) {
      console.error('Error fetching maid latest:', error.message);
      return [];
    }
  }
};

module.exports = maidScraper;
