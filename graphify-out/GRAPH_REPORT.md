# Graph Report - login-sparta  (2026-11-19)

## Corpus Check
- 169 files · ~61,588 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 5, .example 2, .toml 1)

## Summary
- 1440 nodes · 3402 edges · 75 communities (61 shown, 14 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 56 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f9500669`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- forgot-password-page.tsx
- SPARTA Backend Monorepo Implementation Plan
- About Page Components
- Initial Auth Migration
- users.test.ts
- users.routes.ts
- Rate Limit & Session Middleware
- Auth Records & Tests
- app.ts
- API Dev Dependencies
- Docker CI Workflow
- Web Dependencies
- sparta-auth.ts
- sparta-master-admin.ts
- @prisma/client
- shadcn Config
- Web TS App Config
- API Runtime Dependencies
- SSO Repository
- API TS Config
- login-page.tsx
- InMemoryAuthRepository
- password.service.ts
- Web TS Node Config
- Root Workspace Package
- Antislop UI Rules
- Shared TS Config
- devDependencies
- users.repository.ts
- PrismaMasterAdminRepository
- PrismaAuthRepository
- createMasterAdminRouter
- Master Data Repository
- SSO Routes & Schema
- master-branch-dialog.tsx
- prisma.config.ts
- Shared Package Manifest
- Render Deploy Config
- Theme Provider
- App Routing & Session
- API Scripts
- AuthError
- password.routes.ts
- Database Seed
- InMemoryMasterAdminRepository
- PrismaUsersRepository
- master-admin.schemas.ts
- storefront-elevation.tsx
- provisioning.repository.ts
- eslint.config.js
- Vite Config
- pnpm Workspace
- Legacy User Merge Script
- Web Scripts
- PrismaPasswordRepository
- Sisa Plan SPARTA (lanjut 2026-11-20)
- Web TS Root Config
- pg
- master-admin.service.ts
- InMemoryUsersRepository
- SPARTA Login Portal README
- POST /v1/sso/exchange
- InMemorySsoRepository
- Prisma Schema Draft
- sso.repository.ts
- master-admin.routes.ts
- mapUserRecord filter excluding MAINTENANCE for BRANCH_ADMIN
- PrismaModuleRepository
- InMemoryModuleRepository

## God Nodes (most connected - your core abstractions)
1. `cn()` - 145 edges
2. `react` - 43 edges
3. `Button()` - 40 edges
4. `AppShell()` - 38 edges
5. `AppEnv` - 34 edges
6. `AuthError` - 32 edges
7. `MasterBranchDialog()` - 30 edges
8. `DataMasterPage()` - 30 edges
9. `createApp()` - 29 edges
10. `ChangePasswordDialog()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `Catatan keamanan yang belum dibereskan` --references--> `cn()`  [INFERRED]
  docs/plan/sisa-plan-sparta.md → apps/web/src/lib/utils.ts
- `Prisma Schema Draft` --conceptually_related_to--> `Prisma database setup (generate, migrate, seed)`  [INFERRED]
  docs/superpowers/plans/2026-06-17-sparta-backend-monorepo-spec.md → SETUP_GUIDE.md
- `API .env.development config (DATABASE_URL, SESSION_SECRET, OTP_PEPPER, Gmail, module callbacks)` --shares_data_with--> `AppModule model (DB-configured callbackUrl)`  [INFERRED]
  SETUP_GUIDE.md → docs/superpowers/plans/2026-06-17-sparta-backend-monorepo-spec.md
- `SpartaSsoUserPayload (contract v2)` --references--> `@sparta/shared (apps/shared types & validation)`  [EXTRACTED]
  docs/integration/module-sso-contract.md → README.md
- `SPARTA Energy SSO Checklist` --semantically_similar_to--> `Replace local login with redirect to SPARTA Login Portal`  [INFERRED] [semantically similar]
  docs/integration/sparta-energy-sso-checklist.md → docs/integration/sparta-building-sso-checklist.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Per-module SSO readiness checklists implementing the module SSO contract** — docs_integration_sparta_building_sso_checklist_building_sso_checklist, docs_integration_sparta_maintenance_sso_checklist_maintenance_sso_checklist, docs_integration_sparta_energy_sso_checklist_energy_sso_checklist, docs_integration_module_sso_contract_module_sso_contract [EXTRACTED 1.00]
- **SPARTA SSO launch-token exchange flow** — docs_integration_module_sso_contract_post_v1_modules_launch, docs_integration_module_sso_contract_launch_token, docs_integration_module_sso_contract_post_v1_sso_exchange, docs_integration_module_sso_contract_user_matching_order, docs_superpowers_plans_2026_06_17_sparta_backend_monorepo_spec_module_launch_model [EXTRACTED 1.00]
- **BRANCH_ADMIN Maintenance login block mechanism** — docs_superpowers_specs_2026_09_09_block_branch_admin_login_design_branch_admin_email_only_rule, docs_superpowers_plans_2026_09_09_block_branch_admin_login_mapuserrecord_filter, docs_superpowers_plans_2026_09_09_block_branch_admin_login_no_ui_access_error, docs_superpowers_plans_2026_06_17_sparta_backend_monorepo_spec_user_module_access_model [INFERRED 0.85]

## Communities (75 total, 14 thin omitted)

### Community 0 - "forgot-password-page.tsx"
Cohesion: 0.20
Nodes (22): ChangePasswordDialog(), ChangePasswordDialogProps, ChangePasswordStatus, ChangePasswordStep, FieldDescription(), InputGroupButton(), InputGroupInput(), InputOTP() (+14 more)

### Community 1 - "SPARTA Backend Monorepo Implementation Plan"
Cohesion: 0.16
Nodes (11): POST /v1/admin/users/sync, POST /v1/admin/users/sync-delete, GET /v1/master/branches and /v1/master/areas (updatedSince sync), Module SSO Contract, SpartaSsoUserPayload (contract v2), SPARTA Building SSO Checklist, Energy role mapping (AUDITOR, ENGINEER, MANAGER, USER), SPARTA Energy SSO Checklist (+3 more)

### Community 2 - "About Page Components"
Cohesion: 0.06
Nodes (46): AcronymFeatureCard(), AcronymFeatureCardProps, AcronymPart, AppPhoneMockup(), AppPhoneMockupProps, PhoneModule, ModuleExplorer(), ModuleExplorerProps (+38 more)

### Community 3 - "Initial Auth Migration"
Cohesion: 0.08
Nodes (44): "AppModule", AppModule_isActive_sortOrder_idx, "AuditEvent", AuditEvent_action_createdAt_idx, AuditEvent_actorUserId_createdAt_idx, AuditEvent_entityType_entityId_idx, "Branch", Branch_code_key (+36 more)

### Community 4 - "users.test.ts"
Cohesion: 0.08
Nodes (24): createApp(), testEnv, AuthSessionRecord, testEnv, createAppWithFakes(), ModuleLaunchInput, ModuleRecord, testEnv (+16 more)

### Community 5 - "users.routes.ts"
Cohesion: 0.10
Nodes (21): requireAdmin(), createServices(), createUsersRouter(), invalidPayload(), parseBody(), AccessUpdateInput, accessUpdateSchema, ChangeEmailInput (+13 more)

### Community 6 - "Rate Limit & Session Middleware"
Cohesion: 0.11
Nodes (26): CurrentSpartaSession, Express, Request, AuthRepository, AuthUserRecord, cookieOptions(), createAuthRouter(), LoginInput (+18 more)

### Community 7 - "Auth Records & Tests"
Cohesion: 0.10
Nodes (31): AppShell(), AppShellProps, getInitials(), Logo(), LogoProps, AlertDialog(), AlertDialogAction(), AlertDialogCancel() (+23 more)

### Community 8 - "app.ts"
Cohesion: 0.12
Nodes (19): AppOptions, createCorsOptions(), envSchema, loadEnv(), provisioningSecret, errorHandler(), notFoundHandler(), requestContext() (+11 more)

### Community 9 - "API Dev Dependencies"
Cohesion: 0.10
Nodes (28): devDependencies, csv-parser@^3.2.1, supertest@^7.1.4, tsx@^4.21.0, @types/cookie-parser@^1.4.10, @types/cors@^2.8.19, @types/express@^5.0.6, @types/node@^24.0.0 (+20 more)

### Community 10 - "Docker CI Workflow"
Cohesion: 0.08
Nodes (25): permissions, runs-on, steps, jobs, build, name, on, push (+17 more)

### Community 11 - "Web Dependencies"
Cohesion: 0.08
Nodes (32): dependencies, clsx@^2.1.1, cn@^0.5.2, embla-carousel-react@^8.6.0, @fontsource-variable/geist@^5.2.9, input-otp@^1.4.2, lucide-react@^1.17.0, next-themes@^0.4.6 (+24 more)

### Community 12 - "sparta-auth.ts"
Cohesion: 0.05
Nodes (59): App(), loadSession(), acronym, appOrder, AuthBackdrop(), PublicAuthShellProps, usePanelThemeColor(), columnAxes (+51 more)

### Community 13 - "sparta-master-admin.ts"
Cohesion: 0.06
Nodes (46): API_SHARED_MODULE_IDS, ApiSessionResponse, ApiError, ApiResult, ApiSuccess, MasterAreaAdminDto, MasterBranchAdminDto, MasterBranchAliasDto (+38 more)

### Community 14 - "@prisma/client"
Cohesion: 0.22
Nodes (5): @prisma/client@^6.19.0, prisma, { PrismaClient }, prisma, @prisma/client

### Community 15 - "shadcn Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 16 - "Web TS App Config"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+13 more)

### Community 17 - "API Runtime Dependencies"
Cohesion: 0.10
Nodes (20): dependencies, cookie-parser@^1.4.7, cors@^2.8.5, express@^5.2.1, express-rate-limit@^8.2.1, helmet@^8.1.0, @node-rs/argon2@^2.0.2, nodemailer@^9.0.0 (+12 more)

### Community 18 - "SSO Repository"
Cohesion: 0.31
Nodes (9): AppEnv, SsoRepository, createSsoRouter(), invalidPayload(), SsoExchangeInput, ssoExchangeSchema, SsoService, toSsoUserPayload() (+1 more)

### Community 19 - "API TS Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+10 more)

### Community 20 - "login-page.tsx"
Cohesion: 0.23
Nodes (20): Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle(), InputGroup() (+12 more)

### Community 21 - "InMemoryAuthRepository"
Cohesion: 0.06
Nodes (5): CreateSessionInput, InMemoryAuthRepository, InMemoryAuthRepository, InMemoryAuthRepository, InMemoryAuthRepository

### Community 22 - "password.service.ts"
Cohesion: 0.07
Nodes (26): OtpChallengeRecord, PasswordOtpPurpose, PasswordRepository, UpdateOtpChallengeInput, ChangePasswordConfirmInput, changePasswordConfirmSchema, ForgotOtpRequestInput, forgotOtpRequestSchema (+18 more)

### Community 23 - "Web TS Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 24 - "Root Workspace Package"
Cohesion: 0.12
Nodes (17): devDependencies, prettier@^3.8.3, prettier-plugin-tailwindcss@^0.8.0, prettier, prettier-plugin-tailwindcss, name, private, scripts (+9 more)

### Community 25 - "Antislop UI Rules"
Cohesion: 0.20
Nodes (6): antislop Skill (Anti-slop UI filter), Two Usage Modes (During / After audit), AGENTS.md (Codex guidance), Frontend stack: React 19 + Vite 8 + TS 6 + Tailwind v4 + shadcn/ui, AI Coding Rules (AI_RULES.md), CLAUDE.md (Claude Code guidance)

### Community 26 - "Shared TS Config"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+8 more)

### Community 27 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, prettier@^3.8.3, prettier-plugin-tailwindcss@^0.8.0, @types/node@^24, @types/react@^19, @types/react-dom@^19, typescript@~6, vitest@^4.1.8 (+7 more)

### Community 28 - "users.repository.ts"
Cohesion: 0.15
Nodes (13): globalForPrisma, prisma, normalizeBranchAlias(), CreateAuditEventInput, CreateModuleLaunchInput, ModuleLaunchRecord, ModuleRecord, prismaModuleIdByPublicId (+5 more)

### Community 30 - "PrismaAuthRepository"
Cohesion: 0.14
Nodes (9): AuthAccessModuleId, isLaunchableModule(), LaunchablePrismaModuleId, mapSessionRecord(), mapUserRecord(), moduleIdMap, PrismaAuthRepository, PrismaAuthSession (+1 more)

### Community 31 - "createMasterAdminRouter"
Cohesion: 0.21
Nodes (8): actorId(), createMasterAdminRouter(), parseBody(), UpdateAreaInput, MasterAdminService, notFound(), toAreaDto(), toBranchDto()

### Community 32 - "Master Data Repository"
Cohesion: 0.24
Nodes (8): MasterAreaRecord, MasterBranchRecord, MasterListFilter, MasterRepository, PrismaMasterRepository, createTestApp(), InMemoryMasterRepository, testEnv

### Community 33 - "SSO Routes & Schema"
Cohesion: 0.13
Nodes (33): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants, AvatarBadge(), AvatarGroup(), AvatarGroupCount() (+25 more)

### Community 34 - "master-branch-dialog.tsx"
Cohesion: 0.14
Nodes (35): ChangeEmailDialog(), ChangeEmailDialogProps, MODULE_NAMES, MasterAreaDialog(), MasterAreaDialogProps, errorMessage(), MasterBranchDialog(), MasterBranchDialogProps (+27 more)

### Community 35 - "prisma.config.ts"
Cohesion: 0.25
Nodes (5): dotenv@^17.2.3, prisma@^6.19.0, envPath, dotenv, prisma

### Community 36 - "Shared Package Manifest"
Cohesion: 0.15
Nodes (13): devDependencies, typescript@~6, exports, ./api, ./sparta, ./validation, typescript, name (+5 more)

### Community 37 - "Render Deploy Config"
Cohesion: 0.15
Nodes (12): key, sync, value, services, buildCommand, envVars, name, preDeployCommand (+4 more)

### Community 38 - "Theme Provider"
Cohesion: 0.29
Nodes (7): applyLightTheme(), ThemeProvider(), ThemeProviderContext, ThemeProviderProps, ThemeProviderState, useTheme(), Toaster()

### Community 39 - "App Routing & Session"
Cohesion: 0.11
Nodes (21): class-variance-authority@^0.7.1, FasciaStripe(), FasciaStripeProps, PublicAuthShell(), badgeVariants, Button(), buttonVariants, FieldContent() (+13 more)

### Community 40 - "API Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:seed, dev, dev:uat, lint, prisma, prisma:generate (+4 more)

### Community 41 - "AuthError"
Cohesion: 0.16
Nodes (9): AuthError, UpdateUserInput, UsersRepository, IDENTITY_FIELDS, UsersProvisioning, UsersService, UsersServiceCreateInput, UsersServiceUpdateInput (+1 more)

### Community 42 - "password.routes.ts"
Cohesion: 0.28
Nodes (11): loginRateLimit, moduleLaunchRateLimit, otpRequestRateLimit, otpVerifyRateLimit, requireSession(), createFirstPasswordRouter(), createPasswordRouter(), createServices() (+3 more)

### Community 43 - "Database Seed"
Cohesion: 0.24
Nodes (10): branchSeeds, env, legacySeedEmails, main(), moduleSeeds, prisma, seedBranches(), seedModules() (+2 more)

### Community 46 - "master-admin.schemas.ts"
Cohesion: 0.15
Nodes (11): addressSchema, createAliasSchema, CreateAreaInput, createAreaSchema, CreateBranchInput, createBranchSchema, masterCodeSchema, nameSchema (+3 more)

### Community 47 - "storefront-elevation.tsx"
Cohesion: 0.26
Nodes (11): axes, Callout, callouts, circle(), delay(), line(), rect(), SketchAnimated (+3 more)

### Community 48 - "provisioning.repository.ts"
Cohesion: 0.06
Nodes (24): InMemoryProvisioningRepository, mapEvent(), ModuleRoleRecord, NewProvisioningEvent, PrismaEvent, PrismaProvisioningRepository, ProvisioningEventRecord, ProvisioningRepository (+16 more)

### Community 49 - "eslint.config.js"
Cohesion: 0.15
Nodes (12): eslint@^10, @eslint/js@^10, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17, typescript-eslint@^8, eslint, @eslint/js (+4 more)

### Community 50 - "Vite Config"
Cohesion: 0.14
Nodes (9): CSV_FILE_PATH, CsvRow, prisma, @tailwindcss/vite@^4, vite@^8, @vitejs/plugin-react@^6, @tailwindcss/vite, vite (+1 more)

### Community 51 - "pnpm Workspace"
Cohesion: 0.25
Nodes (7): allowBuilds, esbuild, msw, prisma, @prisma/client, @prisma/engines, packages

### Community 52 - "Legacy User Merge Script"
Cohesion: 0.43
Nodes (6): main(), MergedUser, queryBuildingUsers(), queryEnergyUsers(), queryMaintenanceUsers(), ssoPrisma

### Community 53 - "Web Scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, preview, test, typecheck

### Community 54 - "PrismaPasswordRepository"
Cohesion: 0.24
Nodes (3): mapOtpChallenge(), mapUserRecord(), PrismaPasswordRepository

### Community 55 - "Sisa Plan SPARTA (lanjut 2026-11-20)"
Cohesion: 0.15
Nodes (13): Aturan kerja (berlaku untuk semua sesi), Catatan keamanan yang belum dibereskan, Fase 2 di modul (belum mulai), Fase 3: master Toko, Fase 4: master Fasilitas, Keputusan yang menunggu user, Langkah berikutnya: Fase 2B, Lingkungan dev (+5 more)

### Community 56 - "Web TS Root Config"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 63 - "pg"
Cohesion: 0.33
Nodes (4): pg@^8.23.0, c, { Client }, pg

### Community 64 - "master-admin.service.ts"
Cohesion: 0.40
Nodes (7): AdminAreaRecord, AdminBranchRecord, AreaPatch, BranchPatch, MasterAdminRepository, run(), testEnv

### Community 66 - "SPARTA Login Portal README"
Cohesion: 0.19
Nodes (13): Admin user and access management API, SPARTA Backend Monorepo Implementation Plan, Deployment Architecture (Vercel Free + Render Standard), Shared API contracts (SpartaModuleId, SpartaSessionDto, ApiSuccess/ApiError), Tanya ARTA frontend-only placeholder (non-goal), Deployment: Vercel (web) + Render (api), @sparta/api (apps/api Express backend), SPARTA Login Portal README (+5 more)

### Community 67 - "POST /v1/sso/exchange"
Cohesion: 0.22
Nodes (10): apps/web index.html (SPARTA SPA entry), Frontend stack: React 19 + Vite 8 + TS 6 + Tailwind v4 + shadcn/ui, One-time Launch Token (TTL 2 min), POST /v1/modules/:moduleId/launch, POST /v1/sso/exchange, SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH), SSO Launch-and-Exchange Flow, AppModule model (DB-configured callbackUrl) (+2 more)

