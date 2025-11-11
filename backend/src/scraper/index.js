const komikindoScraper = require('./komikindoScraper');
const maidScraper = require('./maidScraper');
const komikuScraper = require('./komikuScraper');
const config = require('../../config');

/**
 * Dispatcher untuk memilih scraper berdasarkan URL atau source name
 */
const scraperIndex = {
  scrapers: {
    komikindo: komikindoScraper,
    maid: maidScraper,
    komiku: komikuScraper
  },

  /**
   * Detect scraper dari URL
   */
  detectScraper(url) {
    if (url.includes('komikindo.ch')) return this.scrapers.komikindo;
    if (url.includes('maid.my.id')) return this.scrapers.maid;
    if (url.includes('komiku.org')) return this.scrapers.komiku;
    return null;
  },

  /**
   * Get scraper berdasarkan source name
   */
  getScraper(sourceName) {
    return this.scrapers[sourceName] || null;
  },

  /**
   * Get all enabled scrapers
   */
  getEnabledScrapers() {
    const enabled = [];
    for (const [name, scraper] of Object.entries(this.scrapers)) {
      if (config.SOURCES[name] && config.SOURCES[name].enabled) {
        enabled.push(scraper);
      }
    }
    return enabled;
  },

  /**
   * Fetch manga detail dari URL (auto-detect scraper)
   */
  async fetchMangaDetail(url) {
    const scraper = this.detectScraper(url);
    if (!scraper) {
      throw new Error('Scraper tidak ditemukan untuk URL: ' + url);
    }
    return await scraper.fetchMangaDetail(url);
  },

  /**
   * Fetch chapter pages dari URL (auto-detect scraper)
   */
  async fetchChapterPages(url) {
    const scraper = this.detectScraper(url);
    if (!scraper) {
      throw new Error('Scraper tidak ditemukan untuk URL: ' + url);
    }
    return await scraper.fetchChapterPages(url);
  }
};

module.exports = scraperIndex;
