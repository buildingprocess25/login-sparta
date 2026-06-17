# SPARTA Backend Monorepo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengubah `login-sparta` menjadi monorepo production-ready berisi frontend Vite SPARTA dan backend Express.js untuk autentikasi, session, OTP password, akses modul, audit, dan integrasi SSO ke SPARTA Building, Maintenance, serta Energy.

**Architecture:** Frontend tetap menjadi aplikasi React/Vite yang dideploy ke Vercel Free, sedangkan backend Express.js dideploy ke Render Standard dan menjadi sumber kebenaran untuk autentikasi, user, akses modul, OTP, dan audit. Frontend berkomunikasi ke backend melalui API HTTPS dengan cookie session `HttpOnly`, `Secure`, dan CORS allowlist.

**Tech Stack:** pnpm workspace, React 19 + Vite 8 + TypeScript 6, Express.js, PostgreSQL, Prisma ORM, Zod, `@node-rs/argon2`, `pino`, `helmet`, `cors`, `cookie-parser`, `express-rate-limit`, Vitest, Supertest.

---

## Current Project Context

- Project saat ini masih frontend-only.
- Entry frontend berada di `src/main.tsx` dan `src/App.tsx`.
- Auth mock berada di `src/lib/sparta-auth.ts`.
- Session frontend saat ini berada di `src/lib/sparta-session.ts` dengan `localStorage` dan expiry client-side.
- Route masih hash-based melalui `src/routes.ts`.
- Halaman utama yang harus tetap tersambung ke backend:
  - Login: `src/pages/login-page.tsx`
  - Lupa password: `src/pages/forgot-password-page.tsx`
  - Reset password pertama: `src/pages/password-reset-page.tsx`
  - Pilih modul: `src/pages/module-launcher-page.tsx`
  - Tanya ARTA placeholder: `src/pages/tanya-arta-page.tsx` tetap frontend-only untuk MVP.
  - Shell login: `src/components/public-auth-shell.tsx`
  - Shell authenticated: `src/components/app-shell.tsx`
- Frontend sudah menggunakan sonner, shadcn/ui, input OTP, dan layout responsive.
- `pnpm-workspace.yaml` sudah ada, tetapi `packages: []`; ini menjadi titik masuk migrasi monorepo.

## Product Definition

SPARTA Login Portal adalah pintu masuk internal perusahaan untuk mengakses:

- SPARTA Building
- SPARTA Maintenance
- SPARTA Energy

Portal ini bukan aplikasi publik. Semua fitur harus mengutamakan keamanan internal, auditability, pengalaman login yang cepat, dan kesiapan integrasi dengan domain aplikasi lain.

## Main Product Features

### P0 - Authentication Core

- Login menggunakan email dan password.
- Untuk user baru atau user migrasi, password awal adalah nama cabang dalam huruf kapital.
- Jika user masih memakai password cabang, backend mengembalikan `mustChangePassword: true`.
- User wajib membuat password baru sebelum membuka modul.
- Password baru disimpan hanya sebagai hash Argon2id.
- Session disimpan server-side di PostgreSQL dan direferensikan melalui cookie `HttpOnly`.
- Logout mencabut session di database.

### P0 - Password Recovery & Change

- Forgot password untuk user yang belum login:
  - input email
  - backend membuat OTP
  - OTP dikirim ke email
  - user verifikasi OTP
  - user memasukkan password baru
- Change password untuk user yang sudah login:
  - user membuka menu profile
  - backend mengirim OTP ke email session aktif
  - user memasukkan OTP dan password baru
  - tidak perlu password lama
- OTP tidak disimpan plain text; backend menyimpan hash OTP.
- OTP memiliki expiry, batas percobaan, dan audit event.

### P0 - Module Access & Launch

- Backend mengembalikan daftar modul sesuai akses user.
- Urutan modul selalu:
  1. SPARTA Building
  2. SPARTA Maintenance
  3. SPARTA Energy
- Modul tanpa akses tidak boleh diluncurkan meskipun user memanggil endpoint langsung.
- Setiap launch modul dicatat di audit.
- Callback URL modul disimpan di database supaya tidak hardcode di frontend.

### P1 - User & Access Administration

- Admin dapat mengelola user internal.
- Admin dapat mengaktifkan/nonaktifkan user.
- Admin dapat memberikan atau mencabut akses modul.
- Admin dapat memaksa reset password user.
- Perubahan akses wajib tercatat di audit.

### P1 - Security & Operations

- Rate limit untuk login, OTP request, OTP verify, dan module launch.
- Account lock sementara setelah beberapa percobaan login gagal.
- Audit trail untuk login, logout, password change, OTP request, OTP verify, dan module launch.
- Health endpoint untuk Render.
- Structured logging dengan request id.
- CORS allowlist untuk domain Vercel dan domain produksi.

## User Stories

### Employee

- Sebagai user internal, saya bisa login menggunakan email dan password SPARTA agar dapat membuka portal internal.
- Sebagai user baru, saya bisa login dengan nama cabang kapital dan langsung diminta mengganti password agar akun saya tidak memakai password awal terus-menerus.
- Sebagai user, saya bisa melihat modul yang saya punya aksesnya agar tidak bingung memilih aplikasi.
- Sebagai user, saya bisa membuka SPARTA Building, Maintenance, atau Energy dari satu portal.
- Sebagai user, saya bisa reset password melalui OTP email ketika lupa password.
- Sebagai user yang sudah login, saya bisa mengganti password melalui OTP tanpa memasukkan password lama.

