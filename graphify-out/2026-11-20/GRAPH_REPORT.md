# Graph Report - login-sparta  (2026-11-20)

## Corpus Check
- 188 files · ~76,976 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 5, .example 2, .toml 1)

## Summary
- 1648 nodes · 4405 edges · 84 communities (69 shown, 15 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 71 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `97d18585`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- env.ts
- SPARTA Backend Monorepo Implementation Plan
- tentang-sparta-page.tsx
- Initial Auth Migration
- app.ts
- users.schemas.ts
- master-admin.routes.ts
- sparta-master-admin.ts
- master-admin.routes.ts
- API Dev Dependencies
- Docker CI Workflow
- Web Dependencies
- cn
- sparta-user-admin.ts
- mock-api.ts
- shadcn Config
- Web TS App Config
- API Runtime Dependencies
- sso.repository.ts
- API TS Config
- app-shell.tsx
- sparta-auth.ts
- password.service.ts
- Web TS Node Config
- Root Workspace Package
- Antislop UI Rules
- Shared TS Config
- web/package.json
- team-carousel.tsx
- PrismaMasterAdminRepository
- module-launcher-page.tsx
- AuthError
- Master Data Repository
- password.routes.ts
- select.tsx
- users.repository.ts
- Shared Package Manifest
- Render Deploy Config
- Theme Provider
- sparta-assets.ts
- API Scripts
- user-management-page.tsx
- user-access-dialog.tsx
- data-master-page.tsx
- InMemoryMasterAdminRepository
- users.service.ts
- master-admin.service.ts
- storefront-elevation.tsx
- provisioning.repository.ts
- seed.ts
- Vite Config
- pnpm Workspace
- Legacy User Merge Script
- Web Scripts
- PrismaAuthRepository
- Sisa Plan SPARTA (lanjut 2026-11-20)
- Web TS Root Config
- InMemoryAuthRepository
- users.test.ts
- PrismaStoreRepository
- SPARTA Login Portal README
- app-phone-mockup.tsx
- src/shared-contract-check.ts
- Prisma Schema Draft
- table-pagination.tsx
- Badge
- mapUserRecord filter excluding MAINTENANCE for BRANCH_ADMIN
- module-explorer.tsx
- user-management.test.tsx
- PrismaPasswordRepository
- prisma.config.ts
- embla-carousel-react
- modules.test.ts
- Server-side session with HttpOnly cookie
- InMemoryAuthRepository
- SpartaSsoUserPayload (contract v2)
- InMemoryModuleRepository
- 20261120030225_add_store_brand_modules/migration.sql

## God Nodes (most connected - your core abstractions)
1. `cn()` - 149 edges
2. `Button()` - 54 edges
3. `react` - 51 edges
4. `DataMasterPage()` - 51 edges
5. `UserManagementPage()` - 43 edges
6. `AppShell()` - 42 edges
7. `UserAccessDialog()` - 39 edges
8. `AuthError` - 37 edges
9. `MasterStorePanel()` - 37 edges
10. `AppEnv` - 35 edges

## Surprising Connections (you probably didn't know these)
- `Portal (sesi ini)` --references--> `getNavItems()`  [INFERRED]
  docs/plan/sisa-plan-sparta.md → apps/web/src/components/app-shell.tsx
- `Catatan keamanan yang belum dibereskan` --references--> `cn()`  [INFERRED]
  docs/plan/sisa-plan-sparta.md → apps/web/src/lib/utils.ts
- `Fase 3: master Toko` --references--> `now()`  [INFERRED]
  docs/plan/sisa-plan-sparta.md → apps/web/src/lib/dev-mock/mock-api.ts
- `Fase 3: master Toko` --references--> `StoreBrand`  [INFERRED]
  docs/plan/sisa-plan-sparta.md → apps/web/src/lib/sparta-master-admin.ts
- `Prisma Schema Draft` --conceptually_related_to--> `Prisma database setup (generate, migrate, seed)`  [INFERRED]
  docs/superpowers/plans/2026-06-17-sparta-backend-monorepo-spec.md → SETUP_GUIDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Per-module SSO readiness checklists implementing the module SSO contract** — docs_integration_sparta_building_sso_checklist_building_sso_checklist, docs_integration_sparta_maintenance_sso_checklist_maintenance_sso_checklist, docs_integration_sparta_energy_sso_checklist_energy_sso_checklist, docs_integration_module_sso_contract_module_sso_contract [EXTRACTED 1.00]
- **SPARTA SSO launch-token exchange flow** — docs_integration_module_sso_contract_post_v1_modules_launch, docs_integration_module_sso_contract_launch_token, docs_integration_module_sso_contract_post_v1_sso_exchange, docs_integration_module_sso_contract_user_matching_order, docs_superpowers_plans_2026_06_17_sparta_backend_monorepo_spec_module_launch_model [EXTRACTED 1.00]
- **BRANCH_ADMIN Maintenance login block mechanism** — docs_superpowers_specs_2026_09_09_block_branch_admin_login_design_branch_admin_email_only_rule, docs_superpowers_plans_2026_09_09_block_branch_admin_login_mapuserrecord_filter, docs_superpowers_plans_2026_09_09_block_branch_admin_login_no_ui_access_error, docs_superpowers_plans_2026_06_17_sparta_backend_monorepo_spec_user_module_access_model [INFERRED 0.85]

## Communities (84 total, 15 thin omitted)

### Community 0 - "env.ts"
Cohesion: 0.11
Nodes (16): testEnv, envSchema, provisioningSecret, AuthSessionRecord, testEnv, createAppWithFakes(), createAuthenticatedAgent(), TestEmailProvider (+8 more)

### Community 1 - "SPARTA Backend Monorepo Implementation Plan"
Cohesion: 0.19
Nodes (15): POST /v1/admin/users/sync-delete, One-time Launch Token (TTL 2 min), GET /v1/master/branches and /v1/master/areas (updatedSince sync), Module SSO Contract, POST /v1/modules/:moduleId/launch, POST /v1/sso/exchange, SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH), SSO Launch-and-Exchange Flow (+7 more)

