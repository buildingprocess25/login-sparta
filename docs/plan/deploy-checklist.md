# Checklist deploy portal SPARTA (disusun 2026-11-20)

Tujuan: portal baru live tanpa memutus akses modul lain (Building, Maintenance, Energy, SIAGA, CarbonTrack). Prinsipnya: semua perubahan yang hanya menambah dijalankan dulu; perubahan yang mengubah data yang dibaca modul (konversi kode cabang) dijalankan **paling akhir**, setelah modul siap.

Server API memakai Nixpacks (lihat `NIXPACKS_*`). Start command-nya **tidak** menjalankan migrasi, jadi migrasi dijalankan manual (langkah 1.3). `render.yaml` menjalankannya otomatis lewat `preDeployCommand`, kalau platform itu yang dipakai.

## Tahap 0: Persiapan (sebelum hari H)

- [ ] **0.1 Backup database produksi** `sparta` (mis. `pg_dump -Fc`). Simpan di luar server.
- [ ] **0.2 Cek zona waktu DB:** `SHOW timezone;` harus `UTC` atau `Etc/UTC`. Kalau bukan, hentikan dan putuskan dulu: cursor `updatedSince` modul bisa melewatkan data.
- [ ] **0.3 Cek jumlah instance API.** Kalau lebih dari satu, buat satu kunci RSA (`openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048`) dan isi env `SPARTA_CREDENTIAL_PRIVATE_KEY` yang SAMA di semua instance (baris baru ditulis sebagai `\n`). Satu instance: lewati.
- [ ] **0.4 Env API lama tetap terisi** (DATABASE_URL, SESSION_SECRET, CALLBACK_URL tiap modul, SPARTA_INTERNAL_API_KEY, dst.). Jangan isi `SPARTA_PROVISIONING_WORKER_ENABLED` dulu (bawaan: mati).
- [ ] **0.5 Pastikan tidak ada modul yang memuat portal di dalam iframe.** Nginx baru mengirim `X-Frame-Options: DENY`.
- [ ] **0.6 Dokploy (Nixpacks), cukup sekali:** ubah env `NIXPACKS_START_CMD` aplikasi API menjadi `npx --yes pnpm@10.25.0 --filter @sparta/api prisma:migrate:deploy && npx --yes pnpm@10.25.0 --filter @sparta/api start`. Dengan ini setiap push menjalankan migrasi dulu, sehingga langkah 1.3 tidak perlu dikerjakan manual. `migrate deploy` aman diulang; kalau gagal, aplikasi baru tidak start.
- [ ] **0.7 Commit sudah ter-push** ke branch yang dideploy.

## Tahap 1: Deploy portal (aman untuk semua modul)

Semua migrasi di tahap ini hanya MENAMBAH tabel/kolom dengan nilai bawaan. Kode lama tetap bisa jalan di skema baru, jadi migrasi dijalankan sebelum kode baru.

- [ ] **1.1** Umumkan jendela maintenance singkat (opsional; tidak ada downtime yang diharapkan).
- [ ] **1.2** Backup ulang kalau jaraknya jauh dari 0.1.
- [ ] **1.3 Jalankan migrasi** dari server/console aplikasi API (DATABASE_URL produksi): `pnpm --filter @sparta/api prisma:migrate:deploy`. Cek dulu dengan `prisma migrate status`. Yang tertunda (5):
  - `20261119100000_add_area_and_branch_alias`
  - `20261119100100_add_master_admin_role`
  - `20261119110000_add_module_roles_and_provisioning`
  - `20261120024911_add_store_master`
  - `20261120030225_add_store_brand_modules`