### Admin Internal

- Sebagai admin, saya bisa menambahkan user dengan cabang dan akses modul agar onboarding user tidak perlu edit kode.
- Sebagai admin, saya bisa mencabut akses modul user agar akses aplikasi sesuai kebutuhan kerja.
- Sebagai admin, saya bisa menonaktifkan user agar user tersebut tidak bisa login.
- Sebagai admin, saya bisa melihat audit login dan launch modul untuk investigasi keamanan.

### Operator / DevOps

- Sebagai operator, saya bisa menjalankan migrasi Prisma dengan aman di Render sebelum backend start.
- Sebagai operator, saya bisa mengatur env frontend dan backend secara terpisah.
- Sebagai operator, saya bisa memeriksa `/healthz` untuk memastikan backend hidup.

## Non-Goals For Initial Backend

- Tidak membangun ulang UI halaman SPARTA yang sudah ada.
- Tidak menggabungkan backend modul Building, Maintenance, dan Energy ke repo ini.
- Tidak membuat backend, API, database schema, chatbot, atau ticketing Tanya ARTA pada MVP.
- Tanya ARTA tetap berupa halaman placeholder frontend sampai fase backend bantuan disetujui terpisah.
- Tidak memakai localStorage untuk token auth backend.
- Tidak memakai NextAuth, Better Auth, Passport, atau framework auth besar lain untuk portal ini.

## Monorepo Structure

Target struktur:

```text
login-sparta/
  apps/
    web/
      index.html
      src/
      public/
      vite.config.ts
      tsconfig.app.json
      tsconfig.node.json
      package.json
    api/
      prisma/
        schema.prisma
        migrations/
        seed.ts
      src/
        app.ts
        server.ts
        config/
          env.ts
          cors.ts
        db/
          prisma.ts
        modules/
          auth/
            auth.routes.ts
            auth.service.ts
            auth.repository.ts
            auth.schemas.ts
            auth.test.ts
          password/
            password.routes.ts
            password.service.ts
            password.schemas.ts
            password.test.ts
          modules/
            modules.routes.ts
            modules.service.ts
            modules.test.ts
          users/
            users.routes.ts
            users.service.ts
            users.schemas.ts
        middleware/
          require-session.ts
          error-handler.ts
          rate-limit.ts
          request-context.ts
        services/
          email/
            email.service.ts
            smtp-email.provider.ts
            console-email.provider.ts
          security/
            password-hash.ts
            otp.ts
            session-token.ts
        tests/
          helpers/
            test-app.ts
            test-db.ts
      package.json
      tsconfig.json
    shared/
      src/
        api.ts
        sparta.ts
        validation.ts
      package.json
      tsconfig.json
  docs/
    superpowers/
      plans/
        2026-06-17-sparta-backend-monorepo-spec.md
  package.json
  pnpm-workspace.yaml
  eslint.config.js
  README.md
```

Responsibility boundaries:

- `apps/web`: hanya UI, route frontend, API client, dan state presentasi.
- `apps/api`: semua business logic, database, session, OTP, email, audit, dan API.
- `apps/shared`: enum, tipe response, dan helper kontrak API yang dipakai web dan api.
- `apps/api/src/modules/*`: folder per domain agar file kecil dan mudah dites.
- `apps/api/src/services/*`: adapter teknis reusable seperti email, hashing, token, dan OTP.

## Lightweight Third-Party Libraries

### Backend Runtime Dependencies

- `express`: HTTP server minimal dan familiar untuk Render.
- `@prisma/client`: typed database client.
- `zod`: validasi body/query/env dengan dependency kecil.
- `cors`: CORS allowlist untuk Vercel dan local dev.
- `helmet`: security headers dasar.
- `cookie-parser`: baca cookie session.
- `express-rate-limit`: throttle endpoint sensitif.
- `pino` dan `pino-http`: structured logging cepat.
- `@node-rs/argon2`: Argon2id password hashing dengan performa native cepat.
- `nodemailer`: SMTP provider-agnostic untuk OTP email internal.

### Backend Dev Dependencies

- `prisma`: migration dan schema tooling.
- `tsx`: menjalankan TypeScript di dev dan seed tanpa bundler berat.
- `vitest`: test runner konsisten dengan frontend.
- `supertest`: HTTP endpoint tests.
- `typescript`: compile-time safety.

### Libraries Avoided

- Tidak memakai Passport karena flow auth sederhana dan session custom lebih ringan.
- Tidak memakai JWT library untuk session utama karena session server-side lebih mudah dicabut.
- Tidak memakai ORM tambahan selain Prisma.
- Tidak memakai queue library pada P0; email OTP dikirim langsung dengan timeout dan logging.

## Deployment Architecture

### Frontend - Vercel Free

- App: `apps/web`
- Build command: `pnpm --filter @sparta/web build`
- Output directory: `apps/web/dist`
- Required env:
  - `VITE_API_BASE_URL=https://<render-api-domain>`
  - `VITE_APP_ENV=production`

### Backend - Render Standard