### Community 2 - "tentang-sparta-page.tsx"
Cohesion: 0.13
Nodes (20): AcronymFeatureCard(), AcronymFeatureCardProps, AcronymPart, ScribbleUnderline(), ScribbleUnderlineProps, otherDevelopmentTeam, primaryDevelopmentTeam, SpartaTeamMember (+12 more)

### Community 3 - "Initial Auth Migration"
Cohesion: 0.07
Nodes (49): "AppModule", AppModule_isActive_sortOrder_idx, "AuditEvent", AuditEvent_action_createdAt_idx, AuditEvent_actorUserId_createdAt_idx, AuditEvent_entityType_entityId_idx, "Branch", Branch_code_key (+41 more)

### Community 4 - "app.ts"
Cohesion: 0.10
Nodes (27): AppOptions, createApp(), createCorsOptions(), loadEnv(), errorHandler(), notFoundHandler(), requestContext(), requireAdmin() (+19 more)

### Community 5 - "users.schemas.ts"
Cohesion: 0.14
Nodes (13): AccessUpdateInput, accessUpdateSchema, ChangeEmailInput, changeEmailSchema, CreateUserInput, createUserSchema, SyncDeleteUserInput, syncDeleteUserSchema (+5 more)

### Community 6 - "master-admin.routes.ts"
Cohesion: 0.10
Nodes (32): AppEnv, CurrentSpartaSession, Express, Request, AuthAccessModuleId, AuthRepository, LaunchablePrismaModuleId, moduleIdMap (+24 more)