- [ ] **1.4 Cek katalog role:** `SELECT "moduleId", count(*) FROM "ModuleRole" GROUP BY 1;`. Harus ada ENERGY 5, MAINTENANCE 5, CARBONTRACK 1. Di produksi tabel AppModule sudah berisi, jadi migrasi mengisinya otomatis. Kalau tetap kosong, jalankan ulang hanya blok `INSERT INTO "ModuleRole"` dari migrasi `20261119110000`. **Jangan jalankan `seed.ts` di produksi:** seed mereset password akun seed ke password awal.
- [ ] **1.5 Deploy API** (kode terbaru). **JANGAN** menjalankan `convert-branch-codes.ts`.
- [ ] **1.6 Deploy web** (Docker, memakai `apps/web/nginx.conf`).
- [ ] **1.7 Verifikasi** (wajib semua lulus sebelum lanjut):
  - `GET /healthz` = ok; `GET /v1/auth/credential-key` membalas kunci.
  - Login portal berhasil; payload login di DevTools berisi `sealed`, bukan password.
  - Buka **setiap modul** lewat portal (SSO): Building, Maintenance, Energy, SIAGA, CarbonTrack, lalu login sampai masuk.
  - Satu modul memanggil `/v1/admin/users/sync` (tambah user dari modul) dan berhasil.
  - Halaman Data Master dan Manajemen User terbuka untuk SYSTEM_ADMIN.
  - `curl -I https://sparta-alfamart.web.id` menampilkan `Strict-Transport-Security`.
- [ ] **1.8 Rollback kalau ada yang gagal:** deploy ulang commit sebelumnya. Migrasi tidak perlu dibatalkan (hanya menambah).

## Tahap 2: Provisioning Energy dan CarbonTrack

Dikerjakan setelah Energy dan CarbonTrack men-deploy endpoint provisioning mereka (masing-masing dengan izin user).

- [ ] **2.1** Buat secret acak minimal 32 karakter per modul. Isi `SPARTA_PROVISIONING_SECRET_ENERGY` / `_CARBONTRACK` di portal, dan nilai yang sama sebagai `SPARTA_PROVISIONING_SECRET` di modulnya.
- [ ] **2.2** Isi `AppModule.provisioningUrl` (izin user, menulis DB): ENERGY `https://<domain-energy>/api/sparta/provisioning`, CARBONTRACK `https://grk.sparta-alfamart.web.id/api/sparta/provisioning`.
- [ ] **2.3** Set `SPARTA_PROVISIONING_WORKER_ENABLED=true`, lalu restart API.
- [ ] **2.4 Uji ujung ke ujung** dengan satu akun uji: buat di Manajemen User dan beri akses Energy + CarbonTrack, lalu pastikan akun muncul di keduanya. Ganti email dan pastikan ikut berubah. Nonaktifkan dan pastikan sesi modul putus. Riwayat pengiriman di portal berstatus Terkirim.

## Tahap 3: PALING AKHIR, konversi kode cabang dan master toko

Tahap ini mengubah `branch` dan `branchCode` yang dikirim ke modul untuk sekitar 120 user (mis. CILEUNGSI -> "CILEUNGSI 2", BALARAJA -> "CIKOKOL"). Energy dan CarbonTrack sudah siap; **Building, Maintenance, SIAGA belum dicek**.

- [ ] **3.1 Syarat:** konfirmasi ke pemilik Building, Maintenance, SIAGA bagaimana mereka memakai `branch` / `branchCode` dari SSO dan `/sync`. Kalau dipakai untuk akses, mereka harus menerima kode Alfamart dan alias, atau setuju aksesnya bergeser ke cabang induk.
- [ ] **3.2 Backup DB.**
- [ ] **3.3 Dry-run** (izin user): `pnpm --filter @sparta/api exec tsx src/scripts/convert-branch-codes.ts --allow-remote`. Periksa laporannya: 36 cabang Alfamart + HEAD, 6 cabang digabung, dan daftar cabang tanpa kode.
- [ ] **3.4 Apply:** perintah yang sama dengan `--apply`.
- [ ] **3.5 Isi master toko di produksi.** Skrip impor toko dan area saat ini hanya ada di scratchpad sesi; **buat versi repo dulu** (portal) sebelum tahap ini.
- [ ] **3.6** Kabari modul: CarbonTrack pindah ke `STORE_MASTER_SOURCE=portal`; Energy menjalankan dry-run cabang lalu menyalakan cron `sync-sparta-branches`.

## Setelah semua tahap

- Ganti `SPARTA_INTERNAL_API_KEY` di portal dan semua modul (keputusan QA-02 masih menunggu user), dan rotate password DB `aku-sparta`.
- Hapus `changeEmailAndBroadcast` setelah semua modul punya endpoint provisioning.
