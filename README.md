# SPARTA Login Portal

Frontend SSO dan backend autentikasi untuk SPARTA Building, SPARTA Maintenance, dan SPARTA Energy.

## Monorepo Structure

| Package | Path | Description |
| --- | --- | --- |
| `@sparta/web` | `apps/web` | React 19 + Vite 8 frontend |
| `@sparta/api` | `apps/api` | Express.js backend (auth, OTP, modules, SSO) |
| `@sparta/shared` | `apps/shared` | Shared TypeScript types & validation |

## Prerequisites

- Node.js 22+
- pnpm 10+
- PostgreSQL 15+

## Quick Start

```bash
# install dependencies
pnpm install

# copy env files
cp apps/api/.env.example apps/api/.env.development
cp apps/web/.env.example apps/web/.env.development

# setup database
pnpm --filter @sparta/api prisma:generate
pnpm --filter @sparta/api prisma migrate dev
pnpm --filter @sparta/api db:seed

# start both apps
pnpm dev:api   # http://localhost:10000
pnpm dev:web   # http://localhost:5173
```

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev:web` | Start frontend dev server |
| `pnpm dev:api` | Start backend dev server |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format code with Prettier |

## Deployment

**Frontend (Vercel):**
- Root directory: `apps/web`
- Build command: `pnpm build`
- Output directory: `dist`

**Backend (Render):**
- Root directory: `apps/api`
- Build command: `pnpm install --frozen-lockfile && pnpm prisma:generate && pnpm build`
- Start command: `pnpm start`
- Pre-deploy command: `pnpm prisma:migrate:deploy`
