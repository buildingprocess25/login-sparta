# Graph Report - login-sparta  (2026-11-19)

## Corpus Check
- 161 files · ~55,943 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 5, .example 2, .toml 1)

## Summary
- 1349 nodes · 3208 edges · 64 communities (54 shown, 10 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 53 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `77415147`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- forgot-password-page.tsx
- SPARTA Backend Monorepo Implementation Plan
- About Page Components
- Initial Auth Migration
- password.test.ts
- Admin Users API
- Rate Limit & Session Middleware
- Auth Records & Tests
- app.ts
- API Dev Dependencies
- Docker CI Workflow
- Web Dependencies
- Item UI Component
- sparta-master-admin.ts
- auth.repository.ts
- shadcn Config
- Web TS App Config
- API Runtime Dependencies
- SSO Repository
- API TS Config
- Web API Client & Auth
- In-Memory Auth Repo
- AuthError
- Web TS Node Config
- Root Workspace Package
- Antislop UI Rules
- Shared TS Config
- web/package.json
- Modules API
- public-auth-shell.tsx
- PrismaAuthRepository
- createMasterAdminRouter
- Master Data Repository
- SSO Routes & Schema
- master-branch-dialog.tsx
- Prisma Users Repository
- Shared Package Manifest
- Render Deploy Config
- Theme Provider
- App Routing & Session
- API Scripts
- In-Memory Users Repo
- password.routes.ts
- Database Seed
- InMemoryMasterAdminRepository
- sparta-auth.ts
- App.tsx
- storefront-elevation.tsx
- master-admin.service.ts
- master-admin.routes.ts
- Vite Config
- pnpm Workspace
- Legacy User Merge Script
- Web Scripts
- PrismaPasswordRepository
- sparta-assets.ts
- Web TS Root Config
- pg

## God Nodes (most connected - your core abstractions)
1. `cn()` - 144 edges
2. `react` - 43 edges
3. `Button()` - 40 edges
4. `AppShell()` - 38 edges
5. `AppEnv` - 34 edges
6. `AuthError` - 31 edges
7. `MasterBranchDialog()` - 30 edges
8. `DataMasterPage()` - 30 edges
9. `createApp()` - 28 edges
10. `ChangePasswordDialog()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `Prisma Schema Draft` --conceptually_related_to--> `Prisma database setup (generate, migrate, seed)`  [INFERRED]
  docs/superpowers/plans/2026-06-17-sparta-backend-monorepo-spec.md → SETUP_GUIDE.md
- `@sparta/shared (apps/shared types & validation)` --implements--> `Shared API contracts (SpartaModuleId, SpartaSessionDto, ApiSuccess/ApiError)`  [INFERRED]
  README.md → docs/superpowers/plans/2026-06-17-sparta-backend-monorepo-spec.md
- `SPARTA Energy SSO Checklist` --semantically_similar_to--> `Replace local login with redirect to SPARTA Login Portal`  [INFERRED] [semantically similar]
  docs/integration/sparta-energy-sso-checklist.md → docs/integration/sparta-building-sso-checklist.md
- `antislop Skill (Anti-slop UI filter)` --conceptually_related_to--> `AI Coding Rules (AI_RULES.md)`  [INFERRED]
  .claude/skills/antislop/SKILL.md → AI_RULES.md
- `apps/web index.html (SPARTA SPA entry)` --shares_data_with--> `AppModule model (DB-configured callbackUrl)`  [INFERRED]
  apps/web/index.html → docs/superpowers/plans/2026-06-17-sparta-backend-monorepo-spec.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Per-module SSO readiness checklists implementing the module SSO contract** — docs_integration_sparta_building_sso_checklist_building_sso_checklist, docs_integration_sparta_maintenance_sso_checklist_maintenance_sso_checklist, docs_integration_sparta_energy_sso_checklist_energy_sso_checklist, docs_integration_module_sso_contract_module_sso_contract [EXTRACTED 1.00]
- **SPARTA SSO launch-token exchange flow** — docs_integration_module_sso_contract_post_v1_modules_launch, docs_integration_module_sso_contract_launch_token, docs_integration_module_sso_contract_post_v1_sso_exchange, docs_integration_module_sso_contract_user_matching_order, docs_superpowers_plans_2026_06_17_sparta_backend_monorepo_spec_module_launch_model [EXTRACTED 1.00]
- **BRANCH_ADMIN Maintenance login block mechanism** — docs_superpowers_specs_2026_09_09_block_branch_admin_login_design_branch_admin_email_only_rule, docs_superpowers_plans_2026_09_09_block_branch_admin_login_mapuserrecord_filter, docs_superpowers_plans_2026_09_09_block_branch_admin_login_no_ui_access_error, docs_superpowers_plans_2026_06_17_sparta_backend_monorepo_spec_user_module_access_model [INFERRED 0.85]

## Communities (64 total, 10 thin omitted)

### Community 0 - "forgot-password-page.tsx"
Cohesion: 0.14
Nodes (41): ChangePasswordDialog(), ChangePasswordDialogProps, ChangePasswordStatus, ChangePasswordStep, Card(), CardContent(), CardDescription(), CardHeader() (+33 more)

### Community 1 - "SPARTA Backend Monorepo Implementation Plan"
Cohesion: 0.06
Nodes (47): apps/web index.html (SPARTA SPA entry), Frontend stack: React 19 + Vite 8 + TS 6 + Tailwind v4 + shadcn/ui, POST /v1/admin/users/sync, POST /v1/admin/users/sync-delete, One-time Launch Token (TTL 2 min), GET /v1/master/branches and /v1/master/areas (updatedSince sync), Module SSO Contract, POST /v1/modules/:moduleId/launch (+39 more)

### Community 2 - "About Page Components"
Cohesion: 0.07
Nodes (44): AcronymFeatureCard(), AcronymFeatureCardProps, AcronymPart, AppPhoneMockup(), AppPhoneMockupProps, PhoneModule, ModuleExplorer(), ModuleExplorerProps (+36 more)

### Community 3 - "Initial Auth Migration"
Cohesion: 0.09
Nodes (37): "AppModule", AppModule_isActive_sortOrder_idx, "AuditEvent", AuditEvent_action_createdAt_idx, AuditEvent_actorUserId_createdAt_idx, AuditEvent_entityType_entityId_idx, "Branch", Branch_code_key (+29 more)

### Community 4 - "password.test.ts"
Cohesion: 0.10
Nodes (13): CreateOtpChallengeInput, UpdateOtpChallengeInput, createAppWithFakes(), createAuthenticatedAgent(), InMemoryPasswordRepository, TestEmailProvider, testEnv, ConsoleEmailProvider (+5 more)

### Community 5 - "Admin Users API"
Cohesion: 0.13
Nodes (19): requireAdmin(), createServices(), createUsersRouter(), invalidPayload(), parseBody(), UsersRouterOptions, AccessUpdateInput, accessUpdateSchema (+11 more)

### Community 6 - "Rate Limit & Session Middleware"
Cohesion: 0.14
Nodes (18): loginRateLimit, CurrentSpartaSession, Express, Request, AuthRepository, AuthRouterOptions, cookieOptions(), createAuthRouter() (+10 more)

### Community 7 - "Auth Records & Tests"
Cohesion: 0.09
Nodes (41): AppShell(), AppShellProps, getInitials(), Logo(), LogoProps, AlertAction(), AlertDialog(), AlertDialogAction() (+33 more)

### Community 8 - "app.ts"
Cohesion: 0.06
Nodes (35): dotenv@^17.2.3, supertest@^7.1.4, envPath, AppOptions, createApp(), testEnv, createCorsOptions(), envSchema (+27 more)

### Community 9 - "API Dev Dependencies"
Cohesion: 0.09
Nodes (29): devDependencies, csv-parser@^3.2.1, prisma@^6.19.0, tsx@^4.21.0, @types/cookie-parser@^1.4.10, @types/cors@^2.8.19, @types/express@^5.0.6, @types/node@^24.0.0 (+21 more)

### Community 10 - "Docker CI Workflow"
Cohesion: 0.08
Nodes (25): permissions, runs-on, steps, jobs, build, name, on, push (+17 more)

### Community 11 - "Web Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cn@^0.5.2, embla-carousel-react@^8.6.0, @fontsource-variable/geist@^5.2.9, input-otp@^1.4.2, lucide-react@^1.17.0 (+17 more)

### Community 12 - "Item UI Component"
Cohesion: 0.16
Nodes (22): Item(), ItemActions(), ItemContent(), ItemDescription(), ItemFooter(), ItemGroup(), ItemHeader(), ItemMedia() (+14 more)

### Community 13 - "sparta-master-admin.ts"
Cohesion: 0.06
Nodes (49): API_SHARED_MODULE_IDS, ApiSessionResponse, ApiError, ApiResult, ApiSuccess, MasterAreaAdminDto, MasterBranchAdminDto, MasterBranchAliasDto (+41 more)

### Community 14 - "auth.repository.ts"
Cohesion: 0.11
Nodes (22): globalForPrisma, prisma, AuthAccessModuleId, LaunchablePrismaModuleId, moduleIdMap, PrismaAuthSession, PrismaAuthUser, CreateAuditEventInput (+14 more)

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
Cohesion: 0.20
Nodes (11): AppEnv, PrismaSsoRepository, SsoRepository, createSsoRouter(), invalidPayload(), SsoRouterOptions, SsoExchangeInput, ssoExchangeSchema (+3 more)

### Community 19 - "API TS Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+10 more)

### Community 21 - "In-Memory Auth Repo"
Cohesion: 0.05
Nodes (9): prisma, { PrismaClient }, CreateSessionInput, InMemoryAuthRepository, InMemoryAuthRepository, InMemoryModuleRepository, InMemoryAuthRepository, InMemoryAuthRepository (+1 more)

### Community 22 - "AuthError"
Cohesion: 0.17
Nodes (14): AuthUserRecord, AuthError, OtpChallengeRecord, PasswordOtpPurpose, PasswordRepository, ChangePasswordConfirmInput, ForgotOtpRequestInput, ForgotOtpVerifyInput (+6 more)

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
Nodes (33): tailwind-merge@^3.6.0, devDependencies, eslint@^10, @eslint/js@^10, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17, prettier@^3.8.3 (+25 more)

### Community 28 - "Modules API"
Cohesion: 0.12
Nodes (16): moduleLaunchRateLimit, otpRequestRateLimit, otpVerifyRateLimit, mapModule(), ModuleRecord, ModuleRepository, PrismaModuleRepository, createModulesRouter() (+8 more)

### Community 29 - "public-auth-shell.tsx"
Cohesion: 0.17
Nodes (13): FasciaStripe(), FasciaStripeProps, acronym, appOrder, AuthBackdrop(), PublicAuthShell(), PublicAuthShellProps, usePanelThemeColor() (+5 more)

### Community 30 - "PrismaAuthRepository"
Cohesion: 0.20
Nodes (4): isLaunchableModule(), mapSessionRecord(), mapUserRecord(), PrismaAuthRepository

### Community 31 - "createMasterAdminRouter"
Cohesion: 0.14
Nodes (12): normalizeBranchAlias(), actorId(), createMasterAdminRouter(), parseBody(), CreateAreaInput, CreateBranchInput, UpdateAreaInput, UpdateBranchInput (+4 more)

### Community 32 - "Master Data Repository"
Cohesion: 0.24
Nodes (8): MasterAreaRecord, MasterBranchRecord, MasterListFilter, MasterRepository, PrismaMasterRepository, createTestApp(), InMemoryMasterRepository, testEnv

### Community 33 - "SSO Routes & Schema"
Cohesion: 0.18
Nodes (22): Alert(), AlertDescription(), AlertTitle(), alertVariants, Badge(), Table(), TableBody(), TableCell() (+14 more)

### Community 34 - "master-branch-dialog.tsx"
Cohesion: 0.15
Nodes (36): ChangeEmailDialog(), ChangeEmailDialogProps, MODULE_NAMES, MasterAreaDialog(), MasterAreaDialogProps, errorMessage(), MasterBranchDialog(), MasterBranchDialogProps (+28 more)

### Community 36 - "Shared Package Manifest"
Cohesion: 0.15
Nodes (13): devDependencies, typescript@~6, exports, ./api, ./sparta, ./validation, typescript, name (+5 more)

### Community 37 - "Render Deploy Config"
Cohesion: 0.15
Nodes (12): key, sync, value, services, buildCommand, envVars, name, preDeployCommand (+4 more)

### Community 38 - "Theme Provider"
Cohesion: 0.23
Nodes (9): react-dom@^19.2.6, applyLightTheme(), ThemeProvider(), ThemeProviderContext, ThemeProviderProps, ThemeProviderState, useTheme(), Toaster() (+1 more)

### Community 39 - "App Routing & Session"
Cohesion: 0.11
Nodes (21): ScribbleUnderline(), ScribbleUnderlineProps, badgeVariants, buttonVariants, FieldContent(), FieldLegend(), FieldSeparator(), FieldSet() (+13 more)

### Community 40 - "API Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:seed, dev, dev:uat, lint, prisma, prisma:generate (+4 more)

### Community 41 - "In-Memory Users Repo"
Cohesion: 0.10
Nodes (12): CreateUserInput, UpdateUserInput, UsersRepository, UsersService, UsersServiceCreateInput, UsersServiceUpdateInput, createAppWithFakes(), InMemoryUsersRepository (+4 more)

### Community 42 - "password.routes.ts"
Cohesion: 0.27
Nodes (13): requireSession(), createFirstPasswordRouter(), createPasswordRouter(), createServices(), invalidPayload(), parseBody(), PasswordRouterOptions, changePasswordConfirmSchema (+5 more)

### Community 43 - "Database Seed"
Cohesion: 0.24
Nodes (10): branchSeeds, env, legacySeedEmails, main(), moduleSeeds, prisma, seedBranches(), seedModules() (+2 more)

### Community 45 - "sparta-auth.ts"
Cohesion: 0.15
Nodes (13): ChangeEmailResult, ChangePasswordWithOtpInput, defaultModuleLoginUrls, getAccessibleApps(), LoginInput, LoginResult, mergeModule(), ModulesResponse (+5 more)

### Community 46 - "App.tsx"
Cohesion: 0.32
Nodes (10): App(), loadSession(), getCurrentSpartaSession(), isSpartaSsoEnabled(), logoutFromSparta(), AppRoute, getCurrentRoute(), getDefaultRoute() (+2 more)

### Community 47 - "storefront-elevation.tsx"
Cohesion: 0.26
Nodes (11): axes, Callout, callouts, circle(), delay(), line(), rect(), SketchAnimated (+3 more)

### Community 48 - "master-admin.service.ts"
Cohesion: 0.36
Nodes (8): requireRoles(), AdminAreaRecord, AdminBranchRecord, AreaPatch, BranchPatch, MasterAdminRepository, run(), testEnv

### Community 49 - "master-admin.routes.ts"
Cohesion: 0.27
Nodes (9): MasterAdminRouterOptions, addressSchema, createAliasSchema, createAreaSchema, createBranchSchema, masterCodeSchema, nameSchema, updateAreaSchema (+1 more)

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

### Community 56 - "Web TS Root Config"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 63 - "pg"
Cohesion: 0.33
Nodes (4): pg@^8.23.0, c, { Client }, pg

## Knowledge Gaps
- **11 isolated node(s):** `POST /v1/admin/users/sync-delete`, `GET /v1/master/branches and /v1/master/areas (updatedSince sync)`, `SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH)`, `Maintenance report/dashboard/PJUM authorization`, `Admin user and access management API` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 454 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SpartaLaunchableModuleId` connect `In-Memory Users Repo` to `Prisma Users Repository`, `app.ts`, `sparta-master-admin.ts`, `auth.repository.ts`, `sparta-auth.ts`, `Modules API`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **What connects `POST /v1/admin/users/sync-delete`, `GET /v1/master/branches and /v1/master/areas (updatedSince sync)`, `SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH)` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `forgot-password-page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1374113475177305 - nodes in this community are weakly interconnected._
- **Why does `@prisma/client` connect `auth.repository.ts` to `Master Data Repository`, `API Dev Dependencies`, `Database Seed`, `master-admin.service.ts`, `API Runtime Dependencies`, `Vite Config`, `Legacy User Merge Script`, `In-Memory Auth Repo`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `SPARTA Backend Monorepo Implementation Plan` be split into smaller, more focused modules?**
  _Cohesion score 0.05827067669172932 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App Routing & Session` to `forgot-password-page.tsx`, `SSO Routes & Schema`, `About Page Components`, `master-branch-dialog.tsx`, `Theme Provider`, `Auth Records & Tests`, `Web Dependencies`, `Item UI Component`, `App.tsx`, `storefront-elevation.tsx`, `web/package.json`, `public-auth-shell.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Should `About Page Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06862745098039216 - nodes in this community are weakly interconnected._