# ⚡ QUICK START - 5 Menit Setup

## 🎯 Sudah Jalan!

Server sedang berjalan di: **http://localhost:3000**

---

## 🚀 4 Langkah Cepat

### 1. Buka Browser
```
http://localhost:3000
```

### 2. Daftar Akun (Sidebar → Register)
```
Username: admin
Email: admin@test.com
Password: password123
```

### 3. Set Sebagai Admin
```bash
sqlite3 backend/db/manga.db
UPDATE users SET is_admin = 1 WHERE id = 1;
.exit
```

### 4. Tambah Manga (Admin Dashboard)
Paste salah satu URL ini:
```
https://komikindo.ch/manga/one-punch-man/
https://maid.my.id/manga/solo-leveling/
https://komiku.org/manga/jujutsu-kaisen/
```

**Done!** Manga akan muncul di home page.

---

## 📖 Panduan Lengkap

Baca **PANDUAN.md** untuk tutorial detail semua fitur.

---

## 🛑 Stop Server

```bash
# Tekan Ctrl+C di terminal
```

---

## 🔄 Start Lagi

```bash
cd /home/user/test
npm start
```

---

**Selamat Mencoba! 🎉**
