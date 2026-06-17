# SPARTA Energy SSO Checklist

Checklist integrasi SSO untuk SPARTA Energy dengan SPARTA Login Portal.

## 1. Export Active Users

- [ ] Export semua user aktif Energy ke CSV dengan format:
  - email
  - fullName
  - employeeId
  - branchCode
  - branchName
  - role (AUDITOR, ENGINEER, MANAGER, USER, dll)
- [ ] Validasi tidak ada email duplikat
- [ ] Simpan hasil export sebagai `energy-users-export.csv`

## 2. Map Energy Module Roles

Energy memiliki role spesifik yang harus dipetakan:

- [ ] **AUDITOR** → akses penuh untuk audit peralatan dan energy assessment
- [ ] **ENGINEER** → akses teknis untuk estimasi kebutuhan energi
- [ ] **MANAGER** → akses approval dan laporan
- [ ] **USER** → akses dasar untuk input data dan lihat laporan

Role mapping ini **tetap dikelola** di Energy, SPARTA Portal hanya tahu user punya akses ke modul `energy`.

## 3. Normalize Branch Data

- [ ] Mapping branch code Energy ke branch code SPARTA Portal
- [ ] Pastikan nama cabang konsisten
- [ ] Update referensi branch lama ke format baru jika ada perbedaan

## 4. Verify Prisma Migration History

- [ ] **Penting**: Energy menggunakan Prisma ORM. Periksa riwayat migration sebelum menambah column.
- [ ] Jalankan `prisma migrate status` untuk memastikan semua migration sudah applied
- [ ] Pastikan tidak ada pending migration yang bisa conflict
- [ ] Buat backup schema sebelum migration baru

```bash
pnpm prisma migrate status
pnpm prisma migrate dev --name add_sparta_user_id
```

## 5. Add spartaUserId Column

- [ ] Tambah kolom `spartaUserId` (nullable) ke tabel user Energy
- [ ] Buat index pada `spartaUserId` untuk lookup cepat
- [ ] Migrasi data: map email user Energy ke user SPARTA Portal

Tambah ke Prisma schema Energy:

```prisma
model EnergyUser {
  id          String  @id @default(cuid())
  email       String  @unique
  spartaUserId String? @unique
  // ... kolom existing
  @@index([spartaUserId])
}
```

Kemudian jalankan: `pnpm prisma migrate dev --name add_sparta_user_id`

## 6. Implement SSO Callback Endpoint

- [ ] Tambah route `GET /auth/sso/callback?token=<launch-token>`
- [ ] Backend call `POST <SPARTA_API>/v1/sso/exchange` dengan moduleId `"energy"` dan launchToken
- [ ] Map `email` dari response ke user Energy (gunakan spartaUserId atau email)
- [ ] Buat session Energy lokal setelah user ditemukan
- [ ] Redirect ke Energy dashboard

Referensi: `docs/integration/module-sso-contract.md`

## 7. Replace Local Login

- [ ] Ubah halaman login Energy menjadi redirect ke SPARTA Login Portal:
  ```
  https://login.sparta.local
  ```
- [ ] Hapus form login Energy (email/password input)
- [ ] Tampilkan pesan: "Anda akan diarahkan ke SPARTA Login Portal..."
- [ ] **Jangan hapus** logic autentikasi lokal hingga SSO production verified

## 8. Preserve Energy Authorization

- [ ] Authorization Energy (AUDITOR, ENGINEER, MANAGER role) **tetap dikelola** oleh Energy
- [ ] SPARTA Portal hanya menjamin identitas user dan daftar modul
- [ ] Validasi role Energy tetap berjalan setelah SSO login
- [ ] Pastikan fitur audit peralatan dan estimasi energi tidak terpengaruh
- [ ] Pastikan laporan audit tetap respect role hierarchy

## 9. Testing Checklist

- [ ] Test SSO login dengan setiap role (AUDITOR, ENGINEER, MANAGER, USER)
- [ ] Test akses fitur audit sesuai role
- [ ] Test akses ditolak jika user tidak ada di Energy
- [ ] Test akses ditolak jika token expired/consumed
- [ ] Test logout Energy tidak logout dari SPARTA Portal
- [ ] Test concurrent login dari modul berbeda

## 10. Rollback Plan

- [ ] Backup database sebelum migrasi spartaUserId
- [ ] Simpan halaman login Energy lama untuk rollback
- [ ] Dokumentasi cara revert SSO callback endpoint
- [ ] Prisma migration rollback:
  ```bash
  pnpm prisma migrate resolve --rolled-back add_sparta_user_id
  ```
- [ ] Feature flag untuk switch antara SSO dan login lokal (development only)