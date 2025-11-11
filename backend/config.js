module.exports = {
  // Server
  PORT: process.env.PORT || 3000,
  HOST: '0.0.0.0',

  // Database
  DB_PATH: './backend/db/manga.db',

  // Session (7 hari)
  SESSION_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 hari dalam milliseconds

  // Reset token (1 jam)
  RESET_TOKEN_EXPIRY: 60 * 60 * 1000, // 1 jam

  // Pagination
  PAGE_SIZE: 15,

  // Scraper settings (MODE MEDIUM)
  SCRAPER: {
    MAX_CONCURRENT: 2, // Max 2-3 concurrent requests
    DELAY_MIN: 300,    // 300ms delay minimum
    DELAY_MAX: 700,    // 700ms delay maximum
    SOURCE_COOLDOWN: 20000, // 20 detik antar sumber
    RETRY_ATTEMPTS: 3,
    TIMEOUT: 15000     // 15 detik timeout
  },

  // Image processing
  IMAGE: {
    COVER_WIDTH: 300,
    COVER_HEIGHT: 450,
    PAGE_MAX_WIDTH: 1100,
    WEBP_QUALITY: 75,
    WEBP_EFFORT: 4
  },

  // Scraper sources
  SOURCES: {
    komikindo: {
      enabled: true,
      baseUrl: 'https://komikindo.ch'
    },
    maid: {
      enabled: true,
      baseUrl: 'https://maid.my.id'
    },
    komiku: {
      enabled: true,
      baseUrl: 'https://komiku.org'
    }
  }
};
