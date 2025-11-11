const commentModel = require('../models/commentModel');
const mangaModel = require('../models/mangaModel');

const commentController = {
  /**
   * POST /manga/:slug/comments - Post comment
   */
  async postComment(req, res) {
    try {
      const { slug } = req.params;
      const { content, parent_id } = req.body;

      // Validasi user sudah login
      if (!req.user) {
        return res.status(401).json({ error: 'Harus login untuk berkomentar' });
      }

      // Cek apakah user banned
      if (req.user.status === 'banned') {
        return res.status(403).json({ error: 'Anda tidak bisa berkomentar karena di-banned' });
      }

      // Validasi content
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Komentar tidak boleh kosong' });
      }

      if (content.trim().split(/\s+/).length < 1) {
        return res.status(400).json({ error: 'Komentar minimal 1 kata' });
      }

      // Get manga
      const manga = mangaModel.findBySlug(slug);
      if (!manga) {
        return res.status(404).json({ error: 'Manga tidak ditemukan' });
      }

      // Create comment
      const commentId = commentModel.create(
        manga.id,
        req.user.id,
        content.trim(),
        parent_id || null
      );

      // Redirect kembali ke detail page
      res.redirect(`/manga/${slug}#comments`);
    } catch (error) {
      console.error('Error posting comment:', error);
      res.status(500).json({ error: 'Terjadi kesalahan' });
    }
  },

  /**
   * POST /comments/:id/delete - Delete comment (admin only)
   */
  async deleteComment(req, res) {
    try {
      const { id } = req.params;

      // Validasi admin
      if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ error: 'Akses ditolak' });
      }

      // Soft delete
      commentModel.softDelete(id);

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Terjadi kesalahan' });
    }
  }
};

module.exports = commentController;
