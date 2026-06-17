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
9. SPARTA API mengembalikan user payload:
   {
     "data": {
       "user": {
         "email": "andi.halim@sparta.local",
         "fullName": "Andi Halim",
         "branch": "Jakarta Pusat",
         "access": ["building", "maintenance"]
       }
     }
   }
10. Modul memetakan email ke user lokal (atau membuat user baru jika perlu).
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

**Success Response (200):**

```json
{
  "data": {
    "user": {
      "email": "andi.halim@sparta.local",
      "fullName": "Andi Halim",
      "branch": "Jakarta Pusat",
      "access": ["building", "maintenance"]
    }
  }
}
```

**Error Responses:**

| Status | Code | Kondisi |
| --- | --- | --- |
| 400 | `INVALID_SSO_TOKEN` | Token tidak ditemukan |
| 400 | `SSO_TOKEN_CONSUMED` | Token sudah dipakai |
| 400 | `SSO_TOKEN_EXPIRED` | Token sudah kedaluwarsa |
| 403 | `SSO_MODULE_MISMATCH` | Token tidak sesuai moduleId |

## Catatan Penting

- Launch token **sekali pakai** dan **TTL 2 menit**.
- Modul **tidak boleh** menyimpan launch token setelah exchange.
- Modul **wajib** memvalidasi exchange response sebelum membuat session.
- Authorization di dalam modul (role, permission) tetap dikelola oleh modul masing-masing.
- SPARTA Login Portal hanya menjamin identitas user dan daftar modul yang diakses.