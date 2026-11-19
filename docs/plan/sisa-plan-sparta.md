# Sisa Plan SPARTA (lanjut 2026-11-20)

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
| 2B | Manajemen user terpusat (provisioning) | Backend portal selesai. UI dan sisi modul belum |
| 3 | Master Toko, sync Google Sheet pindah ke portal | Belum |
| 4 | Master Fasilitas (bandingkan CarbonTrack dan SIAGA) | Belum |

## Langkah berikutnya: Fase 2B

### Portal (sesi ini)

- [ ] Halaman admin **Manajemen User** (shadcn + antislop): daftar user, cari, buat user (NIK wajib), ubah data, nonaktifkan, beri/cabut akses modul dengan pilihan role dari `GET /v1/admin/users/module-roles`, riwayat event provisioning per user beserta tombol kirim ulang untuk event yang gagal.
- [ ] Tambah data tiruan untuk halaman itu di `apps/web/src/lib/dev-mock/mock-api.ts`.
- [ ] Navigasi "Manajemen User" hanya untuk `SYSTEM_ADMIN`.
- [ ] Setelah semua modul punya endpoint provisioning: hapus tulis langsung ke DB modul di `changeEmailAndBroadcast` (`apps/api/src/modules/users/users.service.ts`).

### Modul (menunggu izin user)

- [ ] CarbonTrack: endpoint provisioning, kolom status aktif di `AppUser`, tolak sesi cookie untuk user nonaktif, balas `ignored` untuk user yang belum ada.
- [ ] Energy: endpoint provisioning, kolom `is_active`, hapus sesi `sso_session` saat dinonaktifkan, kolom `last_provisioned_at`.
- [ ] Maintenance, Building, SIAGA, Engineering: belum dihubungi.
- Syarat lanjut ke Fase 3: satu karyawan uji coba dibuat di portal lalu otomatis muncul di semua modul yang dipilih.

### Keputusan yang menunggu user

- [ ] Tabel `users` Energy juga dipakai smart-energy-monitoring. Apakah user nonaktif juga harus ditolak di sana? Kalau ya, aplikasi itu ikut mengecek kolom `is_active`.
- [ ] Energy: buat akun otomatis saat `access.granted` untuk user yang belum ada, atau balas `ignored`?
- [ ] NIK wajib di `/sync` (ditunda atas permintaan user).

## Fase 2 di modul (belum mulai)

- [ ] Tiap modul menambah kolom `branchCode` dan membaca `GET /v1/master/branches` lewat sync malam. Alias portal sudah menangani `HEAD OFFICE` dan nama cabang lama.
- Syarat lanjut: tidak ada lagi nama cabang yang gagal dipetakan.

## Fase 3: master Toko

- [ ] Portal: master Toko. Google Sheet tetap sumber baca saja (portal tidak pernah menulis ke Sheet), koreksi disimpan di DB portal, sync tiap malam.
- [ ] Urutan pemakai: CarbonTrack, Maintenance, SIAGA, Audit, lalu Building (validasi kode toko). Building mengabari portal saat serah terima.
- Syarat lanjut: jumlah toko aktif di portal sama dengan di Sheet.

## Fase 4: master Fasilitas

- [ ] Portal lalu CarbonTrack, SIAGA, Engineering, dan Building. Bandingkan data fasilitas CarbonTrack dan SIAGA dulu.

## Migrasi yang belum dijalankan ke database mana pun

- `20261119100000_add_area_and_branch_alias`
- `20261119100100_add_master_admin_role`
- `20261119110000_add_module_roles_and_provisioning` (termasuk isi katalog role)

## Catatan keamanan yang belum dibereskan

- [ ] `get-modules.js` (sudah ter-commit) berisi kredensial DB untuk IP publik 103.127.99.241. Rotate password, lalu hapus file.
- [ ] `SPARTA_INTERNAL_API_KEY` punya nilai bawaan di `apps/api/src/config/env.ts`. Hapus nilai bawaan setelah semua server dipastikan mengisi env ini.
- [ ] `changeEmailAndBroadcast` menulis langsung ke DB Building, Energy, dan Maintenance (lihat Fase 2B).
- [ ] Dependensi npm `cn` yang tidak terpakai di `apps/web/package.json`.

## Lingkungan dev

- Mode tiruan web: `VITE_SPARTA_DEV_MOCK=true` (hanya saat `pnpm dev`), role lewat `VITE_SPARTA_DEV_ROLE`. API lokal tidak bisa menjangkau DB portal.