- App: `apps/api`
- Build command: `pnpm install --frozen-lockfile && pnpm --filter @sparta/api prisma:generate && pnpm --filter @sparta/api build`
- Start command: `pnpm --filter @sparta/api start`
- Pre-deploy command: `pnpm --filter @sparta/api prisma:migrate:deploy`
- Required env:
  - `NODE_ENV=production`
  - `PORT=10000`
  - `DATABASE_URL=postgresql://...`
  - `SESSION_SECRET=<minimum-32-byte-secret>`
  - `OTP_PEPPER=<minimum-32-byte-secret>`
  - `CORS_ORIGINS=https://<vercel-domain>,https://<custom-frontend-domain>`
  - `COOKIE_DOMAIN=<empty for onrender/vercel split, .sparta-domain for shared custom domain>`
  - `SMTP_HOST=...`
  - `SMTP_PORT=587`
  - `SMTP_USER=...`
  - `SMTP_PASS=...`
  - `SMTP_FROM="SPARTA <no-reply@...>"`
  - `SPARTA_BUILDING_CALLBACK_URL=https://.../auth/sso/callback`
  - `SPARTA_MAINTENANCE_CALLBACK_URL=https://.../auth/sso/callback`
  - `SPARTA_ENERGY_CALLBACK_URL=https://.../auth/sso/callback`

### Cookie Strategy

- If frontend and API use different public sites like `vercel.app` and `onrender.com`, session cookie must use:
  - `HttpOnly`
  - `Secure`
  - `SameSite=None`
- If production uses shared custom domain like `login.company.co.id` and `api.company.co.id`, cookie can use:
  - `HttpOnly`
  - `Secure`
  - `SameSite=Lax`
  - `Domain=.company.co.id`

## Database Design

### Design Principles

- Email is normalized to lowercase before write and lookup.
- Password cabang is never stored. It is derived from branch name only while `passwordState = BRANCH_DEFAULT`.
- User-set passwords are always Argon2id hashes.
- OTP is never stored plain text. Store HMAC hash using `OTP_PEPPER`.
- Sessions are server-side rows and can be revoked instantly.
- Module SSO callback URLs are database-configured.
- Every sensitive action creates an audit event.

### Prisma Schema Draft

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum SpartaModuleId {
  BUILDING
  MAINTENANCE
  ENERGY
}

enum UserStatus {
  ACTIVE
  INACTIVE
  LOCKED
}

enum PasswordState {
  BRANCH_DEFAULT
  USER_SET
  RESET_REQUIRED
}

enum OtpPurpose {
  FORGOT_PASSWORD
  CHANGE_PASSWORD
}

enum OtpStatus {
  ACTIVE
  CONSUMED
  EXPIRED
  BLOCKED
}

