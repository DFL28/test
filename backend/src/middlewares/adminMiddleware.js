/**
 * Middleware yang require user adalah admin
 * Harus dipasang setelah requireAuth
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }

  if (!req.user.is_admin) {
    return res.status(403).send('Akses ditolak. Hanya admin yang dapat mengakses halaman ini.');
  }

  next();
}

/**
 * Middleware untuk API endpoint yang require admin
 */
function requireAdminAPI(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Forbidden. Admin only.' });
  }

  next();
}

module.exports = {
  requireAdmin,
  requireAdminAPI
};