### Community 7 - "sparta-master-admin.ts"
Cohesion: 0.14
Nodes (27): errorMessage(), LoadState, MasterStorePanelProps, ApiClientError, apiFetch(), getApiUrl(), addMasterBranchAlias(), BranchFormInput (+19 more)

### Community 8 - "master-admin.routes.ts"
Cohesion: 0.07
Nodes (27): PrismaStore, StoreBrandRecord, StoreCounts, storeInclude, StoreRecord, StoreRepository, branchCodeSchema, CreateStoreInput (+19 more)

### Community 9 - "API Dev Dependencies"
Cohesion: 0.10
Nodes (28): devDependencies, csv-parser@^3.2.1, supertest@^7.1.4, tsx@^4.21.0, @types/cookie-parser@^1.4.10, @types/cors@^2.8.19, @types/express@^5.0.6, @types/node@^24.0.0 (+20 more)

### Community 10 - "Docker CI Workflow"
Cohesion: 0.08
Nodes (25): permissions, runs-on, steps, jobs, build, name, on, push (+17 more)

### Community 11 - "Web Dependencies"
Cohesion: 0.09
Nodes (23): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cn@^0.5.2, @fontsource-variable/geist@^5.2.9, input-otp@^1.4.2, lucide-react@^1.17.0, next-themes@^0.4.6 (+15 more)

### Community 12 - "cn"
Cohesion: 0.15
Nodes (18): AlertDialogMedia(), AvatarBadge(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), CardAction(), CardFooter(), FieldContent() (+10 more)

### Community 13 - "sparta-user-admin.ts"
Cohesion: 0.09
Nodes (19): AdminUserDto, MasterAreaAdminDto, MasterBranchAdminDto, MasterBranchAliasDto, MasterStoreStatusFilter, ModuleRoleDto, ProvisioningEventDto, ProvisioningEventStatus (+11 more)

### Community 14 - "mock-api.ts"
Cohesion: 0.15
Nodes (24): areas, branches, devRole, events, fail(), handleMaster(), handleStoreBrands(), handleStores() (+16 more)

### Community 15 - "shadcn Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 16 - "Web TS App Config"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+13 more)

### Community 17 - "API Runtime Dependencies"
Cohesion: 0.10
Nodes (21): dependencies, cookie-parser@^1.4.7, cors@^2.8.5, express@^5.2.1, express-rate-limit@^8.2.1, helmet@^8.1.0, @node-rs/argon2@^2.0.2, nodemailer@^9.0.0 (+13 more)

### Community 18 - "sso.repository.ts"
Cohesion: 0.10
Nodes (20): mapLaunch(), mapUser(), PrismaSsoLaunch, PrismaSsoRepository, SsoLaunchRecord, SsoRepository, SsoUserRecord, createSsoRouter() (+12 more)

### Community 19 - "API TS Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+10 more)

### Community 20 - "app-shell.tsx"
Cohesion: 0.14
Nodes (32): AppShell(), AppShellProps, getInitials(), getNavItems(), Logo(), describeAccess(), errorMessage(), isEnabled() (+24 more)

### Community 21 - "sparta-auth.ts"
Cohesion: 0.05
Nodes (127): App(), loadSession(), ChangeEmailDialog(), ChangeEmailDialogProps, MODULE_NAMES, ChangePasswordDialog(), ChangePasswordDialogProps, ChangePasswordStatus (+119 more)

### Community 22 - "password.service.ts"
Cohesion: 0.11
Nodes (16): AuthUserRecord, CreateOtpChallengeInput, OtpChallengeRecord, PasswordOtpPurpose, PasswordRepository, UpdateOtpChallengeInput, ChangePasswordConfirmInput, ForgotOtpRequestInput (+8 more)

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
Nodes (33): tailwindcss@^4, devDependencies, eslint@^10, @eslint/js@^10, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17, prettier@^3.8.3 (+25 more)

