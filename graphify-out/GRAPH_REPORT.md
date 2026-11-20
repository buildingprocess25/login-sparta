# Graph Report - login-sparta  (2026-11-20)

## Corpus Check
- 192 files · ~78,636 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 5, .example 2, .toml 1)

## Summary
- 1674 nodes · 4469 edges · 76 communities (63 shown, 13 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 73 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `97d18585`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- sparta-auth.ts
- SPARTA Backend Monorepo Implementation Plan
- tentang-sparta-page.tsx
- Initial Auth Migration
- app.ts
- users.schemas.ts
- master-admin.routes.ts
- user-form-dialog.tsx
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
- App.tsx
- PrismaMasterAdminRepository
- module-launcher-page.tsx
- StoreService
- Master Data Repository
- store.schemas.ts
- store.service.ts
- store.repository.ts
- Shared Package Manifest
- Render Deploy Config
- Theme Provider
- credential-seal.ts
- API Scripts
- user-management-page.tsx
- import-users.ts
- data-master-page.tsx
- validation.ts
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
- credential-sealer.test.ts
- Web TS Root Config
- UpdateStoreInput
- downloadCsv
- PrismaStoreRepository
- public-auth-shell.tsx
- src/shared-contract-check.ts
- table-pagination.tsx
- react
- user-management.test.tsx
- PrismaPasswordRepository
- prisma.config.ts
- AuthRepository
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

## Communities (76 total, 13 thin omitted)

### Community 0 - "sparta-auth.ts"
Cohesion: 0.12
Nodes (16): ChangeEmailResult, ChangePasswordWithOtpInput, devModuleLoginUrls, envModuleLoginUrls, getAccessibleApps(), LoginInput, LoginResult, mergeModule() (+8 more)

### Community 1 - "SPARTA Backend Monorepo Implementation Plan"
Cohesion: 0.06
Nodes (47): apps/web index.html (SPARTA SPA entry), Frontend stack: React 19 + Vite 8 + TS 6 + Tailwind v4 + shadcn/ui, POST /v1/admin/users/sync, POST /v1/admin/users/sync-delete, One-time Launch Token (TTL 2 min), GET /v1/master/branches and /v1/master/areas (updatedSince sync), Module SSO Contract, POST /v1/modules/:moduleId/launch (+39 more)

### Community 2 - "tentang-sparta-page.tsx"
Cohesion: 0.06
Nodes (46): AcronymFeatureCard(), AcronymFeatureCardProps, AcronymPart, AppPhoneMockup(), AppPhoneMockupProps, PhoneModule, ModuleExplorer(), ModuleExplorerProps (+38 more)

### Community 3 - "Initial Auth Migration"
Cohesion: 0.07
Nodes (49): "AppModule", AppModule_isActive_sortOrder_idx, "AuditEvent", AuditEvent_action_createdAt_idx, AuditEvent_actorUserId_createdAt_idx, AuditEvent_entityType_entityId_idx, "Branch", Branch_code_key (+41 more)

### Community 4 - "app.ts"
Cohesion: 0.06
Nodes (33): AppOptions, createApp(), testEnv, createCorsOptions(), envSchema, loadEnv(), provisioningSecret, errorHandler() (+25 more)

### Community 5 - "users.schemas.ts"
Cohesion: 0.12
Nodes (21): requireAdmin(), requireInternalApiKey(), createServices(), createUsersRouter(), invalidPayload(), parseBody(), AccessUpdateInput, accessUpdateSchema (+13 more)

### Community 6 - "master-admin.routes.ts"
Cohesion: 0.06
Nodes (42): loginRateLimit, moduleLaunchRateLimit, otpRequestRateLimit, otpVerifyRateLimit, CurrentSpartaSession, Express, Request, requireSession() (+34 more)

### Community 7 - "user-form-dialog.tsx"
Cohesion: 0.08
Nodes (56): SpartaPortalRole, SpartaUserStatus, errorMessage(), MasterBranchDialog(), MasterBranchDialogProps, errorMessage(), MasterStoreDialogProps, ModuleRoleSelect() (+48 more)

### Community 8 - "store.test.ts"
Cohesion: 0.11
Nodes (8): StoreCounts, CreateStoreInput, createStoreSchema, listStoresQuerySchema, BRANCHES, createTestApp(), InMemoryStoreRepository, testEnv

### Community 9 - "API Dev Dependencies"
Cohesion: 0.10
Nodes (26): devDependencies, supertest@^7.1.4, tsx@^4.21.0, @types/cookie-parser@^1.4.10, @types/cors@^2.8.19, @types/express@^5.0.6, @types/node@^24.0.0, @types/nodemailer@^8.0.1 (+18 more)

### Community 10 - "Docker CI Workflow"
Cohesion: 0.08
Nodes (25): permissions, runs-on, steps, jobs, build, name, on, push (+17 more)

### Community 11 - "Web Dependencies"
Cohesion: 0.08
Nodes (33): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cn@^0.5.2, embla-carousel-react@^8.6.0, @fontsource-variable/geist@^5.2.9, input-otp@^1.4.2, lucide-react@^1.17.0 (+25 more)

### Community 13 - "sparta-user-admin.ts"
Cohesion: 0.13
Nodes (14): AdminUserDto, MasterAreaAdminDto, MasterBranchAdminDto, MasterBranchAliasDto, MasterStoreStatusFilter, ModuleRoleDto, ProvisioningEventDto, ProvisioningEventStatus (+6 more)

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
Cohesion: 0.17
Nodes (12): mapLaunch(), mapUser(), PrismaSsoLaunch, PrismaSsoRepository, SsoLaunchRecord, SsoRepository, SsoUserRecord, createSsoRouter() (+4 more)

### Community 19 - "API TS Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+10 more)

### Community 20 - "cn"
Cohesion: 0.09
Nodes (43): AppShell(), AppShellProps, getInitials(), getNavItems(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent() (+35 more)

### Community 21 - "Button"
Cohesion: 0.14
Nodes (49): ChangeEmailDialog(), ChangeEmailDialogProps, MODULE_NAMES, ChangePasswordDialog(), ChangePasswordDialogProps, ChangePasswordStatus, ChangePasswordStep, MasterAreaDialog() (+41 more)

### Community 22 - "password.service.ts"
Cohesion: 0.07
Nodes (38): AppEnv, AuthUserRecord, CreateOtpChallengeInput, OtpChallengeRecord, PasswordOtpPurpose, PasswordOtpStatus, PasswordRepository, PrismaPasswordUser (+30 more)

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
Cohesion: 0.08
Nodes (27): devDependencies, eslint@^10, @eslint/js@^10, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17, prettier@^3.8.3, prettier-plugin-tailwindcss@^0.8.0 (+19 more)

### Community 28 - "App.tsx"
Cohesion: 0.32
Nodes (10): App(), loadSession(), getCurrentSpartaSession(), isSpartaSsoEnabled(), logoutFromSparta(), AppRoute, getCurrentRoute(), getDefaultRoute() (+2 more)

### Community 30 - "module-launcher-page.tsx"
Cohesion: 0.11
Nodes (23): Item(), ItemActions(), ItemContent(), ItemDescription(), ItemFooter(), ItemGroup(), ItemHeader(), ItemMedia() (+15 more)

### Community 31 - "StoreService"
Cohesion: 0.27
Nodes (5): createMasterRouter(), StoreRepository, SetBrandModulesInput, StoreService, toPrismaModule()

### Community 32 - "Master Data Repository"
Cohesion: 0.24
Nodes (8): MasterAreaRecord, MasterBranchRecord, MasterListFilter, MasterRepository, PrismaMasterRepository, createTestApp(), InMemoryMasterRepository, testEnv

### Community 33 - "store.schemas.ts"
Cohesion: 0.18
Nodes (10): listQuerySchema, MasterRouterOptions, branchCodeSchema, nameSchema, optionalText, setBrandModulesSchema, STORE_OWNERSHIP_TYPES, storeCodeSchema (+2 more)

### Community 34 - "store.service.ts"
Cohesion: 0.33
Nodes (6): ListStoresQuery, toPublicModule(), toStoreDto(), MasterStoreAdminDto, MasterStoreListMeta, StoreBrandAdminDto

### Community 35 - "store.repository.ts"
Cohesion: 0.18
Nodes (9): prisma, { PrismaClient }, globalForPrisma, prisma, PrismaStore, StoreBrandRecord, storeInclude, StoreRecord (+1 more)

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

### Community 41 - "user-management-page.tsx"
Cohesion: 0.14
Nodes (28): StatCard(), StatCardProps, StatTone, TONE_CLASS, Card(), CardContent(), CardDescription(), CardHeader() (+20 more)

### Community 42 - "import-users.ts"
Cohesion: 0.25
Nodes (5): csv-parser@^3.2.1, CSV_FILE_PATH, CsvRow, prisma, csv-parser

### Community 43 - "data-master-page.tsx"
Cohesion: 0.10
Nodes (56): SPARTA_LAUNCHABLE_MODULE_IDS, errorMessage(), LoadState, MasterStorePanel(), MasterStorePanelProps, StatusBadge(), describeAccess(), errorMessage() (+48 more)

### Community 45 - "users.service.ts"
Cohesion: 0.11
Nodes (12): publicModuleIdByPrismaId, CreateUserInput, PrismaUserRecord, UpdateUserInput, UsersRepository, IDENTITY_FIELDS, UsersProvisioning, UsersService (+4 more)

### Community 46 - "master-admin.service.ts"
Cohesion: 0.10
Nodes (29): requireRoles(), normalizeBranchAlias(), AdminAreaRecord, AdminBranchRecord, AreaPatch, BranchPatch, MasterAdminRepository, actorId() (+21 more)

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

### Community 65 - "PrismaStoreRepository"
Cohesion: 0.18
Nodes (3): buildWhere(), mapStore(), PrismaStoreRepository

### Community 67 - "public-auth-shell.tsx"
Cohesion: 0.14
Nodes (15): FasciaStripe(), FasciaStripeProps, Logo(), LogoProps, acronym, appOrder, AuthBackdrop(), PublicAuthShell() (+7 more)

### Community 68 - "src/shared-contract-check.ts"
Cohesion: 0.20
Nodes (9): API_SHARED_MODULE_IDS, ApiSessionResponse, ApiError, ApiResult, ApiSuccess, SPARTA_MODULE_IDS, SpartaSessionDto, WEB_SHARED_MODULE_IDS (+1 more)

### Community 70 - "table-pagination.tsx"
Cohesion: 0.37
Nodes (11): pageNumbers(), TablePagination(), TablePaginationProps, Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem(), PaginationLink() (+3 more)

### Community 71 - "react"
Cohesion: 0.12
Nodes (20): DOT_CLASS, StatusBadgeProps, StatusTone, badgeVariants, buttonVariants, FieldContent(), FieldLegend(), FieldSeparator() (+12 more)

### Community 74 - "user-management.test.tsx"
Cohesion: 0.31
Nodes (7): handleDevMockRequest(), Body, call(), Body, call(), renderNav(), sessionWithRole()

### Community 75 - "PrismaPasswordRepository"
Cohesion: 0.24
Nodes (3): mapOtpChallenge(), mapUserRecord(), PrismaPasswordRepository

### Community 76 - "prisma.config.ts"
Cohesion: 0.25
Nodes (5): dotenv@^17.2.3, prisma@^6.19.0, envPath, dotenv, prisma

### Community 78 - "AuthRepository"
Cohesion: 0.06
Nodes (7): AuthRepository, CreateSessionInput, InMemoryAuthRepository, InMemoryAuthRepository, InMemoryAuthRepository, InMemoryAuthRepository, sync()

## Knowledge Gaps
- **11 isolated node(s):** `POST /v1/admin/users/sync-delete`, `GET /v1/master/branches and /v1/master/areas (updatedSince sync)`, `SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH)`, `Maintenance report/dashboard/PJUM authorization`, `Admin user and access management API` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 556 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Catatan keamanan yang belum dibereskan` connect `credential-sealer.test.ts` to `cn`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **What connects `POST /v1/admin/users/sync-delete`, `GET /v1/master/branches and /v1/master/areas (updatedSince sync)`, `SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH)` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `sparta-auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Why does `Module SSO Contract` connect `SPARTA Backend Monorepo Implementation Plan` to `credential-sealer.test.ts`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `SPARTA Backend Monorepo Implementation Plan` be split into smaller, more focused modules?**
  _Cohesion score 0.05827067669172932 - nodes in this community are weakly interconnected._
- **Should `tentang-sparta-page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06464646464646465 - nodes in this community are weakly interconnected._
- **Should `Initial Auth Migration` be split into smaller, more focused modules?**
  _Cohesion score 0.06848357791754019 - nodes in this community are weakly interconnected._