# SPARTA Building SSO Checklist

Checklist integrasi SSO untuk SPARTA Building dengan SPARTA Login Portal.

## 1. Export Active Users

- [ ] Export semua user aktif Building ke CSV dengan format:
  - email
  - fullName
  - employeeId
  - branchCode
  - branchName
  - role (ADMIN, USER, dll)
- [ ] Validasi tidak ada email duplikat
- [ ] Simpan hasil export sebagai `building-users-export.csv`

## 2. Normalize Branch Data

- [ ] Mapping branch code Building ke branch code SPARTA Portal
- [ ] Pastikan nama cabang konsisten
- [ ] Update referensi branch lama ke format baru jika ada perbedaan

## 3. Add spartaUserId Column

- [ ] Tambah kolom `spartaUserId` (VARCHAR, nullable) ke tabel user Building
- [ ] Buat index pada `spartaUserId` untuk lookup cepat
- [ ] Migrasi data: map email user Building ke user SPARTA Portal

```sql
ALTER TABLE building_users ADD COLUMN sparta_user_id VARCHAR(255);
CREATE INDEX idx_building_users_sparta_user_id ON building_users(sparta_user_id);
```

## 4. Implement SSO Callback Endpoint

- [ ] Tambah route `GET /auth/sso/callback?token=<launch-token>`
- [ ] Backend call `POST <SPARTA_API>/v1/sso/exchange` dengan moduleId `"building"` dan launchToken
- [ ] Map `email` dari response ke user Building (gunakan spartaUserId atau email)
- [ ] Buat session Building lokal setelah user ditemukan
- [ ] Redirect ke Building dashboard

Referensi: `docs/integration/module-sso-contract.md`

## 5. Replace Local Login

- [ ] Ubah halaman login Building menjadi redirect ke SPARTA Login Portal:
  ```
  https://login.sparta.local
  ```
- [ ] Hapus form login Building (email/password input)
- [ ] Tampilkan pesan: "Anda akan diarahkan ke SPARTA Login Portal..."
- [ ] **Jangan hapus** logic autentikasi lokal hingga SSO production verified

## 6. Preserve Building Authorization

- [ ] Authorization Building (role, permission, access control) **tetap dikelola** oleh Building
- [ ] SPARTA Portal hanya menjamin identitas user dan daftar modul
- [ ] Validasi role Building tetap berjalan setelah SSO login
- [ ] Pastikan fitur seperti project access, approval flow tidak terpengaruh

## 7. Verify Historical Data

- [ ] Pastikan laporan historis Building masih resolve user dengan benar
- [ ] Pastikan audit log tetap menampilkan nama user
- [ ] Test join query antara tabel transaksi dan tabel user
- [ ] Verifikasi tidak ada broken foreign key reference

## 8. Testing Checklist

- [ ] Test SSO login dengan user baru
- [ ] Test SSO login dengan user existing yang sudah punya spartaUserId
- [ ] Test akses ditolak jika user tidak ada di Building
- [ ] Test akses ditolak jika token expired/consumed
- [ ] Test logout Building tidak logout dari SPARTA Portal (session terpisah)
- [ ] Test concurrent login dari modul berbeda

## 9. Rollback Plan

- [ ] Backup database sebelum migrasi spartaUserId
- [ ] Simpan halaman login Building lama untuk rollback
- [ ] Dokumentasi cara revert SSO callback endpoint
- [ ] Feature flag untuk switch antara SSO dan login lokal (development only)