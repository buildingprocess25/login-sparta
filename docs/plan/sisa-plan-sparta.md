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

- [x] CarbonTrack (2026-11-19, di working tree, belum di-commit): `POST https://grk.sparta-alfamart.web.id/api/sparta/provisioning`. Kolom `app_user.is_active`, sesi ditolak paling lama 15 detik setelah event, balasan `applied` / `ignored` (`unknown_user`, `stale_event`) / 409 bentrok email / 401 signature salah / 503 secret kosong.
  - [ ] Saat deploy (butuh izin user karena mengubah DB/env): isi `AppModule.provisioningUrl` CARBONTRACK dengan URL di atas, set `SPARTA_PROVISIONING_SECRET_CARBONTRACK` di portal sama dengan `SPARTA_PROVISIONING_SECRET` di CarbonTrack, lalu nyalakan worker.
- [x] Energy (2026-11-19, di working tree, belum di-commit/deploy): `POST https://<domain-energy>/api/sparta/provisioning`. `access.granted` membuat akun otomatis (role dari `access.role`, cabang hanya untuk role USER); `user.updated` mengubah email, nama, NIK saja; revoke/deactivate set `is_active=false` dan hapus semua sesi. Balasan 401/400/409/422 (role tidak dikenal) = FAILED, 503 = retry, `ignored` untuk user tak dikenal atau event lama. Sisa rencana Energy: `docs/sso-v2-sisa-rencana.md` di repo Energy.
  - [ ] Saat deploy (butuh izin user): isi `AppModule.provisioningUrl` ENERGY, set `SPARTA_PROVISIONING_SECRET_ENERGY` sama dengan `SPARTA_PROVISIONING_SECRET` di Energy, nyalakan worker.
  - [ ] Setelah endpoint Energy aktif di produksi: hapus `changeEmailAndBroadcast` bagian Energy, dan bersihkan `branchCode` (Fase 2 modul).
- [ ] Maintenance, Building, SIAGA, Engineering: belum dihubungi.
- Syarat lanjut ke Fase 3: satu karyawan uji coba dibuat di portal lalu otomatis muncul di semua modul yang dipilih.

### Keputusan yang menunggu user

- [ ] Tabel `users` Energy juga dipakai smart-energy-monitoring, yang belum mengecek `is_active`. Apakah user nonaktif juga harus ditolak di sana?
- [x] Energy membuat akun otomatis saat `access.granted` (diputuskan user 2026-11-19). CarbonTrack tidak membuat akun (balas `ignored`).
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