### Community 28 - "team-carousel.tsx"
Cohesion: 0.19
Nodes (19): getGeneration(), getLoopDistance(), getRoleTitle(), padIndex(), TeamCarousel(), TeamCarouselProps, Carousel(), CarouselApi (+11 more)

### Community 30 - "module-launcher-page.tsx"
Cohesion: 0.14
Nodes (25): Item(), ItemActions(), ItemContent(), ItemDescription(), ItemFooter(), ItemGroup(), ItemHeader(), ItemMedia() (+17 more)

### Community 31 - "AuthError"
Cohesion: 0.16
Nodes (10): AuthError, actorId(), createMasterAdminRouter(), parseBody(), MasterAdminService, notFound(), StoreService, toPrismaModule() (+2 more)

### Community 32 - "Master Data Repository"
Cohesion: 0.21
Nodes (9): normalizeBranchAlias(), MasterAreaRecord, MasterBranchRecord, MasterListFilter, MasterRepository, PrismaMasterRepository, createTestApp(), InMemoryMasterRepository (+1 more)

### Community 33 - "password.routes.ts"
Cohesion: 0.20
Nodes (16): loginRateLimit, moduleLaunchRateLimit, otpRequestRateLimit, otpVerifyRateLimit, requireSession(), createFirstPasswordRouter(), createPasswordRouter(), createServices() (+8 more)

### Community 34 - "select.tsx"
Cohesion: 0.25
Nodes (13): ModuleRoleSelect(), ModuleRoleSelectProps, Select(), SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton() (+5 more)

### Community 35 - "users.repository.ts"
Cohesion: 0.11
Nodes (16): prisma, { PrismaClient }, globalForPrisma, prisma, CreateAuditEventInput, CreateModuleLaunchInput, mapModule(), ModuleLaunchRecord (+8 more)

### Community 36 - "Shared Package Manifest"
Cohesion: 0.15
Nodes (13): devDependencies, typescript@~6, exports, ./api, ./sparta, ./validation, typescript, name (+5 more)

### Community 37 - "Render Deploy Config"
Cohesion: 0.15
Nodes (12): key, sync, value, services, buildCommand, envVars, name, preDeployCommand (+4 more)

### Community 38 - "Theme Provider"
Cohesion: 0.29
Nodes (7): applyLightTheme(), ThemeProvider(), ThemeProviderContext, ThemeProviderProps, ThemeProviderState, useTheme(), Toaster()

### Community 40 - "API Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:seed, dev, dev:uat, lint, prisma, prisma:generate (+4 more)

### Community 41 - "user-management-page.tsx"
Cohesion: 0.19
Nodes (16): TableBody(), TableCaption(), TableCell(), TableFooter(), TableHeader(), TableRow(), listAdminUsers(), DialogState (+8 more)

### Community 42 - "user-access-dialog.tsx"
Cohesion: 0.15
Nodes (20): dateFormat, errorMessage(), EVENT_LABEL, EVENT_STATUS, EventsState, UserAccessDialogProps, AdminUser, grantModuleAccess() (+12 more)

### Community 43 - "data-master-page.tsx"
Cohesion: 0.12
Nodes (28): MasterStorePanel(), StatCard(), StatusBadge(), Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants (+20 more)

### Community 45 - "users.service.ts"
Cohesion: 0.08
Nodes (11): CreateUserInput, mapUserRecord(), PrismaUsersRepository, UpdateUserInput, UsersRepository, IDENTITY_FIELDS, UsersProvisioning, UsersService (+3 more)

### Community 46 - "master-admin.service.ts"
Cohesion: 0.11
Nodes (22): requireRoles(), AdminAreaRecord, AdminBranchRecord, AreaPatch, BranchPatch, MasterAdminRepository, addressSchema, createAliasSchema (+14 more)

### Community 47 - "storefront-elevation.tsx"
Cohesion: 0.26
Nodes (11): axes, Callout, callouts, circle(), delay(), line(), rect(), SketchAnimated (+3 more)

