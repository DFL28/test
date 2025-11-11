# 🚀 PANDUAN LENGKAP - Cara Menjalankan Website Manga Reader

## ✅ Status: READY TO USE!

Server sudah berjalan di: **http://localhost:3000**

---

## 📋 Langkah-Langkah Testing

### 1️⃣ **Buka Browser**

Buka browser Anda dan akses:

```
http://localhost:3000
```

Anda akan melihat home page dengan pesan "Belum ada manga" (karena DB masih kosong).

---

### 2️⃣ **Daftar Akun Pertama (Akan Jadi Admin)**

1. Klik tombol hamburger (☰) di kanan atas (mobile) atau sidebar
2. Klik **"Register"**
3. Isi form signup:
   - **Username**: admin (atau terserah)
   - **Email**: admin@example.com (atau email lain)
   - **Password**: password123 (minimal 8 karakter)
   - **Confirm**: password123
4. Klik **"Daftar"**
5. Anda akan otomatis login dan redirect ke home

---

### 3️⃣ **Set Akun Pertama Sebagai Admin**

Buka terminal baru (jangan tutup server), lalu jalankan:

\`\`\`bash
cd /home/user/test

# Buka database dengan SQLite
sqlite3 backend/db/manga.db

# Set user pertama sebagai admin
UPDATE users SET is_admin = 1 WHERE id = 1;

# Keluar
.exit
\`\`\`

---

### 4️⃣ **Refresh Browser & Akses Admin Dashboard**

1. Refresh halaman browser (F5)
2. Buka sidebar (☰)
3. Sekarang ada menu **"Admin Dashboard"**
4. Klik **Admin Dashboard**

---

### 5️⃣ **Tambah Manga Pertama (Scraping Otomatis!)**

Di halaman Admin Dashboard:

1. Masukkan URL manga dari salah satu source:

   **Contoh URL yang bisa digunakan:**
   ```
   https://komikindo.ch/manga/one-punch-man/
   https://maid.my.id/manga/solo-leveling/
   https://komiku.org/manga/jujutsu-kaisen/
   ```

2. Paste URL ke input field
3. Klik **"Tambah Manga"**
4. Tunggu proses scraping (10-30 detik):
   - ✅ Scraping detail manga
   - ✅ Download cover image
   - ✅ Resize & compress ke WebP
   - ✅ Scraping daftar chapter
   - ✅ Simpan ke database

5. Setelah selesai, Anda akan melihat pesan sukses!

---

### 6️⃣ **Lihat Manga di Home Page**

1. Kembali ke **Home** (klik logo atau menu Home)
2. Manga yang baru ditambahkan akan muncul di grid!
3. Klik manga untuk lihat detail

---

### 7️⃣ **Baca Chapter (First Time = Scraping Live)**

1. Di detail manga, klik salah satu chapter
2. **Pertama kali**:
   - Scraping live chapter pages (10-60 detik tergantung jumlah halaman)
   - Download + resize + compress semua gambar ke WebP
   - Simpan ke cache lokal
3. **Berikutnya**: Load instant dari cache!

---

### 8️⃣ **Test Fitur-Fitur Lain**

#### 🔍 **Search**
- Desktop: Gunakan search box di navbar
- Mobile: Klik icon search (🔍) → ketik → enter

#### 🎨 **Filter Genre**
- Klik menu **"Genre"**
- Pilih filter (Genre, Status, Type, dll)
- Filter akan auto-submit

#### 💬 **Komentar**
- Buka detail manga
- Scroll ke bawah ke bagian komentar
- Tulis komentar → Kirim
- Test reply ke komentar

#### 📱 **Mobile Features**
- Resize browser ke ukuran mobile (F12 → Toggle device toolbar)
- Test sidebar slide-in
- Test mobile search
- Test reader full-bleed & auto next chapter

#### 🔧 **Reader Features**
- **Desktop**: Test zoom controls (+/-)
- **Mobile**: Scroll ke bawah → auto pindah chapter berikutnya
- **Both**: Navbar auto-hide saat scroll down

---

## 🛑 Cara Stop Server

Tekan **Ctrl+C** di terminal untuk stop server.

---

## 🔄 Cara Restart Server

\`\`\`bash
cd /home/user/test
npm start
\`\`\`

---

## 🐛 Troubleshooting

### Port 3000 sudah digunakan?

Edit `backend/config.js`, ubah:
\`\`\`javascript
PORT: process.env.PORT || 3000,
\`\`\`
Jadi:
\`\`\`javascript
PORT: process.env.PORT || 4000,
\`\`\`

### Database tidak bisa diakses?

\`\`\`bash
# Hapus lock files
rm backend/db/*.db-shm
rm backend/db/*.db-wal

# Restart server
\`\`\`

### Scraping gagal?

- Pastikan koneksi internet lancar
- Coba URL manga lain
- Beberapa source mungkin down/maintenance

### Gambar tidak muncul?

- Cek folder `data/covers/` dan `data/manga/` ada dan writable
- Restart server

---

## 📊 Info Database

Database location: `backend/db/manga.db`

Untuk query manual:
\`\`\`bash
sqlite3 backend/db/manga.db

# Lihat semua manga
SELECT id, title, source_name FROM manga;

# Lihat semua users
SELECT id, username, email, is_admin FROM users;

# Keluar
.exit
\`\`\`

---

## 🎯 Fitur yang Sudah Jalan

✅ Auth system (signup, login, logout, forgot/reset password)
✅ Session 7 hari (auto-logout setelah 7 hari)
✅ Home page dengan grid responsive (5 kolom desktop, 3 mobile)
✅ Detail manga dengan daftar chapter
✅ Reader dengan auto-hide navbar & zoom
✅ Mobile reader full-bleed + auto next chapter
✅ Search (desktop & mobile AJAX)
✅ Filter genre lengkap (6 filter options)
✅ Pagination model 3-hal
✅ Comment & reply system
✅ Admin dashboard
✅ Scraping otomatis dari 3 sources
✅ Image processing (resize + WebP compress)
✅ Live scraping + caching

---

## 🚀 Next Steps

1. **Tambah lebih banyak manga** via Admin Dashboard
2. **Test dengan user lain** (daftar akun baru, coba baca, kasih komentar)
3. **Deploy ke VPS** (ikuti README.md bagian Deployment)

---

## 📞 Butuh Bantuan?

Jika ada error atau masalah:
1. Check server log di terminal
2. Check browser console (F12)
3. Lihat troubleshooting di atas

**Happy Reading! 📚**
