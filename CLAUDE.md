# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Frontend Single Sign-On (SSO) untuk SPARTA Building, SPARTA Maintenance, dan SPARTA Energy.
Ketiga aplikasi berada di domain berbeda.
Project ini hanya frontend — meneruskan request ke backend.

## Commands

- Dev server: `pnpm dev`
- Build: `pnpm build`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Format kode: `pnpm format`
- Cari komponen shadcn: `npx shadcn@latest search '@shadcn' -q "<nama-komponen>"` (wajib pakai quote `'@shadcn'` di PowerShell)
- List komponen shadcn: `npx shadcn@latest list '@shadcn'`

## Architecture & Structure

- Framework: React 19 + Vite 8 + TypeScript 6
- Styling: Tailwind CSS v4 + shadcn/ui
- Icons: lucide-react
- Entry: `src/main.tsx` → `src/App.tsx`
- Komponen UI (shadcn): `src/components/ui/`
- Komponen kustom: `src/components/`
- Utility functions: `src/lib/utils.ts`

## Critical Rules (from AI_RULES.md)

- **shadcn/ui First**: SELALU cek dan gunakan komponen dari shadcn/ui sebelum membuat custom markup. Import dari registry jika belum ada.
- **Custom Components**: Jika terpaksa buat custom (karena tidak ada di shadcn), WAJIB reusable (terima props, tidak hardcode value) dan simpan di `src/components/`. Dilarang komponen one-off.
- **No Manual Spacing**: DILARANG menambahkan margin, padding, atau gap secara langsung ke dalam komponen shadcn (`Card`, `Button`, `Input`, `Dialog`, `Sheet`, dll). Jika butuh jarak antar elemen, gunakan layout wrapper pada elemen parent (misal: `<div className="flex gap-4">`).
