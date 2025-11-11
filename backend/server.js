const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const config = require('./config');

// Initialize database (akan create tables jika belum ada)
require('./src/models/db');

// Import routes
const authRoutes = require('./src/routes/auth');
const mangaRoutes = require('./src/routes/manga');
const readerRoutes = require('./src/routes/reader');
const searchRoutes = require('./src/routes/search');
const commentRoutes = require('./src/routes/comments');
const adminRoutes = require('./src/routes/admin');

// Import middleware
const { loadUser } = require('./src/middlewares/authMiddleware');

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/covers', express.static(path.join(__dirname, '../data/covers')));
app.use('/manga', express.static(path.join(__dirname, '../data/manga')));
app.use('/users', express.static(path.join(__dirname, '../data/users')));

// Load user untuk semua request
app.use(loadUser);

// Routes
app.use('/', authRoutes);
app.use('/', mangaRoutes);
app.use('/', readerRoutes);
app.use('/', searchRoutes);
app.use('/', commentRoutes);
app.use('/', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).send('Halaman tidak ditemukan');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Terjadi kesalahan server');
});

// Start server
app.listen(config.PORT, config.HOST, () => {
  console.log(`🚀 Server running on http://${config.HOST}:${config.PORT}`);
  console.log(`📚 Manga Reader Sub Indo`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  process.exit(0);
});
