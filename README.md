# Manga Reader Sub Indo

Website baca manga sub Indo dengan scraping, SQLite, dan cache lokal. Dioptimasi untuk VPS Ubuntu 2 core / 2 GB RAM.

## Tech Stack

- **Backend**: Node.js + Express
- **View Engine**: EJS (server-side rendering)
- **Database**: SQLite (file-based)
- **Frontend**: HTML + CSS + JavaScript (no framework)
- **Image Processing**: Sharp (resize + compress WebP)
- **Scraping**: Axios + Cheerio

## Fitur

### User Features
- ✅ Browse manga (grid 5 kolom desktop, 3 kolom mobile)
- ✅ Filter by genre, status, content type, type, color
- ✅ Search manga (desktop & mobile AJAX)
- ✅ Detail manga dengan daftar chapter
- ✅ Reader dengan auto-hide navbar & auto next chapter (mobile)
- ✅ Zoom controls (desktop only)
- ✅ Komentar & reply system
- ✅ Auth system (signup, login, logout, forgot password, reset password)
- ✅ Session 7 hari dengan auto-logout
- ✅ Sidebar dengan menu navigasi

### Admin Features
- ✅ Dashboard dengan statistik
- ✅ Tambah manga dari URL (komikindo/maid/komiku)
- ✅ Ban/unban user
- ✅ Hapus komentar (soft delete)
- ✅ Auto scraping & cache gambar

### Scraping Features
- ✅ Mode MEDIUM (concurrent 2-3, delay 300-700ms)
- ✅ Scrape manga detail + chapters
- ✅ Scrape chapter pages dengan live caching
- ✅ Image processing (resize, compress WebP)
- ✅ Retry mechanism dengan exponential backoff
- ✅ Support multiple sources (komikindo, maid, komiku)

## Installation

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Run Server

\`\`\`bash
# Development (with nodemon)
npm run dev

# Production
npm start
\`\`\`

Server akan berjalan di `http://0.0.0.0:3000`

### 3. Setup Admin Account

Setelah server berjalan:

1. Buka `http://localhost:3000/signup`
2. Daftar akun pertama
3. Stop server
4. Akses database dengan SQLite browser atau CLI:

\`\`\`bash
sqlite3 backend/db/manga.db
\`\`\`

5. Set akun pertama sebagai admin:

\`\`\`sql
UPDATE users SET is_admin = 1 WHERE id = 1;
.exit
\`\`\`

6. Restart server dan login

### 4. Tambah Manga

1. Login sebagai admin
2. Buka `/admin`
3. Masukkan URL manga dari:
   - https://komikindo.ch/manga/xxx
   - https://maid.my.id/manga/xxx
   - https://komiku.org/manga/xxx
4. Klik "Tambah Manga"
5. Tunggu proses scraping selesai

## Deployment ke VPS

### 1. Upload ke VPS

\`\`\`bash
# Clone repo atau upload files
git clone <repo-url>
cd manga-reader-indo

# Install dependencies
npm install
\`\`\`

### 2. Setup dengan PM2 (Recommended)

\`\`\`bash
# Install PM2 globally
npm install -g pm2

# Start aplikasi
pm2 start backend/server.js --name manga-reader

# Auto start on reboot
pm2 startup
pm2 save
\`\`\`

### 3. Setup Nginx (Optional)

\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
\`\`\`

## Struktur Folder

\`\`\`
/backend
  server.js              # Entry point
  config.js              # Konfigurasi
  /src
    /routes              # Express routes
    /controllers         # Request handlers
    /models              # Database models
    /scraper             # Scraping modules
    /middlewares         # Auth & admin middleware
    /utils               # Utility functions
  /db
    manga.db             # SQLite database

/frontend
  /public
    /css                 # Stylesheets
    /js                  # Client-side scripts
  /views
    /partials            # Reusable EJS components
    /auth                # Auth pages
    /admin               # Admin pages
    *.ejs                # Page templates

/data
  /covers              # Manga cover images
  /manga               # Chapter page images
  /users               # User avatars
\`\`\`

## Konfigurasi

Edit `backend/config.js` untuk mengubah:

- Port server
- Session max age
- Scraper settings (concurrent, delay, timeout)
- Image quality & size
- Pagination size

## Database Schema

- **users**: User accounts dengan auth & admin flag
- **sessions**: Session tokens (7 hari auto-expire)
- **manga**: Manga data dari scraping
- **chapters**: Chapter list per manga
- **pages**: Page images per chapter (cached)
- **comments**: Komentar dengan reply support
- **reset_tokens**: Password reset tokens (1 jam expire)

## API Endpoints

### Public
- `GET /` - Home page
- `GET /genre` - Genre filter page
- `GET /manga/:slug` - Detail manga
- `GET /manga/:slug/chapter/:number` - Reader
- `GET /search` - Search page
- `GET /api/search` - Search API (AJAX)

### Auth
- `GET /login` - Login page
- `POST /login` - Process login
- `GET /signup` - Signup page
- `POST /signup` - Process signup
- `GET /logout` - Logout
- `GET /forgot` - Forgot password
- `POST /forgot` - Send reset token
- `GET /reset/:token` - Reset password page
- `POST /reset/:token` - Process reset

### User (Require Auth)
- `POST /manga/:slug/comments` - Post comment

### Admin (Require Admin)
- `GET /admin` - Admin dashboard
- `POST /admin/manga/add` - Add manga from URL
- `POST /admin/users/:id/ban` - Ban user
- `POST /admin/users/:id/unban` - Unban user
- `POST /comments/:id/delete` - Delete comment

## Performance Tips

1. **Scraping Mode Medium** sudah diatur optimal untuk VPS 2GB
2. **Database WAL mode** diaktifkan untuk performa SQLite
3. **Image cache** menghindari scraping berulang
4. **Lazy loading** untuk images di grid
5. **Pagination** membatasi data per page

## Troubleshooting

### Port sudah digunakan
Edit `backend/config.js` dan ubah `PORT`

### Scraping gagal
- Cek koneksi internet VPS
- Cek apakah URL source valid
- Lihat log error di console

### Gambar tidak muncul
- Cek folder `/data` writable
- Cek path di database sesuai dengan file
- Cek static middleware di server.js

### Database locked
- Hentikan semua proses yang akses database
- Restart server
- Jika masih error, hapus file `.db-shm` dan `.db-wal`

## License

MIT License - Free to use

## Support

Untuk bug report atau feature request, silakan buka issue.
