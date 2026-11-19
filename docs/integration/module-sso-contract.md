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

## Provisioning (Fase 2B, portal ke modul)

Saat admin portal memberi/mencabut akses, mengganti identitas, atau menonaktifkan user, portal mengirim event ke endpoint provisioning modul. Modul tidak perlu menunggu user login dulu untuk tahu perubahan itu.

### Yang disiapkan modul

1. Endpoint `POST` (mis. `/api/sparta/provisioning`). Admin portal mengisi URL-nya ke `AppModule.provisioningUrl`. Selama kosong, event untuk modul itu dicatat `SKIPPED` dan tidak dikirim.
2. Secret HMAC minimal 32 karakter, sama di kedua sisi. Di portal: `SPARTA_PROVISIONING_SECRET_<MODUL>` (BUILDING, MAINTENANCE, ENERGY, SIAGA, CARBONTRACK).
3. Role yang dipakai modul terdaftar di katalog `ModuleRole`. Admin hanya bisa memberi role dari katalog itu (katalog kosong = semua role diterima).

### Request

Header:

| Header | Isi |
|---|---|
| `x-sparta-event-id` | ID event, sama dengan `eventId` di body |
| `x-sparta-timestamp` | Unix detik saat dikirim |
| `x-sparta-signature` | `sha256=` + hex HMAC-SHA256(secret, `` `${timestamp}.${rawBody}` ``) |

Body (`SpartaProvisioningEvent` di `@sparta/shared`):

```json
{
  "eventId": "6f1c2b0e-...",
  "type": "access.granted",
  "occurredAt": "2026-11-19T10:00:00.000Z",
  "moduleId": "energy",
  "user": {
    "spartaUserId": "cm3abc...",
    "employeeId": "EMP100",
    "email": "rina@sparta.local",
    "fullName": "Rina Lestari",
    "branch": "Bandung",
    "branchCode": "BDG",
    "status": "ACTIVE"
  },
  "access": { "isActive": true, "role": "AUDITOR" }
}
```

| `type` | Yang dilakukan modul |
|---|---|
| `access.granted` | Buat akun lokal atau aktifkan lagi, set role dari `access.role` |
| `access.revoked` | Nonaktifkan akun lokal (jangan hapus, data riwayat tetap) |
| `user.updated` | Perbarui email, nama, NIK, cabang. `access` berisi akses saat ini |
| `user.deactivated` | Nonaktifkan akun dan putus semua sesi aktif |

### Aturan untuk modul

- **Verifikasi tanda tangan** dari raw body (sebelum di-parse ulang) dengan perbandingan waktu-konstan. Tolak bila `x-sparta-timestamp` selisih lebih dari 5 menit.
- **Idempotent**: event yang sama bisa datang lebih dari sekali. Simpan `eventId` yang sudah diproses, atau pastikan efeknya aman diulang.
- **Cari user** dengan urutan yang sama seperti SSO: `spartaUserId`, lalu `employeeId`, lalu `email`. Simpan `spartaUserId` saat pertama ketemu.
- **Abaikan event lama**: bila `occurredAt` lebih tua dari perubahan terakhir yang sudah diterapkan untuk user itu, balas 2xx tanpa mengubah apa pun.
- **Balasan**: 2xx = diterima. 5xx, 408, 429, atau timeout (10 dtk) = portal mencoba ulang bertahap (30 dtk, 1 mnt, 2 mnt, ... maks 1 jam, 8 percobaan). 4xx lain = event langsung `FAILED` dan admin bisa mengirim ulang setelah masalahnya dibereskan.
- Perubahan yang berasal dari modul sendiri (`/sync`, `/sync-delete`) tidak dikirim balik ke modul itu.
- **User belum ada di modul**: modul yang tidak membuat akun dari SSO (role ditentukan admin modul, mis. CarbonTrack) membalas `200` dengan `{ "result": "ignored", "reason": "unknown_user" }`. Jangan balas 4xx, supaya event tidak menumpuk sebagai `FAILED`.
- **Email bentrok** (`user.updated` membawa email yang sudah dipakai akun lain di modul): balas `409` dengan pesan singkat. Event menjadi `FAILED` dan tampil di admin portal; setelah bentrok dibereskan, admin mengirim ulang.
- **Nonaktif berarti sesi ikut mati**: setelah `access.revoked` atau `user.deactivated`, request berikutnya dari user itu harus ditolak. Modul dengan sesi berbentuk cookie bertanda tangan (tanpa session store) wajib mengecek status akun lokal di setiap request atau saat cookie divalidasi.
- **Modul yang belum menyimpan NIK** melewati langkah `employeeId`: cari dengan `spartaUserId`, lalu `email`.
- Isi body balasan 2xx boleh kosong; portal hanya membaca status HTTP.
- **Role dari portal hanya awal**: `access.role` dipakai saat modul membuat akun atau mengaktifkan lagi akun lewat `access.granted`. `user.updated` tidak boleh menimpa role lokal. Kalau admin modul mengubah role, modul melapor ke portal lewat `/sync`, jadi admin portal dan admin modul tidak saling menimpa.
- **Buat akun atau tidak** saat `access.granted` untuk user yang belum ada adalah pilihan modul: buat dengan `access.role` dan `user.branch`, atau balas `ignored` seperti di atas.
- **Idempotensi cukup satu kolom**: simpan `occurredAt` terakhir yang diterapkan per user (mis. `last_provisioned_at`). Event dengan `occurredAt` lebih tua atau sama diabaikan dengan balasan 2xx; karena efek tiap event aman diulang, tabel `eventId` terpisah tidak wajib.

Contoh verifikasi (Node):

```ts
import { createHmac, timingSafeEqual } from "node:crypto"

function isValidSpartaEvent(rawBody: string, headers: Record<string, string>, secret: string) {
  const timestamp = Number(headers["x-sparta-timestamp"])
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 300) return false
  const expected = Buffer.from(
    "sha256=" + createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex")
  )
  const actual = Buffer.from(headers["x-sparta-signature"] ?? "")
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
```

### Endpoint admin portal terkait

- `GET /v1/admin/users/module-roles`: katalog role per modul.
- `GET /v1/admin/users/:userId/provisioning-events`: 50 event terakhir user (status, percobaan, error terakhir).
- `POST /v1/admin/users/provisioning-events/:eventId/retry`: kirim ulang event `FAILED`.

Worker pengirim berjalan di proses API bila `SPARTA_PROVISIONING_WORKER_ENABLED=true`. Saat mati, event tetap tercatat `PENDING` dan dikirim setelah worker dinyalakan.

## Catatan Penting

- Launch token **sekali pakai** dan **TTL 2 menit**.
- Modul **tidak boleh** menyimpan launch token setelah exchange.
- Modul **wajib** memvalidasi exchange response sebelum membuat session.
- Authorization di dalam modul (role, permission) tetap dikelola oleh modul masing-masing.
- SPARTA Login Portal hanya menjamin identitas user dan daftar modul yang diakses.