model Branch {
  id        String   @id @default(cuid())
  code      String   @unique
  name      String
  users     User[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model User {
  id               String          @id @default(cuid())
  email            String          @unique
  employeeId       String?         @unique
  fullName         String
  branchId         String
  branch           Branch          @relation(fields: [branchId], references: [id])
  passwordHash     String?
  passwordState    PasswordState   @default(BRANCH_DEFAULT)
  status           UserStatus      @default(ACTIVE)
  failedLoginCount Int             @default(0)
  lockedUntil      DateTime?
  lastLoginAt      DateTime?
  accesses         UserModuleAccess[]
  sessions         Session[]
  otpChallenges    OtpChallenge[]
  moduleLaunches   ModuleLaunch[]
  auditEvents      AuditEvent[]
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  @@index([branchId])
  @@index([status])
}

model AppModule {
  id          SpartaModuleId @id
  name        String
  shortName   String
  description String
  callbackUrl String
  colorHex    String
  isActive    Boolean        @default(true)
  sortOrder   Int
  accesses    UserModuleAccess[]
  launches    ModuleLaunch[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([isActive, sortOrder])
}

model UserModuleAccess {
  id              String         @id @default(cuid())
  userId          String
  moduleId        SpartaModuleId
  role            String         @default("USER")
  isActive        Boolean        @default(true)
  grantedByUserId String?
  grantedAt       DateTime       @default(now())
  revokedAt       DateTime?
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  module          AppModule      @relation(fields: [moduleId], references: [id])

  @@unique([userId, moduleId])
  @@index([moduleId, isActive])
  @@index([userId, isActive])
}

model Session {
  id        String    @id @default(cuid())
  userId    String
  tokenHash String    @unique
  userAgent String?
  ipAddress String?
  expiresAt DateTime
  revokedAt DateTime?
  lastSeenAt DateTime @default(now())
  createdAt DateTime  @default(now())
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, revokedAt, expiresAt])
}

model OtpChallenge {
  id          String     @id @default(cuid())
  userId      String?
  email       String
  codeHash    String
  purpose     OtpPurpose
  status      OtpStatus  @default(ACTIVE)
  attempts    Int        @default(0)
  maxAttempts Int        @default(5)
  resendCount Int        @default(0)
  expiresAt   DateTime
  consumedAt  DateTime?
  createdAt   DateTime   @default(now())
  user        User?      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([email, purpose, status])
  @@index([userId, purpose, status])
  @@index([expiresAt])
}

model ModuleLaunch {
  id              String         @id @default(cuid())
  userId          String
  moduleId        SpartaModuleId
  launchTokenHash String?        @unique
  redirectUrl     String
  ipAddress       String?
  userAgent       String?
  expiresAt       DateTime?
  consumedAt      DateTime?
  createdAt       DateTime       @default(now())
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  module          AppModule      @relation(fields: [moduleId], references: [id])

  @@index([userId, createdAt])
  @@index([moduleId, createdAt])
}

model AuditEvent {
  id          String   @id @default(cuid())
  actorUserId String?
  action      String
  entityType  String
  entityId    String?
  metadata    Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
  actor       User?    @relation(fields: [actorUserId], references: [id], onDelete: SetNull)

  @@index([actorUserId, createdAt])
  @@index([action, createdAt])
  @@index([entityType, entityId])
}
```

## API Contract

All API routes are prefixed with `/v1`.

### Auth

```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "andi.halim@sparta.local",
  "password": "JAKARTA PUSAT"
}
```

Success:

```json
{
  "session": {
    "email": "andi.halim@sparta.local",
    "fullName": "Andi Halim",
    "branch": "Jakarta Pusat",
    "access": ["building", "maintenance"],
    "mustChangePassword": true
  }
}
```

Other auth routes:

- `GET /v1/auth/me`
- `POST /v1/auth/logout`
- `POST /v1/auth/first-password`

### Forgot Password

- `POST /v1/password/forgot/request-otp`
- `POST /v1/password/forgot/verify-otp`
- `POST /v1/password/forgot/reset`

### Logged-In Change Password

- `POST /v1/password/change/request-otp`
- `POST /v1/password/change/confirm`

### Modules

- `GET /v1/modules`
- `POST /v1/modules/:moduleId/launch`

Launch success:

```json
{
  "moduleId": "building",
  "redirectUrl": "https://building.example.com/sso?token=opaque-launch-token",
  "expiresAt": "2026-06-17T10:30:00.000Z"
}
```

### Module App SSO Bridge

- `POST /v1/sso/exchange`

This endpoint is called by SPARTA Building, Maintenance, and Energy backends after they receive the launch token from the redirect URL. The module app sends the one-time launch token and receives a short user payload if the token is valid, unexpired, unconsumed, and belongs to the requested module.

Request:

```json
{
  "moduleId": "building",
  "launchToken": "opaque-launch-token"
}
```

Success:

```json
{
  "user": {
    "spartaUserId": "clx-user-id",
    "email": "andi.halim@sparta.local",
    "fullName": "Andi Halim",
    "branch": "Jakarta Pusat",
    "moduleRole": "USER"
  }
}
```

The exchange endpoint must mark the launch token as consumed. Module apps create their own local module session after a successful exchange.

## Three Module Integration Plan

### What Must Be Prepared

The three module applications must not export their full business databases into the SSO database. The SSO database only needs identity and access data:

- active user email
- full name
- employee id, if available
- branch code or branch name
- module access membership
- module role, if each module has roles
- current user status: active, inactive, locked, or removed

Each module keeps its own business database. The SSO portal becomes the identity and access source, not the owner of module-specific business records.

### Data Preparation Per Module

Prepare one export file per module:

```csv
email,fullName,employeeId,branchCode,branchName,moduleId,moduleRole,isActive
andi.halim@sparta.local,Andi Halim,EMP001,JKT-PST,Jakarta Pusat,building,USER,true
andi.halim@sparta.local,Andi Halim,EMP001,JKT-PST,Jakarta Pusat,maintenance,USER,true
dina.putri@sparta.local,Dina Putri,EMP002,SBY,Surabaya,energy,USER,true
```

Rules:

- Email must be lowercase and unique per person.
- Branch names must be normalized before seed because password awal depends on branch name uppercase.
- If one person appears in multiple modules, merge into one SSO user with multiple `UserModuleAccess` rows.
- If email is missing in a module, resolve it before migration. Do not create SSO users with placeholder emails.
- If a module uses branch ids that differ from other modules, create a branch mapping table during migration preparation outside the production schema, then seed canonical `Branch` records.

### Database Strategy For Existing Modules

Do not merge module databases into the SSO database.

For SPARTA Building, Maintenance, and Energy:

- Keep existing business tables in each module database.
- Keep existing module user/profile table if business records reference it.
- Add a nullable `spartaUserId` column to the module user/profile table.
- Add a unique index on `spartaUserId` when every active module user is mapped.
- Keep `email` indexed and normalized for fallback mapping.
- Remove or ignore password columns only after SSO login has been verified in production.
- Do not delete historical user rows because reports, approvals, and audit records may still reference local module user ids.

Recommended module-side migration shape:

```sql
ALTER TABLE users ADD COLUMN sparta_user_id TEXT;
CREATE INDEX users_sparta_user_id_idx ON users (sparta_user_id);
CREATE INDEX users_email_lower_idx ON users (LOWER(email));
```

After all active users are mapped:

```sql
CREATE UNIQUE INDEX users_sparta_user_id_unique_idx
ON users (sparta_user_id)
WHERE sparta_user_id IS NOT NULL;
```

### Auth Changes Required In Each Module

Existing module auth should be replaced gradually, not deleted in one commit.

Target flow:

1. User logs in at SPARTA Login Portal.
2. User chooses Building, Maintenance, or Energy.
3. Portal calls `POST /v1/modules/:moduleId/launch`.
4. Portal redirects to module callback URL with one-time token.
5. Module backend calls `POST /v1/sso/exchange`.
6. Module backend maps `spartaUserId` or email to its local user record.
7. Module backend creates its own module session.
8. Module redirects user into its dashboard.

Module-side routes to add:

```text
GET /auth/sso/callback?token=<launch-token>
POST /auth/logout
GET /auth/me
```

Module-side routes to disable after SSO is stable:

```text
GET /login
POST /login
POST /forgot-password
POST /reset-password
POST /change-password
```

Keep module authorization and role checks inside each module. SSO handles identity and module access; the module still owns module-specific permissions such as approval role, report visibility, or admin screens.

### SPARTA Building Checklist

- Export active Building users and branch mapping.
- Identify Building roles that must become `UserModuleAccess.role`.
- Add `spartaUserId` mapping to Building user table.
- Add `/auth/sso/callback` in Building.
- Replace Building login page with redirect to SPARTA Login Portal.
- Keep Building business authorization checks unchanged after session creation.
- Verify old Building records still resolve their local user references.

### SPARTA Maintenance Checklist

- Export active Maintenance users, branch mapping, and role names.
- Map existing Maintenance roles such as admin, BMS, BMC, BNM, or manager roles into module-side roles.
- Add `spartaUserId` mapping to Maintenance user table.
- Add `/auth/sso/callback` in Maintenance.
- Replace Maintenance login page with redirect to SPARTA Login Portal.
- Keep Maintenance dashboard/report/PJUM authorization in Maintenance, not in SSO.
- Verify report audit trails and historical user references still render.

### SPARTA Energy Checklist

- Export active Energy users and branch mapping.
- Map Energy-specific roles into module-side roles.
- Add `spartaUserId` mapping to Energy user table.
- Add `/auth/sso/callback` in Energy.
- Replace Energy login page with redirect to SPARTA Login Portal.
- Keep Energy business authorization inside Energy.
- Verify existing Prisma migration history before adding `spartaUserId`, because this repo previously had migration-history sensitivity.

### Module Integration Acceptance Criteria

- A user with Building access can open Building from the portal and lands authenticated in Building.
- The same user cannot open Energy if SSO does not grant Energy access.
- A consumed launch token cannot be reused.
- An expired launch token cannot be exchanged.
- A module cannot exchange a token issued for another module.
- Existing module business pages still respect their local authorization rules.
- Module local login routes are inaccessible to normal users after SSO rollout.
- Emergency admin fallback is documented and restricted, if the business requires one.

## Implementation Tasks

### Task 1: Monorepo Workspace Scaffold

**Files:**
- Modify: `pnpm-workspace.yaml`
- Modify: `package.json`
- Create: `apps/web/package.json`
- Move: current frontend files into `apps/web/`
- Create: `apps/api/package.json`
- Create: `apps/shared/package.json`

- [ ] **Step 1: Update workspace packages**

```yaml
packages:
  - "apps/*"
