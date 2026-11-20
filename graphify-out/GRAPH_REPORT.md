# Graph Report - login-sparta  (2026-11-20)

## Corpus Check
- 178 files · ~69,316 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 5, .example 2, .toml 1)

## Summary
- 1534 nodes · 3938 edges · 77 communities (64 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ff34f06c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- email.service.ts
- SPARTA Backend Monorepo Implementation Plan
- About Page Components
- Initial Auth Migration
- users.test.ts
- users.schemas.ts
- Rate Limit & Session Middleware
- user-form-dialog.tsx
- app.ts
- API Dev Dependencies
- Docker CI Workflow
- Web Dependencies
- cn
- mock-api.ts
- fix-branch-passwords.cjs
- shadcn Config
- Web TS App Config
- API Runtime Dependencies
- SSO Repository
- API TS Config
- module-launcher-page.tsx
- user-management-page.tsx
- password.service.ts
- Web TS Node Config
- Root Workspace Package
- Antislop UI Rules
- Shared TS Config
- web/package.json
- index.ts
- PrismaMasterAdminRepository
- PrismaAuthRepository
- createMasterAdminRouter
- Master Data Repository
- App.tsx
- Button
- prisma.config.ts
- Shared Package Manifest
- Render Deploy Config
- Theme Provider
- public-auth-shell.tsx
- API Scripts
- sparta-auth.ts
- password.routes.ts
- app-shell.tsx
- InMemoryMasterAdminRepository
- PrismaUsersRepository
- master-admin.schemas.ts
- storefront-elevation.tsx
- provisioning.repository.ts
- seed.ts
- Vite Config
- pnpm Workspace
- Legacy User Merge Script
- Web Scripts
- PrismaPasswordRepository
- Sisa Plan SPARTA (lanjut 2026-11-20)
- Web TS Root Config
- InMemoryAuthRepository
- master-admin.service.ts
- import-users.ts
- SPARTA Login Portal README
- POST /v1/sso/exchange
- Prisma Schema Draft
- table-pagination.tsx
- mapUserRecord filter excluding MAINTENANCE for BRANCH_ADMIN
- InMemoryModuleRepository
- InMemoryPasswordRepository
- sparta-assets.ts
- Server-side session with HttpOnly cookie
- stat-card.tsx
- SpartaSsoUserPayload (contract v2)

## God Nodes (most connected - your core abstractions)
1. `cn()` - 149 edges
2. `DataMasterPage()` - 49 edges
3. `react` - 48 edges
4. `Button()` - 48 edges
5. `UserManagementPage()` - 43 edges
6. `AppShell()` - 42 edges
7. `UserAccessDialog()` - 39 edges
8. `AppEnv` - 34 edges
9. `AuthError` - 32 edges
10. `UserFormDialog()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `Portal (sesi ini)` --references--> `getNavItems()`  [INFERRED]
  docs/plan/sisa-plan-sparta.md → apps/web/src/components/app-shell.tsx
- `Catatan keamanan yang belum dibereskan` --references--> `cn()`  [INFERRED]
  docs/plan/sisa-plan-sparta.md → apps/web/src/lib/utils.ts
- `Prisma Schema Draft` --conceptually_related_to--> `Prisma database setup (generate, migrate, seed)`  [INFERRED]
  docs/superpowers/plans/2026-06-17-sparta-backend-monorepo-spec.md → SETUP_GUIDE.md
- `SPARTA Energy SSO Checklist` --semantically_similar_to--> `Replace local login with redirect to SPARTA Login Portal`  [INFERRED] [semantically similar]
  docs/integration/sparta-energy-sso-checklist.md → docs/integration/sparta-building-sso-checklist.md
- `SPARTA Backend Monorepo Implementation Plan` --references--> `SPARTA Login Portal README`  [EXTRACTED]
  docs/superpowers/plans/2026-06-17-sparta-backend-monorepo-spec.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Per-module SSO readiness checklists implementing the module SSO contract** — docs_integration_sparta_building_sso_checklist_building_sso_checklist, docs_integration_sparta_maintenance_sso_checklist_maintenance_sso_checklist, docs_integration_sparta_energy_sso_checklist_energy_sso_checklist, docs_integration_module_sso_contract_module_sso_contract [EXTRACTED 1.00]
- **SPARTA SSO launch-token exchange flow** — docs_integration_module_sso_contract_post_v1_modules_launch, docs_integration_module_sso_contract_launch_token, docs_integration_module_sso_contract_post_v1_sso_exchange, docs_integration_module_sso_contract_user_matching_order, docs_superpowers_plans_2026_06_17_sparta_backend_monorepo_spec_module_launch_model [EXTRACTED 1.00]
- **BRANCH_ADMIN Maintenance login block mechanism** — docs_superpowers_specs_2026_09_09_block_branch_admin_login_design_branch_admin_email_only_rule, docs_superpowers_plans_2026_09_09_block_branch_admin_login_mapuserrecord_filter, docs_superpowers_plans_2026_09_09_block_branch_admin_login_no_ui_access_error, docs_superpowers_plans_2026_06_17_sparta_backend_monorepo_spec_user_module_access_model [INFERRED 0.85]

## Communities (77 total, 13 thin omitted)

### Community 0 - "email.service.ts"
Cohesion: 0.30
Nodes (6): TestEmailProvider, ConsoleEmailProvider, createEmailProvider(), EmailMessage, EmailProvider, GmailEmailProvider

### Community 1 - "SPARTA Backend Monorepo Implementation Plan"
Cohesion: 0.19
Nodes (10): POST /v1/admin/users/sync-delete, GET /v1/master/branches and /v1/master/areas (updatedSince sync), Module SSO Contract, SPARTA Building SSO Checklist, SPARTA Energy SSO Checklist, SPARTA Maintenance SSO Checklist, Maintenance report/dashboard/PJUM authorization, Admin user and access management API (+2 more)

### Community 2 - "About Page Components"
Cohesion: 0.06
Nodes (48): embla-carousel-react@^8.6.0, AcronymFeatureCard(), AcronymFeatureCardProps, AcronymPart, AppPhoneMockup(), AppPhoneMockupProps, PhoneModule, ModuleExplorer() (+40 more)

### Community 3 - "Initial Auth Migration"
Cohesion: 0.08
Nodes (44): "AppModule", AppModule_isActive_sortOrder_idx, "AuditEvent", AuditEvent_action_createdAt_idx, AuditEvent_actorUserId_createdAt_idx, AuditEvent_entityType_entityId_idx, "Branch", Branch_code_key (+36 more)

### Community 4 - "users.test.ts"
Cohesion: 0.07
Nodes (26): createApp(), testEnv, envSchema, loadEnv(), provisioningSecret, AuthSessionRecord, testEnv, createAppWithFakes() (+18 more)

### Community 5 - "users.schemas.ts"
Cohesion: 0.13
Nodes (19): requireAdmin(), createServices(), createUsersRouter(), invalidPayload(), parseBody(), AccessUpdateInput, accessUpdateSchema, ChangeEmailInput (+11 more)

### Community 6 - "Rate Limit & Session Middleware"
Cohesion: 0.10
Nodes (28): CurrentSpartaSession, Express, Request, requireSession(), AuthRepository, cookieOptions(), createAuthRouter(), LoginInput (+20 more)

### Community 7 - "user-form-dialog.tsx"
Cohesion: 0.10
Nodes (48): SpartaUserStatus, errorMessage(), MasterBranchDialog(), MasterBranchDialogProps, ModuleRoleSelect(), ModuleRoleSelectProps, FieldSeparator(), Input() (+40 more)

### Community 8 - "app.ts"
Cohesion: 0.12
Nodes (18): AppOptions, createCorsOptions(), errorHandler(), notFoundHandler(), requestContext(), requireInternalApiKey(), requireRoles(), AuthRouterOptions (+10 more)

### Community 9 - "API Dev Dependencies"
Cohesion: 0.10
Nodes (26): devDependencies, supertest@^7.1.4, tsx@^4.21.0, @types/cookie-parser@^1.4.10, @types/cors@^2.8.19, @types/express@^5.0.6, @types/node@^24.0.0, @types/nodemailer@^8.0.1 (+18 more)

### Community 10 - "Docker CI Workflow"
Cohesion: 0.08
Nodes (25): permissions, runs-on, steps, jobs, build, name, on, push (+17 more)

### Community 11 - "Web Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cn@^0.5.2, @fontsource-variable/geist@^5.2.9, input-otp@^1.4.2, lucide-react@^1.17.0, next-themes@^0.4.6 (+17 more)

### Community 12 - "cn"
Cohesion: 0.09
Nodes (36): AlertAction(), AlertDialogMedia(), AvatarBadge(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), badgeVariants, buttonVariants (+28 more)

### Community 13 - "mock-api.ts"
Cohesion: 0.05
Nodes (51): API_SHARED_MODULE_IDS, ApiSessionResponse, ApiError, ApiResult, ApiSuccess, AdminUserDto, MasterAreaAdminDto, MasterBranchAdminDto (+43 more)

### Community 15 - "shadcn Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 16 - "Web TS App Config"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+13 more)

### Community 17 - "API Runtime Dependencies"
Cohesion: 0.10
Nodes (21): dependencies, cookie-parser@^1.4.7, cors@^2.8.5, express@^5.2.1, express-rate-limit@^8.2.1, helmet@^8.1.0, @node-rs/argon2@^2.0.2, nodemailer@^9.0.0 (+13 more)

### Community 18 - "SSO Repository"
Cohesion: 0.27
Nodes (9): AppEnv, PrismaSsoRepository, SsoRepository, createSsoRouter(), invalidPayload(), SsoExchangeInput, ssoExchangeSchema, SsoService (+1 more)

### Community 19 - "API TS Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+10 more)

### Community 20 - "module-launcher-page.tsx"
Cohesion: 0.17
Nodes (21): Item(), ItemActions(), ItemContent(), ItemDescription(), ItemFooter(), ItemGroup(), ItemHeader(), ItemMedia() (+13 more)

### Community 21 - "user-management-page.tsx"
Cohesion: 0.09
Nodes (61): StatCard(), DOT_CLASS, StatusBadge(), StatusBadgeProps, StatusTone, Alert(), AlertDescription(), AlertTitle() (+53 more)

### Community 22 - "password.service.ts"
Cohesion: 0.11
Nodes (16): AuthUserRecord, AuthError, OtpChallengeRecord, PasswordOtpPurpose, PasswordRepository, ChangePasswordConfirmInput, ForgotOtpRequestInput, ForgotOtpVerifyInput (+8 more)

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

### Community 27 - "web/package.json"
Cohesion: 0.09
Nodes (31): devDependencies, eslint@^10, @eslint/js@^10, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17, prettier@^3.8.3, prettier-plugin-tailwindcss@^0.8.0 (+23 more)

### Community 28 - "index.ts"
Cohesion: 0.07
Nodes (30): globalForPrisma, prisma, AuthAccessModuleId, LaunchablePrismaModuleId, moduleIdMap, PrismaAuthSession, PrismaAuthUser, CreateAuditEventInput (+22 more)

### Community 30 - "PrismaAuthRepository"
Cohesion: 0.20
Nodes (4): isLaunchableModule(), mapSessionRecord(), mapUserRecord(), PrismaAuthRepository

### Community 31 - "createMasterAdminRouter"
Cohesion: 0.16
Nodes (10): normalizeBranchAlias(), actorId(), createMasterAdminRouter(), parseBody(), CreateAreaInput, UpdateAreaInput, MasterAdminService, notFound() (+2 more)

### Community 32 - "Master Data Repository"
Cohesion: 0.24
Nodes (8): MasterAreaRecord, MasterBranchRecord, MasterListFilter, MasterRepository, PrismaMasterRepository, createTestApp(), InMemoryMasterRepository, testEnv

### Community 33 - "App.tsx"
Cohesion: 0.32
Nodes (10): App(), loadSession(), getCurrentSpartaSession(), isSpartaSsoEnabled(), logoutFromSparta(), AppRoute, getCurrentRoute(), getDefaultRoute() (+2 more)

### Community 34 - "Button"
Cohesion: 0.11
Nodes (62): ChangeEmailDialog(), ChangeEmailDialogProps, MODULE_NAMES, ChangePasswordDialog(), ChangePasswordDialogProps, ChangePasswordStatus, ChangePasswordStep, MasterAreaDialog() (+54 more)

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
Cohesion: 0.23
Nodes (9): react-dom@^19.2.6, applyLightTheme(), ThemeProvider(), ThemeProviderContext, ThemeProviderProps, ThemeProviderState, useTheme(), Toaster() (+1 more)

### Community 39 - "public-auth-shell.tsx"
Cohesion: 0.13
Nodes (15): FasciaStripe(), FasciaStripeProps, Logo(), LogoProps, acronym, appOrder, AuthBackdrop(), PublicAuthShell() (+7 more)

### Community 40 - "API Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:seed, dev, dev:uat, lint, prisma, prisma:generate (+4 more)

### Community 41 - "sparta-auth.ts"
Cohesion: 0.14
Nodes (14): ChangeEmailResult, ChangePasswordWithOtpInput, defaultModuleLoginUrls, getAccessibleApps(), LoginInput, LoginResult, mergeModule(), ModulesResponse (+6 more)

### Community 42 - "password.routes.ts"
Cohesion: 0.20
Nodes (15): loginRateLimit, moduleLaunchRateLimit, otpRequestRateLimit, otpVerifyRateLimit, createFirstPasswordRouter(), createPasswordRouter(), createServices(), invalidPayload() (+7 more)

### Community 43 - "app-shell.tsx"
Cohesion: 0.19
Nodes (19): AppShell(), AppShellProps, getInitials(), getNavItems(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent() (+11 more)

### Community 46 - "master-admin.schemas.ts"
Cohesion: 0.18
Nodes (10): addressSchema, createAliasSchema, createAreaSchema, CreateBranchInput, createBranchSchema, masterCodeSchema, nameSchema, updateAreaSchema (+2 more)

### Community 47 - "storefront-elevation.tsx"
Cohesion: 0.26
Nodes (11): axes, Callout, callouts, circle(), delay(), line(), rect(), SketchAnimated (+3 more)

### Community 48 - "provisioning.repository.ts"
Cohesion: 0.06
Nodes (26): InMemoryProvisioningRepository, mapEvent(), ModuleRoleRecord, NewProvisioningEvent, PrismaEvent, PrismaProvisioningRepository, ProvisioningEventRecord, ProvisioningRepository (+18 more)

### Community 49 - "seed.ts"
Cohesion: 0.21
Nodes (12): branchSeeds, env, legacySeedEmails, main(), moduleRoleSeeds, moduleSeeds, prisma, seedBranches() (+4 more)

### Community 50 - "Vite Config"
Cohesion: 0.25
Nodes (6): @tailwindcss/vite@^4, vite@^8, @vitejs/plugin-react@^6, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 51 - "pnpm Workspace"
Cohesion: 0.25
Nodes (7): allowBuilds, esbuild, msw, prisma, @prisma/client, @prisma/engines, packages

### Community 52 - "Legacy User Merge Script"
Cohesion: 0.29
Nodes (9): pg@^8.23.0, main(), MergedUser, queryBuildingUsers(), queryEnergyUsers(), queryMaintenanceUsers(), requireEnv(), ssoPrisma (+1 more)

### Community 53 - "Web Scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, preview, test, typecheck

### Community 54 - "PrismaPasswordRepository"
Cohesion: 0.24
Nodes (3): mapOtpChallenge(), mapUserRecord(), PrismaPasswordRepository

### Community 55 - "Sisa Plan SPARTA (lanjut 2026-11-20)"
Cohesion: 0.14
Nodes (14): Aturan kerja (berlaku untuk semua sesi), Catatan keamanan yang belum dibereskan, Fase 2 di modul (belum mulai), Fase 3: master Toko, Fase 4: master Fasilitas, Keputusan yang menunggu user, Langkah berikutnya: Fase 2B, Lingkungan dev (+6 more)

### Community 56 - "Web TS Root Config"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 63 - "InMemoryAuthRepository"
Cohesion: 0.06
Nodes (6): CreateSessionInput, InMemoryAuthRepository, InMemoryAuthRepository, InMemoryAuthRepository, InMemoryAuthRepository, sync()

### Community 64 - "master-admin.service.ts"
Cohesion: 0.40
Nodes (7): AdminAreaRecord, AdminBranchRecord, AreaPatch, BranchPatch, MasterAdminRepository, run(), testEnv

### Community 65 - "import-users.ts"
Cohesion: 0.25
Nodes (5): csv-parser@^3.2.1, CSV_FILE_PATH, CsvRow, prisma, csv-parser

### Community 66 - "SPARTA Login Portal README"
Cohesion: 0.20
Nodes (12): apps/web index.html (SPARTA SPA entry), Frontend stack: React 19 + Vite 8 + TS 6 + Tailwind v4 + shadcn/ui, AppModule model (DB-configured callbackUrl), Deployment Architecture (Vercel Free + Render Standard), Deployment: Vercel (web) + Render (api), @sparta/api (apps/api Express backend), SPARTA Login Portal README, @sparta/web (apps/web) (+4 more)

### Community 67 - "POST /v1/sso/exchange"
Cohesion: 0.40
Nodes (6): One-time Launch Token (TTL 2 min), POST /v1/modules/:moduleId/launch, POST /v1/sso/exchange, SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH), SSO Launch-and-Exchange Flow, ModuleLaunch model (launchTokenHash, consumedAt)

### Community 69 - "Prisma Schema Draft"
Cohesion: 0.29
Nodes (8): Energy role mapping (AUDITOR, ENGINEER, MANAGER, USER), Maintenance role mapping (ADMIN, BMS, BMC, BNM, MANAGER, USER), AuditEvent model, OtpChallenge model, OTP password recovery and change (HMAC-hashed OTP), Prisma Schema Draft, User model, UserModuleAccess model (per-module role)

### Community 70 - "table-pagination.tsx"
Cohesion: 0.37
Nodes (11): pageNumbers(), TablePagination(), TablePaginationProps, Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem(), PaginationLink() (+3 more)

### Community 72 - "mapUserRecord filter excluding MAINTENANCE for BRANCH_ADMIN"
Cohesion: 0.48
Nodes (5): P0 Authentication Core, Block BRANCH_ADMIN Login Implementation Plan, mapUserRecord filter excluding MAINTENANCE for BRANCH_ADMIN, NO_UI_ACCESS 403 AuthError on empty access, Block BRANCH_ADMIN Login Design

### Community 75 - "InMemoryPasswordRepository"
Cohesion: 0.22
Nodes (3): CreateOtpChallengeInput, UpdateOtpChallengeInput, InMemoryPasswordRepository

### Community 80 - "stat-card.tsx"
Cohesion: 0.50
Nodes (3): StatCardProps, StatTone, TONE_CLASS

### Community 81 - "SpartaSsoUserPayload (contract v2)"
Cohesion: 0.50
Nodes (4): POST /v1/admin/users/sync, SpartaSsoUserPayload (contract v2), Shared API contracts (SpartaModuleId, SpartaSessionDto, ApiSuccess/ApiError), @sparta/shared (apps/shared types & validation)

## Knowledge Gaps
- **11 isolated node(s):** `POST /v1/admin/users/sync-delete`, `GET /v1/master/branches and /v1/master/areas (updatedSince sync)`, `Maintenance report/dashboard/PJUM authorization`, `Admin user and access management API`, `Tanya ARTA frontend-only placeholder (non-goal)` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 513 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `About Page Components`, `Button`, `public-auth-shell.tsx`, `user-form-dialog.tsx`, `app-shell.tsx`, `storefront-elevation.tsx`, `stat-card.tsx`, `module-launcher-page.tsx`, `user-management-page.tsx`, `Sisa Plan SPARTA (lanjut 2026-11-20)`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **What connects `POST /v1/admin/users/sync-delete`, `GET /v1/master/branches and /v1/master/areas (updatedSince sync)`, `Maintenance report/dashboard/PJUM authorization` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `About Page Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06298701298701298 - nodes in this community are weakly interconnected._
- **Why does `Sisa Plan SPARTA (diperbarui 2026-11-20)` connect `Sisa Plan SPARTA (lanjut 2026-11-20)` to `SPARTA Backend Monorepo Implementation Plan`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Should `Initial Auth Migration` be split into smaller, more focused modules?**
  _Cohesion score 0.07801418439716312 - nodes in this community are weakly interconnected._
- **Why does `Catatan keamanan yang belum dibereskan` connect `Sisa Plan SPARTA (lanjut 2026-11-20)` to `cn`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Should `users.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06845513413506013 - nodes in this community are weakly interconnected._