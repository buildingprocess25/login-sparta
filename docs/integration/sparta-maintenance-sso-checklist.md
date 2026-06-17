# SPARTA Maintenance SSO Checklist

Checklist integrasi SSO untuk SPARTA Maintenance dengan SPARTA Login Portal.

## 1. Export Active Users

- [ ] Export semua user aktif Maintenance ke CSV dengan format:
  - email
  - fullName
  - employeeId
  - branchCode
  - branchName
  - role (ADMIN, BMS, BMC, BNM, MANAGER, USER)
- [ ] Mapping role Maintenance ke role standar jika diperlukan
- [ ] Validasi tidak ada email duplikat
- [ ] Simpan hasil export sebagai `maintenance-users-export.csv`

## 2. Map Maintenance Roles

Maintenance memiliki role spesifik yang harus dipetakan:

- [ ] **ADMIN** → full access ke semua fitur Maintenance
- [ ] **BMS** (Building Management System) → akses operasional toko
- [ ] **BMC** (Building Management Control) → akses kontrol dan monitoring
- [ ] **BNM** (Building & Network Management) → akses network dan infrastruktur
- [ ] **MANAGER** → akses approval dan laporan
- [ ] **USER** → akses dasar untuk input data

Role mapping ini **tetap dikelola** di Maintenance, SPARTA Portal hanya tahu user punya akses ke modul `maintenance`.

## 3. Normalize Branch Data

- [ ] Mapping branch code Maintenance ke branch code SPARTA Portal
- [ ] Pastikan nama cabang konsisten
- [ ] Update referensi branch lama ke format baru jika ada perbedaan

## 4. Add spartaUserId Column

- [ ] Tambah kolom `spartaUserId` (VARCHAR, nullable) ke tabel user Maintenance
- [ ] Buat index pada `spartaUserId` untuk lookup cepat
- [ ] Migrasi data: map email user Maintenance ke user SPARTA Portal

```sql
ALTER TABLE maintenance_users ADD COLUMN sparta_user_id VARCHAR(255);
CREATE INDEX idx_maintenance_users_sparta_user_id ON maintenance_users(sparta_user_id);
```

## 5. Implement SSO Callback Endpoint

- [ ] Tambah route `GET /auth/sso/callback?token=<launch-token>`
- [ ] Backend call `POST <SPARTA_API>/v1/sso/exchange` dengan moduleId `"maintenance"` dan launchToken
- [ ] Map `email` dari response ke user Maintenance (gunakan spartaUserId atau email)
- [ ] Buat session Maintenance lokal setelah user ditemukan
- [ ] Redirect ke Maintenance dashboard

Referensi: `docs/integration/module-sso-contract.md`

## 6. Replace Local Login

- [ ] Ubah halaman login Maintenance menjadi redirect ke SPARTA Login Portal:
  ```
  https://login.sparta.local
  ```
- [ ] Hapus form login Maintenance (email/password input)
- [ ] Tampilkan pesan: "Anda akan diarahkan ke SPARTA Login Portal..."
- [ ] **Jangan hapus** logic autentikasi lokal hingga SSO production verified

## 7. Preserve Maintenance Authorization

- [ ] Authorization Maintenance (BMS, BMC, BNM, MANAGER role) **tetap dikelola** oleh Maintenance
- [ ] SPARTA Portal hanya menjamin identitas user dan daftar modul
- [ ] Validasi role Maintenance tetap berjalan setelah SSO login
- [ ] Pastikan fitur report, dashboard, PJUM authorization tidak terpengaruh
- [ ] Pastikan approval workflow tetap respect role hierarchy

## 8. Verify Historical Data

- [ ] Pastikan laporan historis Maintenance masih resolve user dengan benar
- [ ] Pastikan audit log tetap menampilkan nama user dan role
- [ ] Test join query antara tabel transaksi dan tabel user
- [ ] Verifikasi laporan PJUM tidak broken
- [ ] Verifikasi dashboard analytics tetap akurat

## 9. Testing Checklist

- [ ] Test SSO login dengan setiap role (BMS, BMC, BNM, MANAGER, USER)
- [ ] Test akses dashboard sesuai role
- [ ] Test approval flow tetap berjalan
- [ ] Test akses ditolak jika user tidak ada di Maintenance
- [ ] Test akses ditolak jika token expired/consumed
- [ ] Test logout Maintenance tidak logout dari SPARTA Portal
- [ ] Test concurrent login dari modul berbeda

## 10. Rollback Plan

- [ ] Backup database sebelum migrasi spartaUserId
- [ ] Simpan halaman login Maintenance lama untuk rollback
- [ ] Dokumentasi cara revert SSO callback endpoint
- [ ] Feature flag untuk switch antara SSO dan login lokal (development only)