### Community 69 - "Prisma Schema Draft"
Cohesion: 0.20
Nodes (8): apiFetch credentialed API client, AuditEvent model, OtpChallenge model, OTP password recovery and change (HMAC-hashed OTP), Prisma Schema Draft, Session model, User model, UserModuleAccess model (per-module role)

### Community 70 - "sso.repository.ts"
Cohesion: 0.28
Nodes (5): mapLaunch(), mapUser(), PrismaSsoLaunch, PrismaSsoRepository, SsoLaunchRecord

### Community 72 - "mapUserRecord filter excluding MAINTENANCE for BRANCH_ADMIN"
Cohesion: 0.48
Nodes (5): P0 Authentication Core, Block BRANCH_ADMIN Login Implementation Plan, mapUserRecord filter excluding MAINTENANCE for BRANCH_ADMIN, NO_UI_ACCESS 403 AuthError on empty access, Block BRANCH_ADMIN Login Design

## Knowledge Gaps
- **11 isolated node(s):** `POST /v1/admin/users/sync-delete`, `GET /v1/master/branches and /v1/master/areas (updatedSince sync)`, `Maintenance report/dashboard/PJUM authorization`, `Two Usage Modes (During / After audit)`, `Frontend stack: React 19 + Vite 8 + TS 6 + Tailwind v4 + shadcn/ui` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 487 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `SSO Routes & Schema` to `forgot-password-page.tsx`, `About Page Components`, `master-branch-dialog.tsx`, `App Routing & Session`, `Auth Records & Tests`, `sparta-auth.ts`, `storefront-elevation.tsx`, `login-page.tsx`, `Sisa Plan SPARTA (lanjut 2026-11-20)`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **What connects `POST /v1/admin/users/sync-delete`, `GET /v1/master/branches and /v1/master/areas (updatedSince sync)`, `Maintenance report/dashboard/PJUM authorization` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `About Page Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06464646464646465 - nodes in this community are weakly interconnected._
- **Why does `Catatan keamanan yang belum dibereskan` connect `Sisa Plan SPARTA (lanjut 2026-11-20)` to `SSO Routes & Schema`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Should `Initial Auth Migration` be split into smaller, more focused modules?**
  _Cohesion score 0.07801418439716312 - nodes in this community are weakly interconnected._
- **Why does `Sisa Plan SPARTA (lanjut 2026-11-20)` connect `Sisa Plan SPARTA (lanjut 2026-11-20)` to `SPARTA Backend Monorepo Implementation Plan`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Should `users.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07804878048780488 - nodes in this community are weakly interconnected._