# Panduan Setup SPARTA Login Portal

Project ini menggunakan arsitektur *monorepo* (ada *frontend* `apps/web` dan *backend* `apps/api`) serta menggunakan `pnpm` sebagai *package manager*.

---

## Langkah 1: Persiapan (Prerequisites)
Pastikan kamu sudah menginstal *tools* berikut di komputermu:
- **Node.js** (versi 22 atau lebih baru)
- **pnpm** (versi 10 atau lebih baru) - Jika belum ada, jalankan `npm install -g pnpm`
- **PostgreSQL** (versi 15 atau lebih baru) - Harus sudah berjalan di *background*.

## Langkah 2: Instalasi Dependencies
Buka terminal/command prompt di dalam folder utama project (`login-sparta`), lalu jalankan perintah berikut untuk menginstal semua *library* yang dibutuhkan untuk web dan api sekaligus:
```bash
pnpm install
```

---

## Langkah 3: Setup Environment Variables (.env)

Project ini membutuhkan file `.env` di dua tempat: satu untuk *backend* (`apps/api`) dan satu untuk *frontend* (`apps/web`).

### A. Setup `.env` untuk API (Backend)
1. Duplikat/copy file `apps/api/.env.example` dan ubah namanya menjadi `apps/api/.env.development`.
2. Buka file `.env.development` tersebut dan atur *value*-nya seperti penjelasan berikut:

```env
# Runtime
NODE_ENV=development
PORT=10000

# Database
# Format: postgresql://<username>:<password>@localhost:5432/<nama_database>
# Sesuaikan <username> dan <password> dengan pengaturan PostgreSQL di komputermu.
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sparta_login

# Security (PENTING!)
# Keduanya harus diganti dengan kombinasi huruf dan angka acak minimal 32 karakter.
# Kamu bisa generate secara online atau ketik sembarang teks panjang.
SESSION_SECRET=ganti-dengan-rahasia-acak-minimal-32-karakter-disini
OTP_PEPPER=ganti-dengan-pepper-acak-minimal-32-karakter-disini

# CORS (Biarkan default untuk lokal)
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Email (Digunakan untuk mengirim OTP via Google)
# Jika kamu belum memiliki credentials ini, kamu bisa menggunakan akun testing atau setup di Google Cloud Console.
GOOGLE_CLIENT_ID=ganti-dengan-google-client-id-mu
GOOGLE_CLIENT_SECRET=ganti-dengan-google-client-secret-mu
GOOGLE_REFRESH_TOKEN=ganti-dengan-google-refresh-token-mu
GMAIL_USER=email-kamu@example.com

# Module SSO callbacks (Biarkan default untuk lokal, ini URL untuk balikan login app lain)
SPARTA_BUILDING_CALLBACK_URL=http://localhost:5174/auth/sso/callback
SPARTA_MAINTENANCE_CALLBACK_URL=http://localhost:5175/auth/sso/callback
SPARTA_ENERGY_CALLBACK_URL=http://localhost:5176/auth/sso/callback
```

### B. Setup `.env` untuk Web (Frontend)
1. Duplikat/copy file `apps/web/.env.example` dan ubah namanya menjadi `apps/web/.env.development`.
2. Buka file `.env.development` tersebut. Untuk tahap *development* lokal, kamu **tidak perlu mengubah apa-apa** di file ini. Konfigurasi bawaannya sudah disesuaikan agar terhubung dengan API dan app lokal lainnya.

```env
VITE_API_BASE_URL=http://localhost:10000
VITE_APP_ENV=development
VITE_SPARTA_SSO_ENABLED=true
VITE_SPARTA_BUILDING_LOGIN_URL=http://localhost:5174/login
VITE_SPARTA_MAINTENANCE_LOGIN_URL=http://localhost:5175/login
VITE_SPARTA_ENERGY_LOGIN_URL=http://localhost:5176/login
```

---

## Langkah 4: Setup Database (Prisma)
Setelah `DATABASE_URL` di `apps/api/.env.development` dikonfigurasi dengan benar (dan database PostgreSQL kamu berjalan), lakukan inisialisasi database.

Jalankan perintah ini satu-per-satu di root project:

1. Buat Prisma Client (untuk menghubungkan kode dengan DB):
   ```bash
   pnpm --filter @sparta/api prisma:generate
   ```
2. Terapkan struktur tabel (Migrasi) ke database PostgreSQL kamu:
   ```bash
   pnpm --filter @sparta/api prisma migrate dev
   ```
3. Masukkan data dummy/awal ke database (*Seeding*):
   ```bash
   pnpm --filter @sparta/api db:seed
   ```

---

## Langkah 5: Jalankan Aplikasi
Sekarang kamu siap untuk menjalankan project-nya! Disarankan untuk membuka **dua terminal terpisah** di root folder project.

**Terminal 1 (Jalankan API / Backend):**
```bash
pnpm dev:api
```
*(Backend akan berjalan di `http://localhost:10000`)*

**Terminal 2 (Jalankan Web / Frontend):**
```bash
pnpm dev:web
```
*(Frontend akan berjalan di `http://localhost:5173`)*

---

## Troubleshooting Tambahan
- **Error saat migrasi:** Jika kamu mendapatkan error terkait koneksi saat menjalankan `prisma migrate dev`, artinya informasi `DATABASE_URL` di `.env.development` API ada yang salah (entah password salah, atau server postgres belum menyala).
- **Fitur OTP gagal:** Variabel email (`GOOGLE_CLIENT_ID`, dll) wajib diisi dengan benar jika kamu sedang mengerjakan atau mengetes fitur *Login OTP via Email*.
