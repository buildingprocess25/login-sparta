# Graph Report - login-sparta  (2026-11-20)

## Corpus Check
- 193 files · ~79,300 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 5, .example 2, .toml 1)

## Summary
- 1677 nodes · 4478 edges · 82 communities (62 shown, 20 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 73 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dea927ed`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.ts
- SPARTA Backend Monorepo Implementation Plan
- tentang-sparta-page.tsx
- Initial Auth Migration
- app.ts
- users.schemas.ts
- auth.service.ts
- master-store-panel.tsx
- store.test.ts
- API Dev Dependencies
- Docker CI Workflow
- Web Dependencies
- PrismaUsersRepository
- sparta-user-admin.ts
- mock-api.ts
- shadcn Config
- Web TS App Config
- API Runtime Dependencies
- sso.repository.ts
- API TS Config
- cn
- Button
- password.service.ts
- Web TS Node Config
- Root Workspace Package
- Antislop UI Rules
- Shared TS Config
- web/package.json
- password.routes.ts
- PrismaMasterAdminRepository
- module-launcher-page.tsx
- StoreService
- Master Data Repository
- store.schemas.ts
- AppEnv
- store.repository.ts
- Shared Package Manifest
- Render Deploy Config
- Theme Provider
- credential-seal.ts
- API Scripts
- public-auth-shell.tsx
- import-users.ts
- app-shell.tsx
- validation.ts
- users.service.ts
- master-admin.service.ts
- InMemoryMasterAdminRepository
- provisioning.repository.ts
- seed.ts
- Vite Config
- pnpm Workspace
- Legacy User Merge Script
- Web Scripts
- PrismaAuthRepository
- credential-sealer.test.ts
- Web TS Root Config
- sparta-auth.ts
- user-management-page.tsx
- PrismaStoreRepository
- App.tsx
- storefront-elevation.tsx
- src/shared-contract-check.ts
- InMemoryUsersRepository
- table-pagination.tsx
- sparta-assets.ts
- InMemoryAuthRepository
- InMemoryAuthRepository
- user-management.test.tsx
- PrismaPasswordRepository
- prisma.config.ts
- @prisma/client
- InMemoryAuthRepository
- CreateStoreInput
- InMemoryModuleRepository
- 20261120030225_add_store_brand_modules/migration.sql

## God Nodes (most connected - your core abstractions)
1. `cn()` - 151 edges
2. `Button()` - 54 edges
3. `react` - 52 edges
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

## Communities (82 total, 20 thin omitted)

### Community 0 - "app.ts"
Cohesion: 0.13
Nodes (20): AppOptions, createCorsOptions(), errorHandler(), notFoundHandler(), requestContext(), requireAdmin(), requireInternalApiKey(), AuthRouterOptions (+12 more)

### Community 1 - "SPARTA Backend Monorepo Implementation Plan"
Cohesion: 0.06
Nodes (47): apps/web index.html (SPARTA SPA entry), Frontend stack: React 19 + Vite 8 + TS 6 + Tailwind v4 + shadcn/ui, POST /v1/admin/users/sync, POST /v1/admin/users/sync-delete, One-time Launch Token (TTL 2 min), GET /v1/master/branches and /v1/master/areas (updatedSince sync), Module SSO Contract, POST /v1/modules/:moduleId/launch (+39 more)

### Community 2 - "tentang-sparta-page.tsx"
Cohesion: 0.07
Nodes (44): AcronymFeatureCard(), AcronymFeatureCardProps, AcronymPart, AppPhoneMockup(), AppPhoneMockupProps, PhoneModule, ModuleExplorer(), ModuleExplorerProps (+36 more)

### Community 3 - "Initial Auth Migration"
Cohesion: 0.07
Nodes (49): "AppModule", AppModule_isActive_sortOrder_idx, "AuditEvent", AuditEvent_action_createdAt_idx, AuditEvent_actorUserId_createdAt_idx, AuditEvent_entityType_entityId_idx, "Branch", Branch_code_key (+41 more)

### Community 4 - "app.ts"
Cohesion: 0.07
Nodes (23): createApp(), testEnv, AuthRepository, AuthSessionRecord, CreateSessionInput, testEnv, createAppWithFakes(), ModuleLaunchInput (+15 more)

### Community 5 - "users.schemas.ts"
Cohesion: 0.14
Nodes (13): AccessUpdateInput, accessUpdateSchema, ChangeEmailInput, changeEmailSchema, CreateUserInput, createUserSchema, SyncDeleteUserInput, syncDeleteUserSchema (+5 more)

### Community 6 - "auth.service.ts"
Cohesion: 0.12
Nodes (27): AppEnv, CurrentSpartaSession, Express, Request, requireSession(), cookieOptions(), createAuthRouter(), LoginInput (+19 more)

### Community 7 - "master-store-panel.tsx"
Cohesion: 0.09
Nodes (69): MasterAreaDialog(), MasterAreaDialogProps, errorMessage(), MasterBranchDialog(), MasterBranchDialogProps, errorMessage(), MasterStoreDialog(), MasterStoreDialogProps (+61 more)

### Community 9 - "API Dev Dependencies"
Cohesion: 0.10
Nodes (26): devDependencies, supertest@^7.1.4, tsx@^4.21.0, @types/cookie-parser@^1.4.10, @types/cors@^2.8.19, @types/express@^5.0.6, @types/node@^24.0.0, @types/nodemailer@^8.0.1 (+18 more)

### Community 10 - "Docker CI Workflow"
Cohesion: 0.08
Nodes (25): permissions, runs-on, steps, jobs, build, name, on, push (+17 more)

### Community 11 - "Web Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, embla-carousel-react@^8.6.0, @fontsource-variable/geist@^5.2.9, input-otp@^1.4.2, lucide-react@^1.17.0, next-themes@^0.4.6 (+17 more)

### Community 13 - "sparta-user-admin.ts"
Cohesion: 0.13
Nodes (14): MasterAreaAdminDto, MasterBranchAdminDto, MasterBranchAliasDto, MasterStoreStatusFilter, ModuleRoleDto, ProvisioningEventDto, ProvisioningEventStatus, SPARTA_MASTER_DATA_ROLES (+6 more)

### Community 14 - "mock-api.ts"
Cohesion: 0.16
Nodes (25): areas, branches, devRole, events, fail(), handleDevMockRequest(), handleMaster(), handleStoreBrands() (+17 more)

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
Cohesion: 0.17
Nodes (13): mapLaunch(), mapUser(), PrismaSsoLaunch, PrismaSsoRepository, SsoLaunchRecord, SsoRepository, createSsoRouter(), invalidPayload() (+5 more)

### Community 19 - "API TS Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+10 more)

### Community 20 - "cn"
Cohesion: 0.08
Nodes (35): PortalBackdropProps, ScribbleUnderline(), ScribbleUnderlineProps, AlertAction(), AlertDialogMedia(), Avatar(), AvatarBadge(), AvatarFallback() (+27 more)

### Community 21 - "Button"
Cohesion: 0.12
Nodes (55): ChangeEmailDialog(), ChangeEmailDialogProps, MODULE_NAMES, ChangePasswordDialog(), ChangePasswordDialogProps, ChangePasswordStatus, ChangePasswordStep, StatCardProps (+47 more)

### Community 22 - "password.service.ts"
Cohesion: 0.10
Nodes (20): AuthUserRecord, AuthError, CreateOtpChallengeInput, OtpChallengeRecord, PasswordOtpPurpose, PasswordOtpStatus, PasswordRepository, PrismaPasswordUser (+12 more)

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

### Community 28 - "password.routes.ts"
Cohesion: 0.20
Nodes (15): loginRateLimit, moduleLaunchRateLimit, otpRequestRateLimit, otpVerifyRateLimit, createFirstPasswordRouter(), createPasswordRouter(), createServices(), invalidPayload() (+7 more)

### Community 30 - "module-launcher-page.tsx"
Cohesion: 0.15
Nodes (23): PortalBackdrop(), Item(), ItemActions(), ItemContent(), ItemDescription(), ItemFooter(), ItemGroup(), ItemHeader() (+15 more)

### Community 31 - "StoreService"
Cohesion: 0.19
Nodes (9): StoreRepository, SetBrandModulesInput, StoreService, toPrismaModule(), toPublicModule(), toStoreDto(), MasterStoreAdminDto, MasterStoreListMeta (+1 more)

### Community 32 - "Master Data Repository"
Cohesion: 0.24
Nodes (8): MasterAreaRecord, MasterBranchRecord, MasterListFilter, MasterRepository, PrismaMasterRepository, createTestApp(), InMemoryMasterRepository, testEnv

### Community 33 - "store.schemas.ts"
Cohesion: 0.15
Nodes (13): branchCodeSchema, createStoreSchema, listStoresQuerySchema, nameSchema, optionalText, setBrandModulesSchema, STORE_OWNERSHIP_TYPES, storeCodeSchema (+5 more)

### Community 34 - "AppEnv"
Cohesion: 0.12
Nodes (15): envSchema, loadEnv(), provisioningSecret, createAppWithFakes(), createAuthenticatedAgent(), TestEmailProvider, testEnv, app (+7 more)

### Community 35 - "store.repository.ts"
Cohesion: 0.22
Nodes (7): buildWhere(), mapStore(), PrismaStore, StoreBrandRecord, storeInclude, StoreRecord, ListStoresQuery

### Community 36 - "Shared Package Manifest"
Cohesion: 0.15
Nodes (13): devDependencies, typescript@~6, exports, ./api, ./sparta, ./validation, typescript, name (+5 more)

### Community 37 - "Render Deploy Config"
Cohesion: 0.15
Nodes (12): key, sync, value, services, buildCommand, envVars, name, preDeployCommand (+4 more)

### Community 38 - "Theme Provider"
Cohesion: 0.29
Nodes (7): applyLightTheme(), ThemeProvider(), ThemeProviderContext, ThemeProviderProps, ThemeProviderState, useTheme(), Toaster()

### Community 39 - "credential-seal.ts"
Cohesion: 0.39
Nodes (8): isDevMockEnabled(), CredentialKey, fetchKey(), fromBase64(), getKey(), postWithSealedSecrets(), seal(), toBase64()

### Community 40 - "API Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:seed, dev, dev:uat, lint, prisma, prisma:generate (+4 more)

### Community 41 - "public-auth-shell.tsx"
Cohesion: 0.17
Nodes (13): FasciaStripe(), FasciaStripeProps, acronym, appOrder, AuthBackdrop(), PublicAuthShell(), PublicAuthShellProps, usePanelThemeColor() (+5 more)

### Community 42 - "import-users.ts"
Cohesion: 0.25
Nodes (5): csv-parser@^3.2.1, CSV_FILE_PATH, CsvRow, prisma, csv-parser

### Community 43 - "app-shell.tsx"
Cohesion: 0.14
Nodes (27): AppShell(), AppShellProps, getInitials(), getNavItems(), Logo(), LogoProps, describeAccess(), errorMessage() (+19 more)

### Community 45 - "users.service.ts"
Cohesion: 0.08
Nodes (20): globalForPrisma, prisma, CreateAuditEventInput, CreateModuleLaunchInput, mapModule(), ModuleLaunchRecord, ModuleRecord, prismaModuleIdByPublicId (+12 more)

### Community 46 - "master-admin.service.ts"
Cohesion: 0.09
Nodes (29): requireRoles(), normalizeBranchAlias(), AdminAreaRecord, AdminBranchRecord, AreaPatch, BranchPatch, MasterAdminRepository, actorId() (+21 more)

### Community 48 - "provisioning.repository.ts"
Cohesion: 0.06
Nodes (24): InMemoryProvisioningRepository, mapEvent(), ModuleRoleRecord, NewProvisioningEvent, PrismaEvent, PrismaProvisioningRepository, ProvisioningEventRecord, ProvisioningRepository (+16 more)

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
Cohesion: 0.14
Nodes (9): AuthAccessModuleId, isLaunchableModule(), LaunchablePrismaModuleId, mapSessionRecord(), mapUserRecord(), moduleIdMap, PrismaAuthRepository, PrismaAuthSession (+1 more)

### Community 55 - "credential-sealer.test.ts"
Cohesion: 0.08
Nodes (26): openSealedCredentials(), SEALABLE_FIELDS, sealedSchema, CredentialSealer, CredentialSealError, getCredentialSealer(), SealedCredentials, echoApp() (+18 more)

### Community 56 - "Web TS Root Config"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 63 - "sparta-auth.ts"
Cohesion: 0.13
Nodes (15): ChangeEmailResult, ChangePasswordWithOtpInput, devModuleLoginUrls, envModuleLoginUrls, getAccessibleApps(), LoginInput, LoginResult, mergeModule() (+7 more)

### Community 64 - "user-management-page.tsx"
Cohesion: 0.07
Nodes (74): AdminUserDto, SPARTA_LAUNCHABLE_MODULE_IDS, SpartaPortalRole, MasterStorePanel(), StatCard(), DOT_CLASS, StatusBadge(), StatusBadgeProps (+66 more)

### Community 66 - "App.tsx"
Cohesion: 0.35
Nodes (9): App(), loadSession(), getCurrentSpartaSession(), logoutFromSparta(), AppRoute, getCurrentRoute(), getDefaultRoute(), navigateTo() (+1 more)

### Community 67 - "storefront-elevation.tsx"
Cohesion: 0.26
Nodes (11): axes, Callout, callouts, circle(), delay(), line(), rect(), SketchAnimated (+3 more)

### Community 68 - "src/shared-contract-check.ts"
Cohesion: 0.20
Nodes (9): API_SHARED_MODULE_IDS, ApiSessionResponse, ApiError, ApiResult, ApiSuccess, SPARTA_MODULE_IDS, SpartaSessionDto, WEB_SHARED_MODULE_IDS (+1 more)

### Community 70 - "table-pagination.tsx"
Cohesion: 0.30
Nodes (13): cn@^0.5.2, pageNumbers(), TablePagination(), TablePaginationProps, Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem() (+5 more)

### Community 74 - "user-management.test.tsx"
Cohesion: 0.22
Nodes (8): react-dom@^19.2.6, Body, call(), Body, call(), renderNav(), sessionWithRole(), react-dom

### Community 75 - "PrismaPasswordRepository"
Cohesion: 0.24
Nodes (3): mapOtpChallenge(), mapUserRecord(), PrismaPasswordRepository

### Community 76 - "prisma.config.ts"
Cohesion: 0.25
Nodes (5): dotenv@^17.2.3, prisma@^6.19.0, envPath, dotenv, prisma

### Community 77 - "@prisma/client"
Cohesion: 0.40
Nodes (3): prisma, { PrismaClient }, @prisma/client

## Knowledge Gaps
- **11 isolated node(s):** `POST /v1/admin/users/sync-delete`, `GET /v1/master/branches and /v1/master/areas (updatedSince sync)`, `SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH)`, `Maintenance report/dashboard/PJUM authorization`, `Admin user and access management API` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 557 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Catatan keamanan yang belum dibereskan` connect `credential-sealer.test.ts` to `cn`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **What connects `POST /v1/admin/users/sync-delete`, `GET /v1/master/branches and /v1/master/areas (updatedSince sync)`, `SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH)` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12643678160919541 - nodes in this community are weakly interconnected._
- **Why does `Module SSO Contract` connect `SPARTA Backend Monorepo Implementation Plan` to `credential-sealer.test.ts`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Should `SPARTA Backend Monorepo Implementation Plan` be split into smaller, more focused modules?**
  _Cohesion score 0.05827067669172932 - nodes in this community are weakly interconnected._
- **Should `tentang-sparta-page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06862745098039216 - nodes in this community are weakly interconnected._
- **Should `Initial Auth Migration` be split into smaller, more focused modules?**
  _Cohesion score 0.06848357791754019 - nodes in this community are weakly interconnected._