```

- [ ] **Step 2: Convert root package scripts into workspace orchestration**

```json
{
  "name": "login-sparta",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev:web": "pnpm --filter @sparta/web dev",
    "dev:api": "pnpm --filter @sparta/api dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck",
    "format": "prettier --write \"**/*.{ts,tsx,md,json,yaml}\""
  }
}
```

- [ ] **Step 3: Verify workspace resolution**

Run:

```bash
pnpm install
pnpm -r typecheck
```

Expected:

```text
No TypeScript project reference errors.
```

- [ ] **Step 4: Commit**

```bash
git add pnpm-workspace.yaml package.json apps
git commit -m "chore: scaffold sparta monorepo workspace"
```

### Task 2: Shared API Contracts

**Files:**
- Create: `apps/shared/src/sparta.ts`
- Create: `apps/shared/src/api.ts`
- Create: `apps/shared/src/validation.ts`
- Modify: `apps/web/tsconfig.app.json`
- Modify: `apps/api/tsconfig.json`

- [ ] **Step 1: Define shared module ids and session payload**

```ts
export const SPARTA_MODULE_IDS = ["building", "maintenance", "energy"] as const

export type SpartaModuleId = (typeof SPARTA_MODULE_IDS)[number]

export type SpartaSessionDto = {
  email: string
  fullName: string
  branch: string
  access: SpartaModuleId[]
  mustChangePassword: boolean
}
```

- [ ] **Step 2: Define shared response envelope**

```ts
export type ApiSuccess<T> = {
  data: T
}

export type ApiError = {
  error: {
    code: string
    message: string
  }
}
```

- [ ] **Step 3: Verify imports from web and api**

Run:

```bash
pnpm -r typecheck
```

Expected:

```text
@sparta/shared can be imported by @sparta/web and @sparta/api.
```

- [ ] **Step 4: Commit**

```bash
git add apps/shared apps/web/tsconfig.app.json apps/api/tsconfig.json
git commit -m "feat: add shared sparta api contracts"
```

### Task 3: API Foundation

**Files:**
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/server.ts`
- Create: `apps/api/src/config/env.ts`
- Create: `apps/api/src/config/cors.ts`
- Create: `apps/api/src/middleware/error-handler.ts`
- Create: `apps/api/src/middleware/request-context.ts`
- Create: `apps/api/src/db/prisma.ts`
- Create: `apps/api/prisma/schema.prisma`

- [ ] **Step 1: Add Express app with health endpoint**

```ts
import express from "express"
import helmet from "helmet"
import cors from "cors"
import cookieParser from "cookie-parser"
import pinoHttp from "pino-http"

export function createApp() {
  const app = express()

  app.use(pinoHttp())
  app.use(helmet())
  app.use(cors({ origin: true, credentials: true }))
  app.use(cookieParser())
  app.use(express.json({ limit: "100kb" }))

  app.get("/healthz", (_request, response) => {
    response.json({ status: "ok" })
  })

  return app
}
```

- [ ] **Step 2: Add env validation**

Use Zod to validate `DATABASE_URL`, `SESSION_SECRET`, `OTP_PEPPER`, `CORS_ORIGINS`, and SMTP env. Fail fast during boot when env is invalid.

- [ ] **Step 3: Add initial Prisma schema**

Use the schema draft in this document as the first migration shape.

- [ ] **Step 4: Verify API health test**

Run:

```bash
pnpm --filter @sparta/api test
```

Expected:

```text
GET /healthz returns 200 and { status: "ok" }.
```

- [ ] **Step 5: Commit**

