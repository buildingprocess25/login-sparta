# Sisa Plan SPARTA (diperbarui 2026-11-20)

Catatan sisa pekerjaan setelah sesi 2026-11-19. Rencana lengkap ada di dokumen "Rencana Master Data SPARTA" (https://claude.ai/artifact/6QET764pBQovN97zU8g5jh). Kontrak teknis untuk modul ada di [module-sso-contract.md](../integration/module-sso-contract.md).

## Aturan kerja (berlaku untuk semua sesi)

- Jangan pernah commit atau push.
- Setelah setiap perubahan, tulis ulang graph: `graphify update .` dari root repo. Untuk perubahan dokumen, jalankan `/graphify --update`.
- UI pakai shadcn/ui dulu, dengan antislop (mode DURING). Jangan menambah margin/padding/gap langsung ke komponen shadcn.
- Database: hanya boleh query baca. Jangan mengubah data atau menjalankan migrasi tanpa izin.
- Sesi lain: `test-14` = CarbonTrack (`c:\ALfa\Test`), `sparta-energy-83` = SPARTA Audit/Energy (`c:\ALfa\sparta-energy`). Kabari mereka setiap kali fase maju.

## Status fase

| Fase | Isi | Status |
|---|---|---|
| 0 | Kontrak SSO v2 (`spartaUserId`, `employeeId`, `branchCode`) | Selesai di portal |
| 1 | Modul menyimpan `spartaUserId` | Selesai di CarbonTrack dan Energy |
| 2 | Master Cabang + Area + alias, halaman Data Master, mode dev tiruan | Selesai di portal. Modul belum mulai Fase 2 |
| 2B | Manajemen user terpusat (provisioning) | Portal selesai (backend + UI). Modul: commit selesai, deploy belum |
| 3 | Master Toko, sync Google Sheet pindah ke portal | Portal: tabel, API, halaman selesai di lokal. Sumber Sheet dan modul belum |
| 4 | Master Fasilitas (bandingkan CarbonTrack dan SIAGA) | Belum |

## Langkah berikutnya: Fase 2B

### Portal (sesi ini)

- [x] (2026-11-20) Halaman admin **Manajemen User** di `#/manajemen-user` (shadcn + antislop): daftar user, cari, buat user (NIK wajib), ubah data, nonaktifkan, beri/cabut akses modul dengan pilihan role dari `GET /v1/admin/users/module-roles`, riwayat event provisioning per user beserta tombol kirim ulang untuk event yang gagal.
- [x] Tambah data tiruan untuk halaman itu di `apps/web/src/lib/dev-mock/mock-api.ts`.
- [x] Navigasi "Manajemen User" hanya untuk `SYSTEM_ADMIN` (menu AppShell sekarang satu daftar, `getNavItems`).
- [ ] Uji klik halaman Manajemen User di browser dengan `VITE_SPARTA_DEV_MOCK=true` (belum bisa dilakukan di sesi 2026-11-20, tidak ada alat browser).
- [ ] Setelah semua modul punya endpoint provisioning: hapus tulis langsung ke DB modul di `changeEmailAndBroadcast` (`apps/api/src/modules/users/users.service.ts`).

### Modul (menunggu izin user)

- [x] CarbonTrack (commit 30be73d5 di repo CarbonTrack): `POST https://grk.sparta-alfamart.web.id/api/sparta/provisioning`. Kolom `app_user.is_active`, sesi ditolak paling lama 15 detik setelah event, balasan `applied` / `ignored` (`unknown_user`, `stale_event`) / 409 bentrok email / 401 signature salah / 503 secret kosong.
  - [ ] Saat deploy (butuh izin user karena mengubah DB/env): isi `AppModule.provisioningUrl` CARBONTRACK dengan URL di atas, set `SPARTA_PROVISIONING_SECRET_CARBONTRACK` di portal sama dengan `SPARTA_PROVISIONING_SECRET` di CarbonTrack, lalu nyalakan worker.
- [x] Energy (commit 64a59e2 di repo Energy, belum deploy): `POST https://<domain-energy>/api/sparta/provisioning`. `access.granted` membuat akun otomatis (role dari `access.role`, cabang hanya untuk role USER); `user.updated` mengubah email, nama, NIK saja; revoke/deactivate set `is_active=false` dan hapus semua sesi. Balasan 401/400/409/422 (role tidak dikenal) = FAILED, 503 = retry, `ignored` untuk user tak dikenal atau event lama. Sisa rencana Energy: `docs/sso-v2-sisa-rencana.md` di repo Energy.
  - [ ] Saat deploy (butuh izin user): isi `AppModule.provisioningUrl` ENERGY, set `SPARTA_PROVISIONING_SECRET_ENERGY` sama dengan `SPARTA_PROVISIONING_SECRET` di Energy, nyalakan worker.
  - [ ] Setelah endpoint Energy aktif di produksi: hapus `changeEmailAndBroadcast` bagian Energy, dan bersihkan `branchCode` (Fase 2 modul).
- [ ] Maintenance, Building, SIAGA, Engineering: belum dihubungi.
- Syarat lanjut ke Fase 3: satu karyawan uji coba dibuat di portal lalu otomatis muncul di semua modul yang dipilih.

### Keputusan yang menunggu user

- [x] (diputuskan user, dilaporkan sesi Energy 2026-11-20: YA, monitoring ikut menolak user nonaktif lewat `AND u.is_active` setelah migrasi is_active Energy jalan) Tabel `users` Energy juga dipakai smart-energy-monitoring, yang belum mengecek `is_active`. Apakah user nonaktif juga harus ditolak di sana?
- [x] Energy membuat akun otomatis saat `access.granted` (diputuskan user 2026-11-19). CarbonTrack tidak membuat akun (balas `ignored`).
- [ ] NIK wajib di `/sync` (ditunda atas permintaan user). Form Manajemen User sudah mewajibkan NIK.
- [x] (diputuskan user 2026-11-20: YA, kode cabang Alfamart jadi kode resmi master Cabang) **Standar kode cabang resmi portal.** CarbonTrack menemukan data Scope 2 sudah memakai kode cabang Alfamart (BZ01 = BANDUNG, JZ01 = CILEUNGSI2, KZ01 = CIKOKOL, 33 kode). Apakah kode Alfamart dipakai sebagai kode resmi master Cabang? Fase 2 di semua modul menunggu keputusan ini.

## Fase 2 di modul (belum mulai)

- [x] (2026-11-20, working tree CarbonTrack, belum commit/migrasi) CarbonTrack: sync /v1/master/areas, /branches (pakai aliases), /stores?moduleId=carbontrack dengan cursor syncedAt; isActive=false dinonaktifkan tanpa hapus; ownership REGULAR=R, FRANCHISE=F, UNKNOWN/null kosong; `STORE_MASTER_SOURCE=sheet` tetap bawaan sampai portal dideploy. Menunggu portal: konversi kode Alfamart, alias CILEUNGSI_2 dan nama lama, deploy /v1/master/*.
- [x] (2026-11-20, working tree Energy, belum commit/migrasi) Energy: migrasi `20261120000000_sparta_branch_code`, ambil daftar cabang penuh tiap run (tanpa updatedSince, disetujui portal), dry-run nama tak terpetakan, `branch_code` baru ditulis setelah daftar kosong.
- Cara konversi kode Alfamart (dijanjikan ke modul): kode lama TIDAK diubah atau dihapus. Buat cabang baru berkode Alfamart, nonaktifkan cabang lama, dan jadikan namanya alias cabang baru.
- [ ] Tiap modul menambah kolom `branchCode` dan membaca `GET /v1/master/branches` lewat sync malam. Alias portal sudah menangani `HEAD OFFICE` dan nama cabang lama.
- [x] (2026-11-20) `GET /v1/master/branches` mengirim `aliases: string[]`; tambah/hapus alias mengubah `updatedAt` cabang. Kontrak di `module-sso-contract.md`.
- Syarat mulai: keputusan standar kode cabang + migrasi portal dideploy. CarbonTrack dan Energy sudah menyiapkan rencana dan menunggu kabar dari portal. Nama yang gagal dipetakan dilaporkan modul sebagai daftar, lalu admin membuat alias (contoh: `CILEUNGSI_2` ke cabang CILEUNGSI2).
- Syarat lanjut: tidak ada lagi nama cabang yang gagal dipetakan.

## Fase 3: master Toko

- [x] (2026-11-20, di working tree) Portal: master Toko. Tabel `Store` (migrasi `20261120024911_add_store_master`, baru dijalankan di `sparta_local`), API admin `/v1/admin/master/stores` (cari, saring cabang/status, paginasi server, tambah, ubah, audit), API modul `GET /v1/master/stores` (API key, `updatedSince`), tab Toko di Data Master. Lokal sudah diisi 22.530 toko Maintenance (read-only dari produksi), semua cabang dikenal.
- [x] (2026-11-20, di working tree) Aturan brand toko per modul: tabel `StoreBrand` (migrasi `20261120030225_add_store_brand_modules`, awal ALFAMART semua modul, LAWSON hanya Maintenance), kartu "Akses modul per brand" di tab Toko, `GET /v1/master/stores` wajib `moduleId`. Toko yang ditutup aksesnya dikirim `isActive:false` di sync bertahap.
- [ ] **Cek sebelum deploy:** zona waktu DB produksi. Laragon lokal `Asia/Bangkok` (UTC+7) membuat `now()` di SQL mentah tersimpan 7 jam ke depan (sudah terjadi di impor toko lokal, sudah dibetulkan). Prisma menulis UTC, tapi default `CURRENT_TIMESTAMP` di migrasi ikut zona waktu server. Kalau produksi bukan UTC, `updatedSince` modul bisa melewatkan data.
- [ ] Ke depan: API key per modul, agar portal mengenali pemanggil tanpa parameter `moduleId`.
- [ ] Sumber toko berikutnya: toko Energy yang tidak ada di Maintenance (476 kode) dan Building (118 kode); Google Sheet tetap rencana sumber resmi.
- [ ] **Wajib sebelum deploy:** ganti kode cabang ke kode Alfamart (kontrak `/v1/master/stores` sudah menjanjikan `branchCode` Alfamart ke CarbonTrack). Toko ikut otomatis karena terhubung lewat ID cabang, bukan teks kode.
- Catatan asal: master Toko, termasuk **sub-area toko** di dalam cabang (gaya Maintenance `Store.areaName`, mis. cabang CILEUNGSI: BEKASI, KARAWANG, CILEUNGSI 2, BOGOR). Berbeda dari Area portal (wilayah berisi cabang). Google Sheet tetap sumber baca saja (portal tidak pernah menulis ke Sheet), koreksi disimpan di DB portal, sync tiap malam.
- [ ] Urutan pemakai: CarbonTrack, Maintenance, SIAGA, Audit, lalu Building (validasi kode toko). Building mengabari portal saat serah terima.
- Syarat lanjut: jumlah toko aktif di portal sama dengan di Sheet.
- Laporan data toko 2026-11-20 (baca saja dari produksi):

  | Modul | Baris | Kode unik | Nama cabang unik | Cocok master cabang portal |
  |---|---|---|---|---|
  | Maintenance (`Store`) | 22.530 | 22.530 | 29 | 29 |
  | Energy (`stores`) | 22.483 | 22.483 | 39 | 37 |
  | SIAGA (`stores`) | 21.550 | 21.550 | 28 | 27 |
  | CarbonTrack (`store_master`) | 21.550 | 21.550 | 28 | 27 |
  | Building (`toko`) | 2.185 | 711 | 46 | 42 |

  Gabungan 23.119 kode toko unik; 21.550 muncul di 4-5 modul. Maintenance memuat semua kode SIAGA dan CarbonTrack, 22.007 dari 22.483 kode Energy, dan 593 dari 711 kode Building, jadi Maintenance kandidat sumber awal yang paling lengkap. Nama cabang toko yang belum ada di master portal: `CILEUNGSI_2` (Energy, SIAGA, CarbonTrack), `HO` (Energy), `BINTAN`, `PALANGKARAYA`, `SIDOARJO BPN SMD`, `SIDOARJO BPN_SMD` (Building). Cukup diselesaikan dengan alias. Building punya kode toko berulang (2.185 baris, 711 kode): satu toko bisa punya beberapa proyek.

## Fase 4: master Fasilitas

- [ ] Portal lalu CarbonTrack, SIAGA, Engineering, dan Building. Bandingkan data fasilitas CarbonTrack dan SIAGA dulu.

## Migrasi yang belum dijalankan ke database mana pun

- `20261119100000_add_area_and_branch_alias`
- `20261119100100_add_master_admin_role`
- `20261119110000_add_module_roles_and_provisioning` (termasuk isi katalog role)

## Temuan testing lokal (2026-11-20, Laragon)

- Keputusan user 2026-11-20: deploy portal (migrasi, provisioningUrl, secret, worker) dilakukan setelah semua plan selesai.
- [ ] Data Area: ada dua arti "area" di modul. (a) CarbonTrack `facility_master.region`: 9 wilayah yang mengelompokkan cabang/DC (Jabodetabek, Jawa Barat, Jawa Tengah, Jawa Timur, Banten, Bali & Nusra, Kalimantan, Sulawesi, Sumatera), sesuai model Area portal. (b) Maintenance `User.areaNames` / `Store.areaName`: pembagian toko DI DALAM cabang (cabang CILEUNGSI punya area BEKASI, KARAWANG, CILEUNGSI 2, BOGOR), kebalikan dari model portal. Diputuskan user 2026-11-20: pilihan C. (a) 9 wilayah CarbonTrack jadi Area portal (sudah diisi di lokal: 50 cabang dipasangkan otomatis karena namanya persis sama; Head Office Corporate, Tangerang 1, Tangerang 2, Cirebon dan BANDUNG RAYA belum dipasangkan karena tidak ada pasangan pasti). (b) sub-area toko gaya Maintenance masuk Fase 3. Catatan lama: `Store.areaName` di Maintenance berisi nama cabang, bukan area (16.310 toko kosong). Daftar area dan pembagian cabang per area perlu datang dari user/bisnis, lalu diisi lewat tab Area.
- Building `alamat_cabang` (36 baris) berisi kode cabang resmi Alfamart (1AZ1 Pekanbaru, 1JZ1 Karawang, 2GZ1 Serang, dst.) dan alamatnya. Bahan untuk keputusan standar kode cabang dan untuk mengisi alamat master Cabang.

- [x] (diperbaiki lewat seed, lihat catatan keamanan) Di database baru, migrasi `20261119110000` tidak mengisi katalog role Energy dan Maintenance, karena `INSERT ... WHERE EXISTS AppModule` jalan sebelum seed membuat `AppModule`. Produksi aman karena modul sudah ada. Perbaikan yang disarankan: seed juga meng-upsert katalog role. Sementara ini katalog lokal diisi manual dengan menjalankan ulang INSERT tersebut.

## Catatan keamanan yang belum dibereskan

- [ ] Rotate password DB `aku-sparta` (103.127.99.241). Password masih ada di riwayat git (`get-modules.js`, `check-users.ts`, `seed-users.ts` versi lama), jadi rotate wajib walau file sudah dibersihkan.
- [x] (2026-11-20) `get-modules.js` dan `check-users.ts` dihapus. `seed-users.ts` membaca koneksi modul dari env (`SPARTA_BUILDING_DATABASE_URL`, `SPARTA_ENERGY_DATABASE_URL`, `SPARTA_MAINTENANCE_DATABASE_URL`) dan menolak jalan tanpa `SPARTA_SEED_USERS_CONFIRM=hapus-semua-user`.
- [x] (2026-11-20) Seed mengisi katalog role modul, jadi database baru tidak lagi kosong (diuji di DB baru: 11 role).
- [x] (2026-11-20) Password login terlihat di DevTools: dicek, bukan celah. Itu isi form user sendiri; jalurnya HTTPS (web dialihkan ke HTTPS, API HTTPS + HSTS), body tidak dicatat logger, password disimpan Argon2.
- [x] (2026-11-20, working tree) Web: `apps/web/nginx.conf` menggantikan `sed` di Dockerfile (routing SPA + HSTS tanpa includeSubDomains, nosniff, Referrer-Policy, X-Frame-Options DENY). Sintaks diuji dengan nginx 1.22 Laragon. Alamat localhost dev dan env dev tidak lagi ikut ke bundle produksi.
- [x] (2026-11-20, working tree) Password dikirim tersegel dari browser (permintaan user): `GET /v1/auth/credential-key`, middleware `openSealedCredentials`, RSA-OAEP + AES-GCM (Web Crypto). Dipakai di login, password pertama, lupa password, ganti password, ganti email. Request biasa tetap diterima (kompatibel), dan web jatuh ke kirim biasa bila Web Crypto tidak ada (HTTP non-localhost).
- [ ] **Saat deploy API:** kalau API berjalan lebih dari satu instance, isi `SPARTA_CREDENTIAL_PRIVATE_KEY` (PEM RSA 2048) yang sama di semua instance. Tanpa itu tiap instance membuat kunci sendiri dan login bisa gagal bergantian.
- [ ] Setelah deploy web: cek header HSTS muncul di https://sparta-alfamart.web.id, dan pastikan tidak ada modul yang memuat portal di dalam iframe (X-Frame-Options DENY akan memblokirnya).
- [ ] `SPARTA_INTERNAL_API_KEY` punya nilai bawaan di `apps/api/src/config/env.ts`. Hapus nilai bawaan setelah semua server dipastikan mengisi env ini.
- [ ] `changeEmailAndBroadcast` menulis langsung ke DB Building, Energy, dan Maintenance (lihat Fase 2B).
- [ ] Dependensi npm `cn` yang tidak terpakai di `apps/web/package.json`.

## Lingkungan dev

- Mode tiruan web: `VITE_SPARTA_DEV_MOCK=true` (hanya saat `pnpm dev`), role lewat `VITE_SPARTA_DEV_ROLE`. API lokal tidak bisa menjangkau DB portal.
- Testing lokal dengan Laragon: database `sparta_local` di PostgreSQL Laragon (port 5432, user `postgres`). Konfigurasi di `apps/api/.env.development` dan `apps/web/.env.development.local` (keduanya gitignored, `.env.development.local` mematikan mode tiruan). Kredensial Google diisi nilai palsu, jadi OTP lupa/ganti password tidak bisa dikirim. Akun uji: `admin@sparta.local`, `masteradmin@sparta.local` (password `SpartaLokal2026!`).
- 2026-11-20: `sparta_local` diisi salinan DB portal produksi (`sparta` di 103.127.99.241), dibaca dengan koneksi read-only: 1.074 user, 94 cabang, 1.930 akses. `passwordHash`, sesi, OTP dan audit tidak disalin. Temuan dari data asli: 1.054 user belum punya NIK, 66 dari 94 kode cabang tidak baku, dan CarbonTrack baru 3 user di portal (DB `grk` punya 7 akun, sebagian tanpa email).
