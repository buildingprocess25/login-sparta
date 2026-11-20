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
- [x] (2026-11-20) Uji klik di browser oleh user: Manajemen User, Data Master, tab Toko, Akses brand, login terenkripsi. Dinyatakan aman.
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
- [x] (2026-11-20, lokal) Toko Energy (476) dan Building (111) sudah ditambahkan. Google Sheet tetap rencana sumber resmi.
- [x] (2026-11-20, lokal) Konversi kode Alfamart: skrip `apps/api/src/scripts/convert-branch-codes.ts` (dry-run bawaan, `--apply`, `--stores-by-subarea`, menolak DB non-lokal tanpa `--allow-remote`) + data `apps/api/prisma/data/alfamart-branch-codes.json` (36 kode dari building.alamat_cabang dan grk.store_kwh_monthly, plus HEAD). Hasil lokal: 36 cabang Alfamart + HEAD, cabang lama nonaktif dan jadi alias, 5.563 toko dipindah sesuai sub-area. `/sync` sekarang mendahulukan kode aktif, lalu alias, lalu kode nonaktif (diuji: CIKOKOL -> KZ01, CILEUNGSI_2 -> JZ01). Alias boleh sama dengan kode cabang nonaktif.
- [x] (2026-11-20, lokal) Toko tambahan: 476 dari Energy, 111 dari Building (total 23.117). 2 toko Building tidak masuk (cabang SIDOARJO BPN SMD).
- [x] (2026-11-20) **Temuan bahaya:** meng-import `@prisma/client` memuat `apps/api/.env` yang berisi DATABASE_URL PRODUKSI. `seed.ts`, skrip konversi, dan `prisma/import-users.ts` sudah memuat env lebih dulu dan memberi `datasourceUrl` eksplisit. Sisa (user): Saran: hapus DATABASE_URL dari `apps/api/.env` lokal (pakai env platform saat deploy).
- Data Energy (2026-11-20): nama gabungan dan "all" di users.branch berarti user multi-cabang (Energy memecah per koma), jadi tidak perlu alias. Di stores Energy yang bermasalah hanya BANDUNG RAYA (1.344 toko, PRIORITAS), CILEUNGSI_2 (52, sudah JZ01), dan HO (1, sudah HEAD). Ejaan Energy: "CILEUNGSI2" (sudah alias JZ01) dan "SIDOARJO BPN_SMD" (underscore), jadi alias nanti harus untuk kedua ejaan. Fase 2 Energy di-commit 7ed2543.
- [ ] (ditunda user 2026-11-20, dikerjakan nanti) Keputusan user, cabang aktif tanpa kode Alfamart (CILEUNGSI sudah = JZ01; nama gabungan dan "all" tidak perlu alias): BANDUNG RAYA (15 user), ACEH, BANGKA, BELITUNG, KOTABUMI, MANOKWARI, NTT, SORONG, SUMBAWA (perlu kode Alfamart), SIDOARJO BPN SMD, nama gabungan (mis. "CILEUNGSI, BOGOR"), dan data sampah (all, ALL, DEMO, PUSAT, TEST, WH BANDUNG).
- [x] (2026-11-20) DIBATALKAN: pemindahan toko per sub-area. Dicek per kode toko terhadap CarbonTrack (yang dikonfirmasi user benar): sub-area Maintenance adalah pembagian wilayah DI DALAM cabang (KZ01 = CIKOKOL, BALARAJA, SERANG, PARUNG; JZ01 = CILEUNGSI 2, KARAWANG, BEKASI, BOGOR). Opsi `--stores-by-subarea` dihapus dari skrip. CILEUNGSI (Maintenance) = JZ01, sudah dipetakan. Hasil: 21.548 dari 21.550 toko CarbonTrack sama cabangnya dengan portal; 2 sisanya CarbonTrack=MALANG vs Maintenance=JEMBER (YZ01).
- [x] (diputuskan: ya, gabungkan) Keputusan user (dari CarbonTrack): STORE_BRANCH_MERGES CarbonTrack baru menggabungkan TZ01, 1MZ1 ke KZ01 dan XZ01, 1JZ1 ke JZ01. SERANG (2GZ1) dan BEKASI (CZ01) masih terpisah di Scope 2, padahal di portal keduanya sub-area KZ01/JZ01. Menggabungkan keduanya hanya mengubah angka per cabang Jan-Jun 2026; total Scope 2 tetap.
- [x] (2026-11-20, lokal) Keputusan user: TZ01, 2GZ1, 1MZ1 digabung ke KZ01; 1JZ1, CZ01, XZ01 ke JZ01 (`mergedInto` di alfamart-branch-codes.json, langkah gabung di skrip konversi). Toko (118, asal Energy/Building), user (26) dan alias pindah ke induk; kode/nama lama jadi alias induk; keenam cabang nonaktif. Diuji: /sync BALARAJA -> KZ01; 21.548/21.550 toko CarbonTrack tetap cocok. CarbonTrack diminta menggabungkan SERANG dan BEKASI juga di STORE_BRANCH_MERGES (keputusan user: ya).
- [x] (diputuskan user 2026-11-20: (a) akses melebar diterima, karena master dipakai semua project. Dikunci sebagai aturan umum di module-sso-contract.md "Aturan akses berbasis cabang": unit akses bawaan = branchCode; diperbarui user: modul BOLEH membatasi lebih sempit, mis. lewat subArea, kalau benar-benar butuh, asal branchCode tetap kunci cabang, aturannya didokumentasikan dan dikabarkan ke portal, dan subArea dilengkapi portal dulu) **Keputusan user (efek penggabungan, dari Energy):** setelah branch_code aktif, akses toko di Energy dicocokkan lewat kode cabang. Sekitar 40 user Energy bercabang tunggal (BALARAJA 8, KARAWANG 6, PARUNG 5, SERANG 5, BOGOR 5, CILEUNGSI2 5, CIKOKOL 4) akan melihat SEMUA toko cabang induknya (KZ01 atau JZ01). Pilihan: (a) akses melebar diterima; (b) dibatasi per sub-area. Untuk (b), master Toko harus mengisi sub-area untuk toko asal Energy/Building (saat ini kosong; hanya toko asal Maintenance yang punya sub-area).
- (riwayat) Keputusan user: kode resmi TZ01 (Balaraja), 2GZ1 (Serang), 1MZ1 (Parung), 1JZ1 (Karawang), CZ01 (Bekasi), XZ01 (Bogor) sekarang tanpa toko (wilayahnya ada di KZ01/JZ01). Biarkan aktif (mungkin masih dipakai Building) atau nonaktifkan? Catatan CarbonTrack: kalau tetap aktif, keenamnya muncul di dropdown cabang form pengguna CarbonTrack.
- (riwayat) Konfirmasi user: "sub-area Maintenance = cabang Alfamart" (dasar `--stores-by-subarea`). Masukan CarbonTrack 2026-11-20: di laporan KWH, TZ01 (Balaraja), 1MZ1 (Parung), XZ01 (Bogor), 1JZ1 (Karawang) hanya muncul Jan-Jun 2026; sejak Juli tokonya melapor di bawah KZ01/JZ01. Kemungkinan besar cabang itu sudah digabung, dan sub-area = bekas cabang. Rekomendasi: batalkan pemindahan per sub-area (toko tetap di KZ01/JZ01). Jawaban CarbonTrack: SERANG (2GZ1, 6 toko, Jan-Apr 2026) dan BEKASI (CZ01, 6 toko, Jan-Jun 2026) TIDAK tergabung. Keduanya berhenti melapor, dan tokonya tidak muncul lagi di cabang mana pun. Catatan: bukti "TZ01/1MZ1/XZ01/1JZ1 digabung" berasal dari catatan di kode import CarbonTrack (bukan query hari ini), karena data mentahnya sudah digabung saat import. Pembanding: di Maintenance, sub-area SERANG 594 toko dan BEKASI 783 toko masih tercatat.
- CarbonTrack: NCH (6A00/6B00/6C00) tidak perlu jadi cabang portal (grid PLN dari pemetaan lokal).
- [x] Sebelumnya: **Wajib sebelum deploy:** ganti kode cabang ke kode Alfamart (kontrak `/v1/master/stores` sudah menjanjikan `branchCode` Alfamart ke CarbonTrack). Toko ikut otomatis karena terhubung lewat ID cabang, bukan teks kode.
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
- [ ] **DITAHAN (keputusan user 2026-11-20): area untuk cabang yang belum punya area** (Head Office, Tangerang 1 dan 2, Cirebon, BANDUNG RAYA, dan cabang luar Jawa). Dilihat lagi ke depan.
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
- [x] (2026-11-20) Dependensi npm `cn` dihapus. Ternyata dipakai keliru oleh `ui/pagination.tsx` hasil CLI shadcn; import diganti ke `@/lib/utils`.

## Lingkungan dev

- Mode tiruan web: `VITE_SPARTA_DEV_MOCK=true` (hanya saat `pnpm dev`), role lewat `VITE_SPARTA_DEV_ROLE`. API lokal tidak bisa menjangkau DB portal.
- Testing lokal dengan Laragon: database `sparta_local` di PostgreSQL Laragon (port 5432, user `postgres`). Konfigurasi di `apps/api/.env.development` dan `apps/web/.env.development.local` (keduanya gitignored, `.env.development.local` mematikan mode tiruan). Kredensial Google diisi nilai palsu, jadi OTP lupa/ganti password tidak bisa dikirim. Akun uji: `admin@sparta.local`, `masteradmin@sparta.local` (password `SpartaLokal2026!`).
- 2026-11-20: `sparta_local` diisi salinan DB portal produksi (`sparta` di 103.127.99.241), dibaca dengan koneksi read-only: 1.074 user, 94 cabang, 1.930 akses. `passwordHash`, sesi, OTP dan audit tidak disalin. Temuan dari data asli: 1.054 user belum punya NIK, 66 dari 94 kode cabang tidak baku, dan CarbonTrack baru 3 user di portal (DB `grk` punya 7 akun, sebagian tanpa email).