```bash
git add apps/api
git commit -m "feat: add express api foundation"
```

### Task 4: Database Schema, Migration, and Seed

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/seed.ts`
- Modify: `apps/api/package.json`

- [ ] **Step 1: Create Prisma migration**

Run:

```bash
pnpm --filter @sparta/api prisma migrate dev --name init_sparta_auth
```

Expected:

```text
Migration created and applied to local PostgreSQL.
```

- [ ] **Step 2: Seed modules**

Seed `BUILDING`, `MAINTENANCE`, and `ENERGY` with database callback URLs from env.

- [ ] **Step 3: Seed development users**

Seed users equivalent to the current mock data:

```text
andi.halim@sparta.local -> Jakarta Pusat -> Building, Maintenance
dina.putri@sparta.local -> Surabaya -> Energy
raka.wijaya@sparta.local -> Bandung -> Building, Maintenance, Energy
```

- [ ] **Step 4: Verify seed**

Run:

```bash
pnpm --filter @sparta/api prisma db seed
```

Expected:

```text
3 modules, 3 users, and module access rows are present.
```

- [ ] **Step 5: Commit**

```bash
git add apps/api/prisma apps/api/package.json
git commit -m "feat: add sparta database schema and seed data"
```

### Task 5: Auth Sessions

**Files:**
- Create: `apps/api/src/modules/auth/auth.routes.ts`
- Create: `apps/api/src/modules/auth/auth.service.ts`
- Create: `apps/api/src/modules/auth/auth.repository.ts`
- Create: `apps/api/src/modules/auth/auth.schemas.ts`
- Create: `apps/api/src/middleware/require-session.ts`
- Create: `apps/api/src/services/security/password-hash.ts`
- Create: `apps/api/src/services/security/session-token.ts`
- Create: `apps/api/src/modules/auth/auth.test.ts`

- [ ] **Step 1: Write auth tests**

Cover these cases:

```text
login with branch uppercase succeeds for BRANCH_DEFAULT user
login with lowercase branch fails
login sets HttpOnly session cookie
GET /v1/auth/me returns current session
POST /v1/auth/logout revokes current session
inactive user cannot login
locked user cannot login
```

- [ ] **Step 2: Implement password verification**

Rules:

```text
if passwordState is BRANCH_DEFAULT, compare password exactly with branch.name.toUpperCase()
if passwordState is USER_SET, verify Argon2id hash
if passwordState is RESET_REQUIRED, allow login only with current stored hash and return mustChangePassword true
```

- [ ] **Step 3: Implement server-side sessions**

Session token format:

```text
raw token = crypto.randomBytes(32).toString("base64url")
stored tokenHash = sha256(raw token + SESSION_SECRET)
cookie value = raw token
```

- [ ] **Step 4: Run auth tests**

Run:

```bash
pnpm --filter @sparta/api test -- auth
```

Expected:

```text
Auth tests pass.
```

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/auth apps/api/src/services/security apps/api/src/middleware/require-session.ts
git commit -m "feat: add server side sparta authentication"
```

### Task 6: First Password and OTP Password Flows

**Files:**
- Create: `apps/api/src/modules/password/password.routes.ts`
- Create: `apps/api/src/modules/password/password.service.ts`
- Create: `apps/api/src/modules/password/password.schemas.ts`
- Create: `apps/api/src/modules/password/password.test.ts`
- Create: `apps/api/src/services/security/otp.ts`
- Create: `apps/api/src/services/email/email.service.ts`
- Create: `apps/api/src/services/email/smtp-email.provider.ts`
- Create: `apps/api/src/services/email/console-email.provider.ts`

- [ ] **Step 1: Write password flow tests**

Cover these cases:

```text
first password change requires authenticated session
first password cannot equal branch uppercase password
forgot password request creates hashed OTP without exposing plain OTP in production response
forgot password verify accepts valid OTP
forgot password reset consumes OTP
change password request requires authenticated session
change password confirm updates password after valid OTP
OTP is blocked after max attempts
expired OTP cannot be used
```

- [ ] **Step 2: Implement OTP hashing**

Use HMAC SHA-256:

```text
codeHash = HMAC_SHA256(OTP_PEPPER, `${email}:${purpose}:${otp}`)
```

- [ ] **Step 3: Implement email provider abstraction**

Use `console-email.provider.ts` in local development and `smtp-email.provider.ts` in production.

- [ ] **Step 4: Run password tests**

Run:

```bash
pnpm --filter @sparta/api test -- password
```

Expected:

```text
Password and OTP tests pass.
```

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/password apps/api/src/services/email apps/api/src/services/security/otp.ts
git commit -m "feat: add otp password management"
```

### Task 7: Module Access, Launch, and SSO Exchange

**Files:**
- Create: `apps/api/src/modules/modules/modules.routes.ts`
- Create: `apps/api/src/modules/modules/modules.service.ts`
- Create: `apps/api/src/modules/modules/modules.test.ts`
- Create: `apps/api/src/modules/sso/sso.routes.ts`
- Create: `apps/api/src/modules/sso/sso.service.ts`
- Create: `apps/api/src/modules/sso/sso.schemas.ts`
- Create: `apps/api/src/modules/sso/sso.test.ts`
- Modify: `apps/api/src/app.ts`

- [ ] **Step 1: Write module tests**

Cover these cases:

```text
GET /v1/modules returns modules in Building, Maintenance, Energy order
GET /v1/modules marks access per current user
POST /v1/modules/:moduleId/launch rejects module without access
POST /v1/modules/:moduleId/launch creates audit and launch record
inactive module cannot be launched
POST /v1/sso/exchange consumes a valid launch token
POST /v1/sso/exchange rejects reused token
POST /v1/sso/exchange rejects token issued for another module
POST /v1/sso/exchange rejects expired token
```

- [ ] **Step 2: Implement module service**

Return module response:

```json
{
  "modules": [
    {
      "id": "building",
      "name": "SPARTA Building",
      "shortName": "Building",
      "description": "Pengelolaan proyek pembangunan dari rencana hingga serah terima.",
      "colorHex": "#e6000b",
      "hasAccess": true
    }
  ]
}
```

- [ ] **Step 3: Implement launch endpoint**

For MVP, return database-configured callback URL and write `ModuleLaunch` with a one-time launch token hash. The plain launch token is only returned once inside `redirectUrl`.

Redirect URL shape:

```text
https://building.example.com/auth/sso/callback?token=<opaque-launch-token>
```

- [ ] **Step 4: Implement SSO exchange endpoint**

Module apps call `POST /v1/sso/exchange` with `moduleId` and `launchToken`. The API verifies token hash, module id, expiry, and `consumedAt`, then marks the row consumed and returns the user payload.

- [ ] **Step 5: Run module and SSO tests**

Run:

```bash
pnpm --filter @sparta/api test -- modules sso
```

Expected:

```text
Module and SSO exchange tests pass.
```

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/modules apps/api/src/modules/sso apps/api/src/app.ts
git commit -m "feat: add sparta module sso launch api"
```

### Task 8: Frontend API Integration

