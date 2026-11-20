# Graph Report - login-sparta  (2026-11-20)

## Corpus Check
- 198 files · ~85,573 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 5, .example 2, .toml 1)

## Summary
- 1717 nodes · 4564 edges · 95 communities (82 shown, 13 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 75 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9c86c645`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- SPARTA Backend Monorepo Implementation Plan
- tentang-sparta-page.tsx
- Initial Auth Migration
- users.schemas.ts
- provisioning.test.ts
- AuthError
- user-form-dialog.tsx
- data-master-page.tsx
- API Dev Dependencies
- Docker CI Workflow
- Web Dependencies
- modules.routes.ts
- eslint.config.js
- mock-api.ts
- shadcn Config
- Web TS App Config
- API Runtime Dependencies
- app.ts
- API TS Config
- web/package.json
- Button
- password.service.ts
- Web TS Node Config
- Root Workspace Package
- Antislop UI Rules
- Shared TS Config
- devDependencies
- master-store-panel.tsx
- PrismaMasterAdminRepository
- module-launcher-page.tsx
- master.routes.ts
- convert-branch-codes.ts
- store.test.ts
- AppEnv
- createMasterAdminRouter
- Shared Package Manifest
- Render Deploy Config
- Theme Provider
- master-admin.routes.ts
- API Scripts
- public-auth-shell.tsx
- master-admin.service.ts
- provisioning.repository.ts
- SpartaModuleId
- SpartaLaunchableModuleId
- sparta.ts
- InMemoryMasterAdminRepository
- sparta-auth.ts
- seed.ts
- Vite Config
- pnpm Workspace
- Legacy User Merge Script
- Web Scripts
- PrismaAuthRepository
- credential-sealer.test.ts
- Web TS Root Config
- PrismaProvisioningRepository
- user-management-page.tsx
- PrismaStoreRepository
- PrismaUsersRepository
- Sisa Plan SPARTA (diperbarui 2026-11-20)
- users.routes.ts
- import-users.ts
- password.routes.ts
- AuthRepository
- master.test.ts
- App.tsx
- table-pagination.tsx
- users.repository.ts
- createApp
- ApiSuccess
- SPARTA Login Portal README
- storefront-elevation.tsx
- InMemoryUsersRepository
- user-management.test.tsx
- portal-access.ts
- credential-seal.ts
- InMemoryModuleRepository
- Prisma Schema Draft
- 20261120030225_add_store_brand_modules/migration.sql
- Checklist deploy portal SPARTA (disusun 2026-11-20)
- mapUserRecord filter excluding MAINTENANCE for BRANCH_ADMIN
- POST /v1/sso/exchange
- store-floor-plan.tsx
- Server-side session with HttpOnly cookie
- SpartaSsoUserPayload (contract v2)
- downloadCsv

## God Nodes (most connected - your core abstractions)
1. `cn()` - 158 edges
2. `Button()` - 54 edges
3. `react` - 52 edges
4. `DataMasterPage()` - 52 edges
5. `UserManagementPage()` - 44 edges
6. `AppShell()` - 42 edges
7. `AuthError` - 40 edges
8. `UserAccessDialog()` - 39 edges
9. `MasterStorePanel()` - 37 edges
10. `AppEnv` - 35 edges

## Surprising Connections (you probably didn't know these)
- `Portal (sesi ini)` --references--> `getNavItems()`  [INFERRED]
  docs/plan/sisa-plan-sparta.md → apps/web/src/components/app-shell.tsx
- `Fase 3: master Toko` --references--> `now()`  [INFERRED]
  docs/plan/sisa-plan-sparta.md → apps/web/src/lib/dev-mock/mock-api.ts
- `Catatan keamanan yang belum dibereskan` --references--> `cn()`  [INFERRED]
  docs/plan/sisa-plan-sparta.md → apps/web/src/lib/utils.ts
- `Catatan keamanan yang belum dibereskan` --references--> `openSealedCredentials()`  [INFERRED]
  docs/plan/sisa-plan-sparta.md → apps/api/src/middleware/open-sealed-credentials.ts
- `Fase 3: master Toko` --references--> `StoreBrand`  [INFERRED]
  docs/plan/sisa-plan-sparta.md → apps/web/src/lib/sparta-master-admin.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Per-module SSO readiness checklists implementing the module SSO contract** — docs_integration_sparta_building_sso_checklist_building_sso_checklist, docs_integration_sparta_maintenance_sso_checklist_maintenance_sso_checklist, docs_integration_sparta_energy_sso_checklist_energy_sso_checklist, docs_integration_module_sso_contract_module_sso_contract [EXTRACTED 1.00]
- **SPARTA SSO launch-token exchange flow** — docs_integration_module_sso_contract_post_v1_modules_launch, docs_integration_module_sso_contract_launch_token, docs_integration_module_sso_contract_post_v1_sso_exchange, docs_integration_module_sso_contract_user_matching_order, docs_superpowers_plans_2026_06_17_sparta_backend_monorepo_spec_module_launch_model [EXTRACTED 1.00]
- **BRANCH_ADMIN Maintenance login block mechanism** — docs_superpowers_specs_2026_09_09_block_branch_admin_login_design_branch_admin_email_only_rule, docs_superpowers_plans_2026_09_09_block_branch_admin_login_mapuserrecord_filter, docs_superpowers_plans_2026_09_09_block_branch_admin_login_no_ui_access_error, docs_superpowers_plans_2026_06_17_sparta_backend_monorepo_spec_user_module_access_model [INFERRED 0.85]

## Communities (95 total, 13 thin omitted)

### Community 0 - "cn"
Cohesion: 0.08
Nodes (38): DOT_CLASS, StatusBadgeProps, StatusTone, AlertAction(), AlertDialogMedia(), AvatarBadge(), AvatarGroup(), AvatarGroupCount() (+30 more)

### Community 1 - "SPARTA Backend Monorepo Implementation Plan"
Cohesion: 0.21
Nodes (10): POST /v1/admin/users/sync-delete, GET /v1/master/branches and /v1/master/areas (updatedSince sync), Module SSO Contract, SPARTA Building SSO Checklist, SPARTA Energy SSO Checklist, SPARTA Maintenance SSO Checklist, Maintenance report/dashboard/PJUM authorization, Admin user and access management API (+2 more)

### Community 2 - "tentang-sparta-page.tsx"
Cohesion: 0.07
Nodes (46): AcronymFeatureCard(), AcronymFeatureCardProps, AcronymPart, AppPhoneMockup(), AppPhoneMockupProps, PhoneModule, ModuleExplorer(), ModuleExplorerProps (+38 more)

### Community 3 - "Initial Auth Migration"
Cohesion: 0.07
Nodes (49): "AppModule", AppModule_isActive_sortOrder_idx, "AuditEvent", AuditEvent_action_createdAt_idx, AuditEvent_actorUserId_createdAt_idx, AuditEvent_entityType_entityId_idx, "Branch", Branch_code_key (+41 more)

### Community 4 - "users.schemas.ts"
Cohesion: 0.14
Nodes (13): AccessUpdateInput, accessUpdateSchema, ChangeEmailInput, changeEmailSchema, CreateUserInput, createUserSchema, SyncDeleteUserInput, syncDeleteUserSchema (+5 more)

### Community 5 - "provisioning.test.ts"
Cohesion: 0.20
Nodes (8): ProvisioningRepository, signProvisioningBody(), verifyProvisioningSignature(), NOW, worker(), ProvisioningWorker, ProvisioningWorkerOptions, retryDelayMs()

### Community 6 - "AuthError"
Cohesion: 0.10
Nodes (26): loginRateLimit, moduleLaunchRateLimit, otpRequestRateLimit, otpVerifyRateLimit, requireAdmin(), requireRoles(), CurrentSpartaSession, Express (+18 more)

### Community 7 - "user-form-dialog.tsx"
Cohesion: 0.14
Nodes (50): ChangeEmailDialog(), ChangeEmailDialogProps, MODULE_NAMES, MasterAreaDialog(), MasterAreaDialogProps, errorMessage(), MasterBranchDialog(), MasterBranchDialogProps (+42 more)

### Community 8 - "data-master-page.tsx"
Cohesion: 0.12
Nodes (38): AppShell(), AppShellProps, getInitials(), getNavItems(), MasterStorePanel(), StatCard(), StatusBadge(), Alert() (+30 more)

### Community 9 - "API Dev Dependencies"
Cohesion: 0.10
Nodes (26): devDependencies, csv-parser@^3.2.1, tsx@^4.21.0, @types/cookie-parser@^1.4.10, @types/cors@^2.8.19, @types/express@^5.0.6, @types/node@^24.0.0, @types/nodemailer@^8.0.1 (+18 more)

### Community 10 - "Docker CI Workflow"
Cohesion: 0.08
Nodes (25): permissions, runs-on, steps, jobs, build, name, on, push (+17 more)

### Community 11 - "Web Dependencies"
Cohesion: 0.11
Nodes (19): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, input-otp@^1.4.2, lucide-react@^1.17.0, next-themes@^0.4.6, radix-ui@^1.5.0, react@^19.2.6 (+11 more)

### Community 12 - "modules.routes.ts"
Cohesion: 0.14
Nodes (14): mapModule(), ModuleRecord, ModuleRepository, PrismaModuleRepository, createModulesRouter(), invalidModule(), isModuleId(), ModulesRouterOptions (+6 more)

### Community 13 - "eslint.config.js"
Cohesion: 0.15
Nodes (12): eslint@^10, @eslint/js@^10, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17, typescript-eslint@^8, eslint, @eslint/js (+4 more)

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

### Community 18 - "app.ts"
Cohesion: 0.14
Nodes (17): AppOptions, createCorsOptions(), AppEnv, errorHandler(), notFoundHandler(), requestContext(), PasswordRouterOptions, PrismaSsoRepository (+9 more)

### Community 19 - "API TS Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+10 more)

### Community 20 - "web/package.json"
Cohesion: 0.18
Nodes (10): embla-carousel-react@^8.6.0, @fontsource-variable/geist@^5.2.9, @sparta/shared@workspace:*, @sparta/shared, name, private, type, version (+2 more)

### Community 21 - "Button"
Cohesion: 0.13
Nodes (44): ChangePasswordDialog(), ChangePasswordDialogProps, ChangePasswordStatus, ChangePasswordStep, StatCardProps, StatTone, TONE_CLASS, Button() (+36 more)

### Community 22 - "password.service.ts"
Cohesion: 0.13
Nodes (14): AuthUserRecord, OtpChallengeRecord, PasswordOtpPurpose, PasswordRepository, ChangePasswordConfirmInput, ForgotOtpRequestInput, ForgotOtpVerifyInput, ForgotPasswordResetInput (+6 more)

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

### Community 28 - "master-store-panel.tsx"
Cohesion: 0.15
Nodes (25): errorMessage(), LoadState, MasterStorePanelProps, ApiClientError, apiFetch(), getApiUrl(), addMasterBranchAlias(), BranchFormInput (+17 more)

### Community 30 - "module-launcher-page.tsx"
Cohesion: 0.13
Nodes (25): PortalBackdrop(), PortalBackdropProps, Item(), ItemActions(), ItemContent(), ItemDescription(), ItemFooter(), ItemGroup() (+17 more)

### Community 31 - "master.routes.ts"
Cohesion: 0.21
Nodes (6): requireInternalApiKey(), PrismaMasterRepository, createMasterRouter(), listQuerySchema, MasterRouterOptions, storeSyncQuerySchema

### Community 32 - "convert-branch-codes.ts"
Cohesion: 0.12
Nodes (14): dotenv@^17.2.3, prisma@^6.19.0, envPath, apply, args, convert(), env, isLocal (+6 more)

### Community 33 - "store.test.ts"
Cohesion: 0.09
Nodes (14): PrismaStore, StoreBrandRecord, StoreCounts, storeInclude, StoreRecord, StoreRepository, CreateStoreInput, createStoreSchema (+6 more)

### Community 34 - "AppEnv"
Cohesion: 0.10
Nodes (17): envSchema, loadEnv(), provisioningSecret, CreateOtpChallengeInput, UpdateOtpChallengeInput, createAppWithFakes(), createAuthenticatedAgent(), TestEmailProvider (+9 more)

### Community 35 - "createMasterAdminRouter"
Cohesion: 0.19
Nodes (12): actorId(), createMasterAdminRouter(), parseBody(), ListStoresQuery, SetBrandModulesInput, StoreService, toPrismaModule(), toPublicModule() (+4 more)

### Community 36 - "Shared Package Manifest"
Cohesion: 0.15
Nodes (13): devDependencies, typescript@~6, exports, ./api, ./sparta, ./validation, typescript, name (+5 more)

### Community 37 - "Render Deploy Config"
Cohesion: 0.15
Nodes (12): key, sync, value, services, buildCommand, envVars, name, preDeployCommand (+4 more)

### Community 38 - "Theme Provider"
Cohesion: 0.29
Nodes (7): applyLightTheme(), ThemeProvider(), ThemeProviderContext, ThemeProviderProps, ThemeProviderState, useTheme(), Toaster()

### Community 39 - "master-admin.routes.ts"
Cohesion: 0.15
Nodes (17): MasterAdminRouterOptions, addressSchema, createAliasSchema, createAreaSchema, createBranchSchema, masterCodeSchema, nameSchema, updateAreaSchema (+9 more)

### Community 40 - "API Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:seed, dev, dev:uat, lint, prisma, prisma:generate (+4 more)

### Community 41 - "public-auth-shell.tsx"
Cohesion: 0.11
Nodes (13): FasciaStripe(), FasciaStripeProps, Logo(), LogoProps, acronym, appOrder, AuthBackdrop(), PublicAuthShell() (+5 more)

### Community 42 - "master-admin.service.ts"
Cohesion: 0.14
Nodes (13): AdminAreaRecord, AdminBranchRecord, MasterAdminRepository, CreateAreaInput, CreateBranchInput, UpdateAreaInput, UpdateBranchInput, MasterAdminService (+5 more)

### Community 43 - "provisioning.repository.ts"
Cohesion: 0.18
Nodes (5): InMemoryProvisioningRepository, ModuleRoleRecord, NewProvisioningEvent, PrismaEvent, ProvisioningEventRecord

### Community 44 - "SpartaModuleId"
Cohesion: 0.23
Nodes (7): ProvisioningPublisher, ProvisioningService, ProvisioningServiceOptions, UserListRecord, SpartaModuleId, SpartaProvisioningEvent, SpartaProvisioningEventType

### Community 45 - "SpartaLaunchableModuleId"
Cohesion: 0.16
Nodes (7): UsersRepository, IDENTITY_FIELDS, UsersProvisioning, UsersService, UsersServiceCreateInput, UsersServiceUpdateInput, SpartaLaunchableModuleId

### Community 46 - "sparta.ts"
Cohesion: 0.12
Nodes (12): AdminUserDto, MasterBranchAliasDto, MasterStoreStatusFilter, ModuleRoleDto, ProvisioningEventDto, ProvisioningEventStatus, SPARTA_PROVISIONING_EVENT_TYPES, SPARTA_SSO_CONTRACT_VERSION (+4 more)

### Community 47 - "InMemoryMasterAdminRepository"
Cohesion: 0.12
Nodes (3): AreaPatch, BranchPatch, InMemoryMasterAdminRepository

### Community 48 - "sparta-auth.ts"
Cohesion: 0.13
Nodes (15): ChangeEmailResult, ChangePasswordWithOtpInput, devModuleLoginUrls, envModuleLoginUrls, getAccessibleApps(), LoginInput, LoginResult, mergeModule() (+7 more)

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

### Community 54 - "PrismaAuthRepository"
Cohesion: 0.20
Nodes (4): isLaunchableModule(), mapSessionRecord(), mapUserRecord(), PrismaAuthRepository

### Community 55 - "credential-sealer.test.ts"
Cohesion: 0.18
Nodes (12): openSealedCredentials(), SEALABLE_FIELDS, sealedSchema, CredentialSealer, CredentialSealError, getCredentialSealer(), SealedCredentials, echoApp() (+4 more)

### Community 56 - "Web TS Root Config"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 63 - "PrismaProvisioningRepository"
Cohesion: 0.19
Nodes (4): mapEvent(), PrismaProvisioningRepository, toPrismaModuleId(), toPublicModuleId()

### Community 64 - "user-management-page.tsx"
Cohesion: 0.08
Nodes (59): SPARTA_LAUNCHABLE_MODULE_IDS, SpartaUserStatus, describeAccess(), errorMessage(), isEnabled(), LoadState, PendingChange, StoreBrandAccess() (+51 more)

### Community 65 - "PrismaStoreRepository"
Cohesion: 0.18
Nodes (3): buildWhere(), mapStore(), PrismaStoreRepository

### Community 67 - "Sisa Plan SPARTA (diperbarui 2026-11-20)"
Cohesion: 0.14
Nodes (14): StoreBrand, Aturan kerja (berlaku untuk semua sesi), Fase 2 di modul (belum mulai), Fase 3: master Toko, Fase 4: master Fasilitas, Keputusan yang menunggu user, Langkah berikutnya: Fase 2B, Lingkungan dev (+6 more)

### Community 68 - "users.routes.ts"
Cohesion: 0.27
Nodes (11): requireUserAdmin(), scopeAllowsModule(), createServices(), createUsersRouter(), invalidPayload(), MODULE_ADMIN_EDITABLE, outOfScope(), parseBody() (+3 more)

### Community 69 - "import-users.ts"
Cohesion: 0.25
Nodes (5): CSV_FILE_PATH, CsvRow, env, prisma, csv-parser

### Community 70 - "password.routes.ts"
Cohesion: 0.32
Nodes (11): requireSession(), createFirstPasswordRouter(), createPasswordRouter(), createServices(), invalidPayload(), parseBody(), changePasswordConfirmSchema, forgotOtpRequestSchema (+3 more)

### Community 71 - "AuthRepository"
Cohesion: 0.06
Nodes (6): AuthRepository, CreateSessionInput, InMemoryAuthRepository, InMemoryAuthRepository, InMemoryAuthRepository, InMemoryAuthRepository

### Community 72 - "master.test.ts"
Cohesion: 0.29
Nodes (8): normalizeBranchAlias(), MasterAreaRecord, MasterBranchRecord, MasterListFilter, MasterRepository, createTestApp(), InMemoryMasterRepository, testEnv

### Community 73 - "App.tsx"
Cohesion: 0.32
Nodes (10): App(), loadSession(), getCurrentSpartaSession(), isSpartaSsoEnabled(), logoutFromSparta(), AppRoute, getCurrentRoute(), getDefaultRoute() (+2 more)

### Community 74 - "table-pagination.tsx"
Cohesion: 0.37
Nodes (11): pageNumbers(), TablePagination(), TablePaginationProps, Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem(), PaginationLink() (+3 more)

### Community 75 - "users.repository.ts"
Cohesion: 0.07
Nodes (27): prisma, { PrismaClient }, globalForPrisma, prisma, adminModulesOf(), adminRoleInclude, AuthAccessModuleId, LaunchablePrismaModuleId (+19 more)

### Community 76 - "createApp"
Cohesion: 0.07
Nodes (23): supertest@^7.1.4, createApp(), testEnv, AuthSessionRecord, testEnv, createAppWithFakes(), ModuleLaunchInput, ModuleRecord (+15 more)

### Community 77 - "ApiSuccess"
Cohesion: 0.20
Nodes (9): API_SHARED_MODULE_IDS, ApiSessionResponse, ApiError, ApiResult, ApiSuccess, SPARTA_MODULE_IDS, SpartaSessionDto, WEB_SHARED_MODULE_IDS (+1 more)

### Community 78 - "SPARTA Login Portal README"
Cohesion: 0.20
Nodes (12): apps/web index.html (SPARTA SPA entry), Frontend stack: React 19 + Vite 8 + TS 6 + Tailwind v4 + shadcn/ui, AppModule model (DB-configured callbackUrl), Deployment Architecture (Vercel Free + Render Standard), Deployment: Vercel (web) + Render (api), @sparta/api (apps/api Express backend), SPARTA Login Portal README, @sparta/web (apps/web) (+4 more)

### Community 79 - "storefront-elevation.tsx"
Cohesion: 0.26
Nodes (11): axes, Callout, callouts, circle(), delay(), line(), rect(), SketchAnimated (+3 more)

### Community 80 - "InMemoryUsersRepository"
Cohesion: 0.27
Nodes (3): CreateUserInput, UpdateUserInput, InMemoryUsersRepository

### Community 81 - "user-management.test.tsx"
Cohesion: 0.25
Nodes (9): react-dom@^19.2.6, handleDevMockRequest(), Body, call(), Body, call(), renderNav(), sessionWithRole() (+1 more)

### Community 82 - "portal-access.ts"
Cohesion: 0.33
Nodes (8): Express, forbidden(), Request, requireMasterRead(), requireMasterWrite(), sessionUser(), UserAdminScope, SPARTA_MASTER_DATA_ROLES

### Community 83 - "credential-seal.ts"
Cohesion: 0.39
Nodes (8): isDevMockEnabled(), CredentialKey, fetchKey(), fromBase64(), getKey(), postWithSealedSecrets(), seal(), toBase64()

### Community 85 - "Prisma Schema Draft"
Cohesion: 0.29
Nodes (8): Energy role mapping (AUDITOR, ENGINEER, MANAGER, USER), Maintenance role mapping (ADMIN, BMS, BMC, BNM, MANAGER, USER), AuditEvent model, OtpChallenge model, OTP password recovery and change (HMAC-hashed OTP), Prisma Schema Draft, User model, UserModuleAccess model (per-module role)

### Community 87 - "Checklist deploy portal SPARTA (disusun 2026-11-20)"
Cohesion: 0.25
Nodes (6): Checklist deploy portal SPARTA (disusun 2026-11-20), Setelah semua tahap, Tahap 0: Persiapan (sebelum hari H), Tahap 1: Deploy portal (aman untuk semua modul), Tahap 2: Provisioning Energy dan CarbonTrack, Tahap 3: PALING AKHIR, konversi kode cabang dan master toko

### Community 88 - "mapUserRecord filter excluding MAINTENANCE for BRANCH_ADMIN"
Cohesion: 0.48
Nodes (5): P0 Authentication Core, Block BRANCH_ADMIN Login Implementation Plan, mapUserRecord filter excluding MAINTENANCE for BRANCH_ADMIN, NO_UI_ACCESS 403 AuthError on empty access, Block BRANCH_ADMIN Login Design

### Community 89 - "POST /v1/sso/exchange"
Cohesion: 0.40
Nodes (6): One-time Launch Token (TTL 2 min), POST /v1/modules/:moduleId/launch, POST /v1/sso/exchange, SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH), SSO Launch-and-Exchange Flow, ModuleLaunch model (launchTokenHash, consumedAt)

### Community 90 - "store-floor-plan.tsx"
Cohesion: 0.40
Nodes (4): columnAxes, gondolas, rowAxes, StoreFloorPlanProps

### Community 92 - "SpartaSsoUserPayload (contract v2)"
Cohesion: 0.50
Nodes (4): POST /v1/admin/users/sync, SpartaSsoUserPayload (contract v2), Shared API contracts (SpartaModuleId, SpartaSessionDto, ApiSuccess/ApiError), @sparta/shared (apps/shared types & validation)

## Knowledge Gaps
- **11 isolated node(s):** `POST /v1/admin/users/sync-delete`, `GET /v1/master/branches and /v1/master/areas (updatedSince sync)`, `SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH)`, `Maintenance report/dashboard/PJUM authorization`, `Admin user and access management API` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 577 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Sisa Plan SPARTA (diperbarui 2026-11-20)` connect `Sisa Plan SPARTA (diperbarui 2026-11-20)` to `credential-sealer.test.ts`, `Checklist deploy portal SPARTA (disusun 2026-11-20)`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **What connects `POST /v1/admin/users/sync-delete`, `GET /v1/master/branches and /v1/master/areas (updatedSince sync)`, `SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH)` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.0797872340425532 - nodes in this community are weakly interconnected._
- **Why does `Catatan keamanan yang belum dibereskan` connect `credential-sealer.test.ts` to `cn`, `Sisa Plan SPARTA (diperbarui 2026-11-20)`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `tentang-sparta-page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06638714185883997 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `user-management-page.tsx`, `tentang-sparta-page.tsx`, `user-form-dialog.tsx`, `data-master-page.tsx`, `public-auth-shell.tsx`, `table-pagination.tsx`, `storefront-elevation.tsx`, `Button`, `credential-sealer.test.ts`, `store-floor-plan.tsx`, `module-launcher-page.tsx`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Should `Initial Auth Migration` be split into smaller, more focused modules?**
  _Cohesion score 0.06848357791754019 - nodes in this community are weakly interconnected._