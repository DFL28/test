const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userModel = require('../models/userModel');
const sessionModel = require('../models/sessionModel');
const resetTokenModel = require('../models/resetTokenModel');
const config = require('../../config');

const authController = {
  /**
   * GET /signup - Tampilkan form signup
   */
  showSignup(req, res) {
    if (req.user) {
      return res.redirect('/');
    }
    res.render('auth/signup', { error: null });
  },

  /**
   * POST /signup - Proses signup
   */
  async signup(req, res) {
    try {
      const { username, email, password, confirm } = req.body;

      // Validasi input
      if (!username || !email || !password || !confirm) {
        return res.render('auth/signup', { error: 'Semua field harus diisi' });
      }

      if (password.length < 8) {
        return res.render('auth/signup', { error: 'Password minimal 8 karakter' });
      }

      if (password !== confirm) {
        return res.render('auth/signup', { error: 'Password dan konfirmasi tidak cocok' });
      }

      // Cek username dan email sudah ada atau belum
      if (userModel.usernameExists(username)) {
        return res.render('auth/signup', { error: 'Username sudah digunakan' });
      }

      if (userModel.emailExists(email)) {
        return res.render('auth/signup', { error: 'Email sudah terdaftar' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Buat user baru
      const userId = userModel.create(username, email, passwordHash);

      // Auto login setelah signup
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + config.SESSION_MAX_AGE).toISOString();

      sessionModel.create(userId, sessionToken, expiresAt);

      // Set cookie
      res.cookie('session_token', sessionToken, {
        httpOnly: true,
        maxAge: config.SESSION_MAX_AGE
      });

      res.redirect('/');
    } catch (error) {
      console.error('Error in signup:', error);
      res.render('auth/signup', { error: 'Terjadi kesalahan. Silakan coba lagi.' });
    }
  },

  /**
   * GET /login - Tampilkan form login
   */
  showLogin(req, res) {
    if (req.user) {
      return res.redirect('/');
    }
    res.render('auth/login', { error: null });
  },

  /**
   * POST /login - Proses login
   */
  async login(req, res) {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.render('auth/login', { error: 'Email/username dan password harus diisi' });
      }

      // Cari user berdasarkan email atau username
      const user = userModel.findByEmailOrUsername(identifier);

      if (!user) {
        return res.render('auth/login', { error: 'Email/username atau password salah' });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);

      if (!isValid) {
        return res.render('auth/login', { error: 'Email/username atau password salah' });
      }

      // Buat session baru
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + config.SESSION_MAX_AGE).toISOString();

      sessionModel.create(user.id, sessionToken, expiresAt);

      // Set cookie
      res.cookie('session_token', sessionToken, {
        httpOnly: true,
        maxAge: config.SESSION_MAX_AGE
      });

      res.redirect('/');
    } catch (error) {
      console.error('Error in login:', error);
      res.render('auth/login', { error: 'Terjadi kesalahan. Silakan coba lagi.' });
    }
  },

  /**
   * GET /logout - Logout
   */
  logout(req, res) {
    const sessionToken = req.cookies.session_token;

    if (sessionToken) {
      sessionModel.deleteByToken(sessionToken);
    }

    res.clearCookie('session_token');
    res.redirect('/');
  },

  /**
   * GET /forgot - Tampilkan form forgot password
   */
  showForgot(req, res) {
    res.render('auth/forgot', { error: null, success: null });
  },

  /**
   * POST /forgot - Proses forgot password
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.render('auth/forgot', {
          error: 'Email harus diisi',
          success: null
        });
      }

      const user = userModel.findByEmail(email);

      // Selalu tampilkan pesan sukses (untuk keamanan, jangan bocorkan apakah email ada atau tidak)
      const successMessage = 'Jika email terdaftar, link reset password telah dikirim ke email Anda.';

      if (user) {
        // Generate reset token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + config.RESET_TOKEN_EXPIRY).toISOString();

        resetTokenModel.create(user.id, token, expiresAt);

        // TODO: Kirim email dengan link reset
        // Untuk sementara, log token (di production harus kirim email)
        console.log(`Reset token for ${email}: ${token}`);
        console.log(`Reset link: http://localhost:${config.PORT}/reset/${token}`);
      }

      res.render('auth/forgot', {
        error: null,
        success: successMessage
      });
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      res.render('auth/forgot', {
        error: 'Terjadi kesalahan. Silakan coba lagi.',
        success: null
      });
    }
  },

  /**
   * GET /reset/:token - Tampilkan form reset password
   */
  showReset(req, res) {
    const { token } = req.params;

    // Validasi token
    if (!resetTokenModel.isValid(token)) {
      return res.render('auth/reset', {
        token: null,
        error: 'Token tidak valid atau sudah expired',
        success: null
      });
    }

    res.render('auth/reset', { token, error: null, success: null });
  },

  /**
   * POST /reset/:token - Proses reset password
   */
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password, confirm } = req.body;

      // Validasi token
      const resetToken = resetTokenModel.findByToken(token);
      if (!resetToken || !resetTokenModel.isValid(token)) {
        return res.render('auth/reset', {
          token: null,
          error: 'Token tidak valid atau sudah expired',
          success: null
        });
      }

      // Validasi password
      if (!password || !confirm) {
        return res.render('auth/reset', {
          token,
          error: 'Semua field harus diisi',
          success: null
        });
      }

      if (password.length < 8) {
        return res.render('auth/reset', {
          token,
          error: 'Password minimal 8 karakter',
          success: null
        });
      }

      if (password !== confirm) {
        return res.render('auth/reset', {
          token,
          error: 'Password dan konfirmasi tidak cocok',
          success: null
        });
      }

      // Hash password baru
      const newPasswordHash = await bcrypt.hash(password, 10);

      // Update password
      userModel.updatePassword(resetToken.user_id, newPasswordHash);

      // Mark token as used
      resetTokenModel.markAsUsed(token);

      // Force logout semua device
      sessionModel.deleteAllUserSessions(resetToken.user_id);

      res.render('auth/reset', {
        token: null,
        error: null,
        success: 'Password berhasil direset. Silakan login dengan password baru.'
      });
    } catch (error) {
      console.error('Error in resetPassword:', error);
      res.render('auth/reset', {
        token: req.params.token,
        error: 'Terjadi kesalahan. Silakan coba lagi.',
        success: null
      });
    }
  }
};

module.exports = authController;
