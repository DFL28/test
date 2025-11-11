const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const config = require('../../config');

const imageProcessor = {
  /**
   * Pastikan direktori ada
   */
  async ensureDir(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  },

  /**
   * Proses dan simpan cover manga
   * @param {Buffer} imageBuffer - Buffer gambar
   * @param {number} mangaId - ID manga
   * @returns {string} Path relatif ke cover
   */
  async processCover(imageBuffer, mangaId) {
    const coverDir = path.join(process.cwd(), 'data', 'covers');
    await this.ensureDir(coverDir);

    const outputPath = path.join(coverDir, `${mangaId}.webp`);

    await sharp(imageBuffer)
      .resize(config.IMAGE.COVER_WIDTH, config.IMAGE.COVER_HEIGHT, {
        fit: 'cover',
        position: 'center'
      })
      .webp({
        quality: config.IMAGE.WEBP_QUALITY,
        effort: config.IMAGE.WEBP_EFFORT
      })
      .toFile(outputPath);

    return `/covers/${mangaId}.webp`;
  },

  /**
   * Proses dan simpan halaman chapter
   * @param {Buffer} imageBuffer - Buffer gambar
   * @param {number} mangaId - ID manga
   * @param {number} chapterId - ID chapter
   * @param {number} pageNumber - Nomor halaman
   * @returns {string} Path relatif ke halaman
   */
  async processPage(imageBuffer, mangaId, chapterId, pageNumber) {
    const pageDir = path.join(
      process.cwd(),
      'data',
      'manga',
      mangaId.toString(),
      'chapters',
      chapterId.toString(),
      'pages'
    );
    await this.ensureDir(pageDir);

    const outputPath = path.join(pageDir, `${pageNumber}.webp`);

    // Get metadata untuk cek dimensi
    const metadata = await sharp(imageBuffer).metadata();

    // Jika width lebih besar dari max, resize
    let processor = sharp(imageBuffer);
    if (metadata.width > config.IMAGE.PAGE_MAX_WIDTH) {
      processor = processor.resize(config.IMAGE.PAGE_MAX_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    await processor
      .webp({
        quality: config.IMAGE.WEBP_QUALITY,
        effort: config.IMAGE.WEBP_EFFORT
      })
      .toFile(outputPath);

    return `/manga/${mangaId}/chapters/${chapterId}/pages/${pageNumber}.webp`;
  },

  /**
   * Proses dan simpan avatar user
   * @param {Buffer} imageBuffer - Buffer gambar
   * @param {number} userId - ID user
   * @returns {string} Path relatif ke avatar
   */
  async processAvatar(imageBuffer, userId) {
    const avatarDir = path.join(process.cwd(), 'data', 'users');
    await this.ensureDir(avatarDir);

    const outputPath = path.join(avatarDir, `${userId}.webp`);

    await sharp(imageBuffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .webp({
        quality: 85,
        effort: 4
      })
      .toFile(outputPath);

    return `/users/${userId}.webp`;
  },

  /**
   * Cek apakah file gambar ada
   * @param {string} relativePath - Path relatif dari /data
   * @returns {boolean}
   */
  async imageExists(relativePath) {
    const fullPath = path.join(process.cwd(), 'data', relativePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
};

module.exports = imageProcessor;