### Community 48 - "provisioning.repository.ts"
Cohesion: 0.06
Nodes (24): InMemoryProvisioningRepository, mapEvent(), ModuleRoleRecord, NewProvisioningEvent, PrismaEvent, PrismaProvisioningRepository, ProvisioningEventRecord, ProvisioningRepository (+16 more)

### Community 49 - "seed.ts"
Cohesion: 0.21
Nodes (12): branchSeeds, env, legacySeedEmails, main(), moduleRoleSeeds, moduleSeeds, prisma, seedBranches() (+4 more)

### Community 50 - "Vite Config"
Cohesion: 0.14
Nodes (9): CSV_FILE_PATH, CsvRow, prisma, @tailwindcss/vite@^4, vite@^8, @vitejs/plugin-react@^6, @tailwindcss/vite, vite (+1 more)

### Community 51 - "pnpm Workspace"
Cohesion: 0.25
Nodes (7): allowBuilds, esbuild, msw, prisma, @prisma/client, @prisma/engines, packages

### Community 52 - "Legacy User Merge Script"
Cohesion: 0.29
Nodes (9): pg@^8.23.0, main(), MergedUser, queryBuildingUsers(), queryEnergyUsers(), queryMaintenanceUsers(), requireEnv(), ssoPrisma (+1 more)

### Community 53 - "Web Scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, preview, test, typecheck

### Community 54 - "PrismaAuthRepository"
Cohesion: 0.20
Nodes (4): isLaunchableModule(), mapSessionRecord(), mapUserRecord(), PrismaAuthRepository

### Community 55 - "Sisa Plan SPARTA (lanjut 2026-11-20)"
Cohesion: 0.12
Nodes (15): StoreBrand, Aturan kerja (berlaku untuk semua sesi), Catatan keamanan yang belum dibereskan, Fase 2 di modul (belum mulai), Fase 3: master Toko, Fase 4: master Fasilitas, Keputusan yang menunggu user, Langkah berikutnya: Fase 2B (+7 more)

### Community 56 - "Web TS Root Config"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 64 - "users.test.ts"
Cohesion: 0.13
Nodes (5): InMemoryAuthRepository, sync(), testEnv, argonOptions, verifyPasswordHash()

### Community 65 - "PrismaStoreRepository"
Cohesion: 0.18
Nodes (3): buildWhere(), mapStore(), PrismaStoreRepository

### Community 66 - "SPARTA Login Portal README"
Cohesion: 0.20
Nodes (11): apps/web index.html (SPARTA SPA entry), Frontend stack: React 19 + Vite 8 + TS 6 + Tailwind v4 + shadcn/ui, Deployment Architecture (Vercel Free + Render Standard), Deployment: Vercel (web) + Render (api), @sparta/api (apps/api Express backend), SPARTA Login Portal README, @sparta/web (apps/web), API .env.development config (DATABASE_URL, SESSION_SECRET, OTP_PEPPER, Gmail, module callbacks) (+3 more)

### Community 67 - "app-phone-mockup.tsx"
Cohesion: 0.25
Nodes (4): AppPhoneMockup(), AppPhoneMockupProps, PhoneModule, LogoProps

### Community 68 - "src/shared-contract-check.ts"
Cohesion: 0.20
Nodes (9): API_SHARED_MODULE_IDS, ApiSessionResponse, ApiError, ApiResult, ApiSuccess, SPARTA_MODULE_IDS, SpartaSessionDto, WEB_SHARED_MODULE_IDS (+1 more)

### Community 69 - "Prisma Schema Draft"
Cohesion: 0.32
Nodes (8): AppModule model (DB-configured callbackUrl), AuditEvent model, ModuleLaunch model (launchTokenHash, consumedAt), OtpChallenge model, OTP password recovery and change (HMAC-hashed OTP), Prisma Schema Draft, User model, UserModuleAccess model (per-module role)

