const sessionModel = require('../models/sessionModel');
const userModel = require('../models/userModel');

/**
 * Middleware untuk cek dan load user dari session
 * Tidak block request, hanya set req.user jika ada session valid
 */
async function loadUser(req, res, next) {
  const sessionToken = req.cookies.session_token;

  if (!sessionToken) {
    req.user = null;
    res.locals.currentUser = null;
    return next();
  }

  try {
    // Cek session di database
    const session = sessionModel.findByToken(sessionToken);

    if (!session) {
      // Session tidak ditemukan, clear cookie
      res.clearCookie('session_token');
      req.user = null;
      res.locals.currentUser = null;
      return next();
    }

    // Cek apakah session expired
    const now = new Date();
    const expiresAt = new Date(session.expires_at);

    if (now >= expiresAt) {
      // Session expired, hapus dari DB dan clear cookie
      sessionModel.deleteByToken(sessionToken);
      res.clearCookie('session_token');
      req.user = null;
      res.locals.currentUser = null;
      return next();
    }

    // Session valid, ambil user data
    const user = userModel.findById(session.user_id);

    if (!user) {
      // User tidak ditemukan (mungkin dihapus), clear session
      sessionModel.deleteByToken(sessionToken);
      res.clearCookie('session_token');
      req.user = null;
      res.locals.currentUser = null;
      return next();
    }

    // Set user ke request dan locals
    req.user = user;
    res.locals.currentUser = user;

    // Update last_active_at
    sessionModel.updateLastActive(sessionToken);

    next();
  } catch (error) {
    console.error('Error in loadUser middleware:', error);
    req.user = null;
    res.locals.currentUser = null;
    next();
  }
}

/**
 * Middleware yang require user sudah login
 * Redirect ke /login jika belum login
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }

  // Cek apakah user banned
  if (req.user.status === 'banned') {
    return res.status(403).send('Akun Anda telah di-banned.');
  }

  next();
}

/**
 * Middleware untuk API endpoint yang require auth
 * Return JSON error jika belum login
 */
function requireAuthAPI(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Cek apakah user banned
  if (req.user.status === 'banned') {
    return res.status(403).json({ error: 'Akun Anda telah di-banned.' });
  }

  next();
}

module.exports = {
  loadUser,
  requireAuth,
  requireAuthAPI
};