**Files:**
- Create: `apps/web/src/lib/api-client.ts`
- Modify: `apps/web/src/lib/sparta-auth.ts`
- Modify: `apps/web/src/lib/sparta-session.ts`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/pages/login-page.tsx`
- Modify: `apps/web/src/pages/forgot-password-page.tsx`
- Modify: `apps/web/src/pages/password-reset-page.tsx`
- Modify: `apps/web/src/components/change-password-dialog.tsx`
- Modify: `apps/web/src/pages/module-launcher-page.tsx`

- [ ] **Step 1: Create credentialed API client**

```ts
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error?.message ?? "Request SPARTA gagal.")
  }

  return response.json() as Promise<T>
}
```

- [ ] **Step 2: Replace mock auth with API calls**

Replace direct calls to in-memory functions with:

```text
loginToSparta -> POST /v1/auth/login
requestPasswordResetOtp -> POST /v1/password/forgot/request-otp
verifyPasswordResetOtp -> POST /v1/password/forgot/verify-otp
resetPasswordWithOtp -> POST /v1/password/forgot/reset or /v1/password/change/confirm
getAccessibleApps -> GET /v1/modules
```

- [ ] **Step 3: Replace localStorage session with `/v1/auth/me`**

On app load, call `GET /v1/auth/me`. Keep local React state, but do not persist auth session in localStorage.

- [ ] **Step 4: Run frontend tests**

Run:

```bash
pnpm --filter @sparta/web test
pnpm --filter @sparta/web typecheck
```

Expected:

```text
Frontend tests and typecheck pass.
```

- [ ] **Step 5: Commit**

```bash
git add apps/web
git commit -m "feat: connect sparta frontend to backend api"
```

### Task 9: Admin User and Access Management

**Files:**
- Create: `apps/api/src/modules/users/users.routes.ts`
- Create: `apps/api/src/modules/users/users.service.ts`
- Create: `apps/api/src/modules/users/users.schemas.ts`
- Create: `apps/api/src/modules/users/users.test.ts`
- Modify: `apps/api/prisma/schema.prisma`

- [ ] **Step 1: Add admin marker**

Add user role support with `SYSTEM_ADMIN` and `USER` roles or a dedicated `AdminUserRole` table when multiple admin scopes are required.

- [ ] **Step 2: Write admin tests**

Cover these cases:

```text
non-admin cannot list users
admin can create user with branch and module access
admin can deactivate user
admin can grant module access
admin can revoke module access
admin changes create audit event
```

- [ ] **Step 3: Implement admin endpoints**

Routes:

```text
GET /v1/admin/users
POST /v1/admin/users
PATCH /v1/admin/users/:userId
PUT /v1/admin/users/:userId/access/:moduleId
DELETE /v1/admin/users/:userId/access/:moduleId
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/users apps/api/prisma/schema.prisma
git commit -m "feat: add user access administration api"
```

### Task 10: Three Module SSO Readiness

**Files:**
- Create: `docs/integration/sparta-building-sso-checklist.md`
- Create: `docs/integration/sparta-maintenance-sso-checklist.md`
- Create: `docs/integration/sparta-energy-sso-checklist.md`
- Create: `docs/integration/user-export-template.csv`
- Create: `docs/integration/module-sso-contract.md`

- [ ] **Step 1: Create user export template**

Create `docs/integration/user-export-template.csv`:

```csv
email,fullName,employeeId,branchCode,branchName,moduleId,moduleRole,isActive
andi.halim@sparta.local,Andi Halim,EMP001,JKT-PST,Jakarta Pusat,building,USER,true
andi.halim@sparta.local,Andi Halim,EMP001,JKT-PST,Jakarta Pusat,maintenance,USER,true
dina.putri@sparta.local,Dina Putri,EMP002,SBY,Surabaya,energy,USER,true
```

- [ ] **Step 2: Document module SSO contract**

Create `docs/integration/module-sso-contract.md` with this flow:

```text
1. Module receives GET /auth/sso/callback?token=<launch-token>.
2. Module backend calls POST /v1/sso/exchange with moduleId and launchToken.
3. SSO API returns spartaUserId, email, fullName, branch, and moduleRole.
4. Module maps spartaUserId to local user row.
5. Module creates its own local session.
6. Module redirects to its dashboard.
```

- [ ] **Step 3: Create Building checklist**

Include:

```text
export active Building users
normalize branch data
add spartaUserId to Building user table
add /auth/sso/callback
replace local login with redirect to SPARTA Login Portal
keep Building authorization checks inside Building
verify historical records still resolve local users
```

- [ ] **Step 4: Create Maintenance checklist**

Include:

```text
export active Maintenance users
map Maintenance roles such as admin, BMS, BMC, BNM, and manager roles
normalize branch data
add spartaUserId to Maintenance user table
add /auth/sso/callback
replace local login with redirect to SPARTA Login Portal
keep report, dashboard, and PJUM authorization inside Maintenance
verify historical reports and audit trails still resolve local users
```

- [ ] **Step 5: Create Energy checklist**

Include:

```text
export active Energy users
map Energy module roles
normalize branch data
verify Prisma migration history before adding schema changes
add spartaUserId to Energy user table
add /auth/sso/callback
replace local login with redirect to SPARTA Login Portal
keep Energy authorization inside Energy
```

- [ ] **Step 6: Commit**

```bash
git add docs/integration
git commit -m "docs: add sparta module sso readiness plan"
```

### Task 11: Deployment Configuration

**Files:**
- Create: `apps/api/render.yaml`
- Create: `apps/api/.env.example`
- Create: `apps/web/.env.example`
- Modify: `README.md`

- [ ] **Step 1: Add API env example**

```dotenv
NODE_ENV=development
PORT=10000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sparta_login
SESSION_SECRET=replace-with-32-byte-secret
OTP_PEPPER=replace-with-32-byte-secret
CORS_ORIGINS=http://localhost:5173
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=SPARTA <no-reply@sparta.local>
SPARTA_BUILDING_CALLBACK_URL=https://building.sparta.local/auth/sso/callback
SPARTA_MAINTENANCE_CALLBACK_URL=https://maintenance.sparta.local/auth/sso/callback
SPARTA_ENERGY_CALLBACK_URL=https://energy.sparta.local/auth/sso/callback
```

- [ ] **Step 2: Add web env example**

```dotenv
VITE_API_BASE_URL=http://localhost:10000
VITE_APP_ENV=development
```

- [ ] **Step 3: Document Render and Vercel commands**

Document:

```text
Vercel root directory: apps/web
Vercel build command: pnpm build
Render root directory: apps/api
Render build command: pnpm install --frozen-lockfile && pnpm prisma:generate && pnpm build
Render start command: pnpm start
Render pre-deploy command: pnpm prisma:migrate:deploy
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/render.yaml apps/api/.env.example apps/web/.env.example README.md
git commit -m "docs: add sparta deployment configuration"
```

## Verification Strategy

### Local Development

Run:

```bash
pnpm install
pnpm --filter @sparta/api prisma migrate dev
pnpm --filter @sparta/api prisma db seed
pnpm dev:api
pnpm dev:web
```

Expected:

```text
Frontend can login through backend, set first password, request OTP, and open module launcher.
```

### Automated Verification

Run before every merge:

```bash
pnpm -r typecheck
pnpm -r lint
pnpm -r test
pnpm -r build
```

Expected:

```text
All workspace packages pass typecheck, lint, tests, and build.
```

### Security Verification

Check manually in browser devtools:

```text
session cookie is HttpOnly
session cookie is Secure in production
session token is not present in localStorage
forgot password response does not reveal whether email exists in production mode
OTP is not stored plain text in database
logout revokes session row
module launch rejects unauthorized module ids
```

## Rollout Order

1. Scaffold monorepo without changing behavior.
2. Add API health endpoint and deploy empty backend to Render.
3. Add database schema and seed.
4. Add backend auth endpoints and test with API client.
5. Integrate frontend login with backend.
6. Add password and OTP flows.
7. Integrate module access, launch token, and SSO exchange.
8. Prepare Building, Maintenance, and Energy for SSO callback integration.
9. Harden deployment env, CORS, and cookie domain.
10. Add audit and admin access management after MVP login and module launch are stable.

## Open Product Decisions Before Implementation

These decisions should be answered before Task 4 reaches production data:

- Exact production frontend domain.
- Exact production backend domain.
- Whether PostgreSQL is Render Postgres or another managed PostgreSQL provider.
- SMTP provider and sender domain.
- Callback URLs for SPARTA Building, Maintenance, and Energy.
- Exact module-side user table names and whether they already have stable email fields.
- Whether each module has role names that must be synchronized into `UserModuleAccess.role`.
- Emergency fallback policy after local login is disabled in each module.
- Admin role source: managed inside SPARTA Login Portal or synced from corporate directory.

## Self-Review

- Spec coverage: backend architecture, monorepo structure, feature list, user stories, priorities, database schema, API contract, lightweight libraries, and deployment plan are all represented.
- Placeholder scan: no unfinished marker or empty implementation slots are used.
- Scope check: Tanya ARTA has no backend API, database table, or implementation task in this MVP plan.
- Type consistency: module ids are consistently mapped between Prisma enum values and frontend lowercase DTO values.
- Risk note: production cookie behavior depends on final frontend/backend domains; the plan includes both split-domain and shared-domain cookie strategies.