### Community 70 - "table-pagination.tsx"
Cohesion: 0.37
Nodes (11): pageNumbers(), TablePagination(), TablePaginationProps, Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem(), PaginationLink() (+3 more)

### Community 71 - "Badge"
Cohesion: 0.32
Nodes (6): DOT_CLASS, StatusBadgeProps, StatusTone, Badge(), badgeVariants, class-variance-authority

### Community 72 - "mapUserRecord filter excluding MAINTENANCE for BRANCH_ADMIN"
Cohesion: 0.33
Nodes (7): Energy role mapping (AUDITOR, ENGINEER, MANAGER, USER), Maintenance role mapping (ADMIN, BMS, BMC, BNM, MANAGER, USER), P0 Authentication Core, Block BRANCH_ADMIN Login Implementation Plan, mapUserRecord filter excluding MAINTENANCE for BRANCH_ADMIN, NO_UI_ACCESS 403 AuthError on empty access, Block BRANCH_ADMIN Login Design

### Community 73 - "module-explorer.tsx"
Cohesion: 0.50
Nodes (4): ModuleExplorer(), ModuleExplorerProps, ModuleItem, padIndex()

### Community 74 - "user-management.test.tsx"
Cohesion: 0.25
Nodes (9): react-dom@^19.2.6, handleDevMockRequest(), Body, call(), Body, call(), renderNav(), sessionWithRole() (+1 more)

### Community 75 - "PrismaPasswordRepository"
Cohesion: 0.24
Nodes (3): mapOtpChallenge(), mapUserRecord(), PrismaPasswordRepository

### Community 76 - "prisma.config.ts"
Cohesion: 0.25
Nodes (5): dotenv@^17.2.3, prisma@^6.19.0, envPath, dotenv, prisma

### Community 78 - "modules.test.ts"
Cohesion: 0.12
Nodes (6): CreateSessionInput, createAppWithFakes(), InMemoryAuthRepository, ModuleLaunchInput, ModuleRecord, testEnv

### Community 81 - "SpartaSsoUserPayload (contract v2)"
Cohesion: 0.40
Nodes (4): POST /v1/admin/users/sync, SpartaSsoUserPayload (contract v2), Shared API contracts (SpartaModuleId, SpartaSessionDto, ApiSuccess/ApiError), @sparta/shared (apps/shared types & validation)

## Knowledge Gaps
- **11 isolated node(s):** `POST /v1/admin/users/sync-delete`, `GET /v1/master/branches and /v1/master/areas (updatedSince sync)`, `SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH)`, `Maintenance report/dashboard/PJUM authorization`, `Admin user and access management API` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 550 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SpartaLaunchableModuleId` connect `master-admin.routes.ts` to `users.test.ts`, `users.repository.ts`, `user-access-dialog.tsx`, `users.service.ts`, `modules.test.ts`, `sparta-user-admin.ts`, `mock-api.ts`, `sso.repository.ts`, `app-shell.tsx`, `sparta-auth.ts`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **What connects `POST /v1/admin/users/sync-delete`, `GET /v1/master/branches and /v1/master/areas (updatedSince sync)`, `SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH)` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `env.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11363636363636363 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `tentang-sparta-page.tsx`, `app-phone-mockup.tsx`, `select.tsx`, `Badge`, `module-explorer.tsx`, `user-management-page.tsx`, `data-master-page.tsx`, `storefront-elevation.tsx`, `app-shell.tsx`, `sparta-auth.ts`, `Sisa Plan SPARTA (lanjut 2026-11-20)`, `team-carousel.tsx`, `module-launcher-page.tsx`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Should `tentang-sparta-page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13405797101449277 - nodes in this community are weakly interconnected._
- **Should `Initial Auth Migration` be split into smaller, more focused modules?**
  _Cohesion score 0.06848357791754019 - nodes in this community are weakly interconnected._
- **Should `app.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10241820768136557 - nodes in this community are weakly interconnected._