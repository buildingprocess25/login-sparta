# Module SSO Contract

Dokumen ini menjelaskan alur integrasi SSO antara SPARTA Login Portal dan setiap modul (Building, Maintenance, Energy).

## Alur SSO

```text
1. User login di SPARTA Login Portal dan membuka Module Launcher.
2. User klik modul → frontend POST /v1/modules/:moduleId/launch.
3. Backend SPARTA membuat launch token satu kali pakai (TTL 2 menit).
4. Backend mengembalikan redirectUrl berisi callback URL modul + launch token.
5. Frontend redirect browser ke redirectUrl modul.
6. Modul menerima GET /auth/sso/callback?token=<launch-token>.
7. Modul backend memanggil POST <SPARTA_API>/v1/sso/exchange dengan body:
   {
     "moduleId": "building",
     "launchToken": "<launch-token>"
   }
8. SPARTA API memverifikasi token: belum dipakai, belum expired, moduleId cocok.
9. SPARTA API mengembalikan user payload (kontrak v2, lihat di bawah).
10. Modul mencari user lokal: spartaUserId dulu, lalu employeeId (NIK), lalu email.
    Setelah cocok, modul menyimpan spartaUserId agar ganti email di portal tidak memutus akun.
11. Modul membuat session lokal sendiri.
12. Modul redirect ke dashboard.
```

## Kontrak API

### POST /v1/sso/exchange

**Request Body:**

| Field | Type | Required | Keterangan |
| --- | --- | --- | --- |
| `moduleId` | `string` | ✅ | `"building"`, `"maintenance"`, atau `"energy"` |
| `launchToken` | `string` | ✅ | Token dari query parameter callback URL |

**Success Response (200), kontrak v2:**

```json
{
  "data": {
    "user": {
      "contractVersion": 2,
      "spartaUserId": "clx0abc123",
      "employeeId": "2010123456",
      "email": "andi.halim@sparta.local",
      "fullName": "Andi Halim",
      "branch": "Jakarta Pusat",
      "branchCode": "JKP",
      "access": ["building", "maintenance"]
    }
  }
}
```

| Field | Type | Keterangan |
| --- | --- | --- |
| `contractVersion` | `number` | `2`. Payload tanpa field ini adalah v1. |
| `spartaUserId` | `string` | ID user portal (cuid). Tidak pernah berubah dan tidak dipakai ulang. Kunci utama pencocokan user. |
| `employeeId` | `string \| null` | NIK. `null` hanya untuk akun lama yang NIK-nya belum dilengkapi. |
| `email` | `string` | Huruf kecil. Bisa berubah lewat portal; jangan dijadikan kunci permanen. |
| `fullName` | `string` | Nama lengkap. |
| `branch` | `string` | Nama cabang utama (field v1, tetap dikirim). |
| `branchCode` | `string` | Kode cabang utama. Belum bersih sampai Fase 2; jangan dijadikan kunci dulu. |
| `access` | `string[]` | Modul yang boleh diakses user. |

Tipe TypeScript bersama: `SpartaSsoUserPayload` di `apps/shared/src/sparta.ts`.

**Kompatibilitas:** field v1 (`email`, `fullName`, `branch`, `access`) tidak berubah. Modul harus tetap menerima payload v1 selama masa transisi.

**Error Responses:**

| Status | Code | Kondisi |
| --- | --- | --- |
| 400 | `INVALID_SSO_TOKEN` | Token tidak ditemukan |
| 400 | `SSO_TOKEN_CONSUMED` | Token sudah dipakai |
| 400 | `SSO_TOKEN_EXPIRED` | Token sudah kedaluwarsa |
| 403 | `SSO_MODULE_MISMATCH` | Token tidak sesuai moduleId |

### POST /v1/admin/users/sync (modul ke portal, API key internal)

Membuat user portal baru atau memberi akses modul ke user yang sudah ada. Respons berisi `data.spartaUserId` (sama dengan `data.id`); modul menyimpannya saat admin menambah user.

Email user hanya bisa diganti lewat portal. Untuk user yang sudah punya `spartaUserId`, form admin modul membuat email read-only, dan sync dari modul tidak mengubah email di portal.

### POST /v1/admin/users/sync-delete (modul ke portal, API key internal)

```json
{ "spartaUserId": "clx0abc123", "email": "andi.halim@sparta.local", "moduleId": "energy" }
```

Minimal salah satu dari `spartaUserId` atau `email` wajib ada. `spartaUserId` diutamakan; email hanya cadangan untuk modul yang belum menyimpan ID portal.

### GET /v1/master/branches dan /v1/master/areas (API key internal)

Data master cabang dan area untuk sync malam. Parameter opsional `updatedSince` (ISO date) hanya mengembalikan baris yang berubah setelah waktu itu.

```json
{
  "data": [
    { "code": "BDG", "name": "Bandung", "address": null, "areaCode": "JABAR", "isActive": true, "updatedAt": "2026-11-18T00:00:00.000Z" }
  ],
  "meta": { "syncedAt": "2026-11-19T01:00:00.000Z", "count": 1 }
}
```

Simpan `meta.syncedAt` dan pakai sebagai `updatedSince` di sync berikutnya. Waktu ini diambil sebelum query, jadi perubahan yang terjadi saat query berjalan tidak terlewat.

## Catatan Penting

- Launch token **sekali pakai** dan **TTL 2 menit**.
- Modul **tidak boleh** menyimpan launch token setelah exchange.
- Modul **wajib** memvalidasi exchange response sebelum membuat session.
- Authorization di dalam modul (role, permission) tetap dikelola oleh modul masing-masing.
- SPARTA Login Portal hanya menjamin identitas user dan daftar modul yang diakses.