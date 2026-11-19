# Graph Report - login-sparta  (2026-11-19)

## Corpus Check
- 160 files · ~54,779 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 5, .example 2, .toml 1)

## Summary
- 1335 nodes · 3179 edges · 63 communities (51 shown, 12 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 53 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `77415147`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Web App Shell & Assets
- SSO Contract & Docs
- About Page Components
- Initial Auth Migration
- Password OTP Tests
- Admin Users API
- Rate Limit & Session Middleware
- Auth Records & Tests
- App Bootstrap & Config
- API Dev Dependencies
- Docker CI Workflow
- Web Dependencies
- Item UI Component
- Shared API Contract
- Prisma Client & Branch Alias
- shadcn Config
- Web TS App Config
- API Runtime Dependencies
- SSO Repository
- API TS Config
- Web API Client & Auth
- In-Memory Auth Repo
- Lint & Format Tooling
- Web TS Node Config
- Root Workspace Package
- Antislop UI Rules
- Shared TS Config
- Web Package Manifest
- Modules API
- Login Shell Components
- Modules Tests
- Password Routes
- Master Data Repository
- SSO Routes & Schema
- Users Tests
- Prisma Users Repository
- Shared Package Manifest
- Render Deploy Config
- Theme Provider
- App Routing & Session
- API Scripts
- In-Memory Users Repo
- Storefront Drawing
- Database Seed
- Auth Repository Mapping
- Password Repository
- Prisma Auth Repository
- Module Logo Assets
- Prisma Config
- CSV User Import
- Vite Config
- pnpm Workspace
- Legacy User Merge Script
- Web Scripts
- Email Change Broadcast Script
- Prisma Module Repository
- Web TS Root Config

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
- `antislop Skill (Anti-slop UI filter)` --conceptually_related_to--> `AI Coding Rules (AI_RULES.md)`  [INFERRED]
  .claude/skills/antislop/SKILL.md → AI_RULES.md
- `apps/web index.html (SPARTA SPA entry)` --shares_data_with--> `AppModule model (DB-configured callbackUrl)`  [INFERRED]
  apps/web/index.html → docs/superpowers/plans/2026-06-17-sparta-backend-monorepo-spec.md
- `apps/web index.html (SPARTA SPA entry)` --conceptually_related_to--> `@sparta/web (apps/web)`  [INFERRED]
  apps/web/index.html → README.md
- `API .env.development config (DATABASE_URL, SESSION_SECRET, OTP_PEPPER, Gmail, module callbacks)` --shares_data_with--> `AppModule model (DB-configured callbackUrl)`  [INFERRED]
  SETUP_GUIDE.md → docs/superpowers/plans/2026-06-17-sparta-backend-monorepo-spec.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Per-module SSO readiness checklists implementing the module SSO contract** — docs_integration_sparta_building_sso_checklist_building_sso_checklist, docs_integration_sparta_maintenance_sso_checklist_maintenance_sso_checklist, docs_integration_sparta_energy_sso_checklist_energy_sso_checklist, docs_integration_module_sso_contract_module_sso_contract [EXTRACTED 1.00]
- **SPARTA SSO launch-token exchange flow** — docs_integration_module_sso_contract_post_v1_modules_launch, docs_integration_module_sso_contract_launch_token, docs_integration_module_sso_contract_post_v1_sso_exchange, docs_integration_module_sso_contract_user_matching_order, docs_superpowers_plans_2026_06_17_sparta_backend_monorepo_spec_module_launch_model [EXTRACTED 1.00]
- **BRANCH_ADMIN Maintenance login block mechanism** — docs_superpowers_specs_2026_09_09_block_branch_admin_login_design_branch_admin_email_only_rule, docs_superpowers_plans_2026_09_09_block_branch_admin_login_mapuserrecord_filter, docs_superpowers_plans_2026_09_09_block_branch_admin_login_no_ui_access_error, docs_superpowers_plans_2026_06_17_sparta_backend_monorepo_spec_user_module_access_model [INFERRED 0.85]

## Communities (63 total, 12 thin omitted)

### Community 0 - "Web App Shell & Assets"
Cohesion: 0.06
Nodes (113): App(), loadSession(), ChangeEmailDialog(), ChangeEmailDialogProps, MODULE_NAMES, ChangePasswordDialog(), ChangePasswordDialogProps, ChangePasswordStatus (+105 more)

### Community 1 - "SSO Contract & Docs"
Cohesion: 0.15
Nodes (18): POST /v1/admin/users/sync, POST /v1/admin/users/sync-delete, GET /v1/master/branches and /v1/master/areas (updatedSince sync), Module SSO Contract, POST /v1/modules/:moduleId/launch, POST /v1/sso/exchange, SpartaSsoUserPayload (contract v2), SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH) (+10 more)

### Community 2 - "About Page Components"
Cohesion: 0.06
Nodes (46): AcronymFeatureCard(), AcronymFeatureCardProps, AcronymPart, AppPhoneMockup(), AppPhoneMockupProps, PhoneModule, ModuleExplorer(), ModuleExplorerProps (+38 more)

### Community 3 - "Initial Auth Migration"
Cohesion: 0.09
Nodes (37): "AppModule", AppModule_isActive_sortOrder_idx, "AuditEvent", AuditEvent_action_createdAt_idx, AuditEvent_actorUserId_createdAt_idx, AuditEvent_entityType_entityId_idx, "Branch", Branch_code_key (+29 more)

### Community 4 - "Password OTP Tests"
Cohesion: 0.05
Nodes (37): loadEnv(), AuthUserRecord, CreateOtpChallengeInput, mapOtpChallenge(), mapUserRecord(), OtpChallengeRecord, PasswordOtpPurpose, PasswordOtpStatus (+29 more)

### Community 5 - "Admin Users API"
Cohesion: 0.14
Nodes (18): createServices(), createUsersRouter(), invalidPayload(), parseBody(), AccessUpdateInput, accessUpdateSchema, ChangeEmailInput, changeEmailSchema (+10 more)

### Community 6 - "Rate Limit & Session Middleware"
Cohesion: 0.12
Nodes (27): loginRateLimit, moduleLaunchRateLimit, otpRequestRateLimit, otpVerifyRateLimit, CurrentSpartaSession, Express, Request, requireSession() (+19 more)

### Community 7 - "Auth Records & Tests"
Cohesion: 0.10
Nodes (29): AppShell(), AppShellProps, getInitials(), Logo(), LogoProps, AlertDialog(), AlertDialogAction(), AlertDialogCancel() (+21 more)

### Community 8 - "App Bootstrap & Config"
Cohesion: 0.13
Nodes (19): AppOptions, createApp(), createCorsOptions(), envSchema, errorHandler(), notFoundHandler(), requestContext(), requireInternalApiKey() (+11 more)

### Community 9 - "API Dev Dependencies"
Cohesion: 0.10
Nodes (27): devDependencies, csv-parser@^3.2.1, tsx@^4.21.0, @types/cookie-parser@^1.4.10, @types/cors@^2.8.19, @types/express@^5.0.6, @types/node@^24.0.0, @types/nodemailer@^8.0.1 (+19 more)

### Community 10 - "Docker CI Workflow"
Cohesion: 0.08
Nodes (25): permissions, runs-on, steps, jobs, build, name, on, push (+17 more)

### Community 11 - "Web Dependencies"
Cohesion: 0.10
Nodes (21): dependencies, class-variance-authority@^0.7.1, cn@^0.5.2, embla-carousel-react@^8.6.0, input-otp@^1.4.2, lucide-react@^1.17.0, next-themes@^0.4.6, radix-ui@^1.5.0 (+13 more)

### Community 12 - "Item UI Component"
Cohesion: 0.19
Nodes (20): Item(), ItemActions(), ItemContent(), ItemDescription(), ItemGroup(), ItemMedia(), itemMediaVariants, ItemTitle() (+12 more)

### Community 13 - "Shared API Contract"
Cohesion: 0.08
Nodes (22): API_SHARED_MODULE_IDS, ApiSessionResponse, ApiError, ApiResult, ApiSuccess, MasterAreaAdminDto, MasterBranchAdminDto, MasterBranchAliasDto (+14 more)

### Community 14 - "Prisma Client & Branch Alias"
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
Cohesion: 0.12
Nodes (20): publicModuleIdByPrismaId, mapLaunch(), mapUser(), PrismaSsoLaunch, PrismaSsoRepository, SsoLaunchRecord, SsoRepository, SsoUserRecord (+12 more)

### Community 19 - "API TS Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+10 more)

### Community 21 - "In-Memory Auth Repo"
Cohesion: 0.06
Nodes (6): CreateSessionInput, InMemoryAuthRepository, InMemoryAuthRepository, InMemoryAuthRepository, InMemoryAuthRepository, sync()

### Community 22 - "Lint & Format Tooling"
Cohesion: 0.15
Nodes (12): eslint@^10, @eslint/js@^10, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17, typescript-eslint@^8, eslint, @eslint/js (+4 more)

### Community 23 - "Web TS Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 24 - "Root Workspace Package"
Cohesion: 0.12
Nodes (17): devDependencies, prettier@^3.8.3, prettier-plugin-tailwindcss@^0.8.0, prettier, prettier-plugin-tailwindcss, name, private, scripts (+9 more)

### Community 26 - "Shared TS Config"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+8 more)

### Community 27 - "Web Package Manifest"
Cohesion: 0.13
Nodes (15): devDependencies, prettier@^3.8.3, prettier-plugin-tailwindcss@^0.8.0, @types/node@^24, @types/react@^19, @types/react-dom@^19, typescript@~6, vitest@^4.1.8 (+7 more)

### Community 28 - "Modules API"
Cohesion: 0.13
Nodes (17): AppEnv, CreateAuditEventInput, CreateModuleLaunchInput, mapModule(), ModuleLaunchRecord, ModuleRecord, ModuleRepository, prismaModuleIdByPublicId (+9 more)

### Community 29 - "Login Shell Components"
Cohesion: 0.07
Nodes (26): FasciaStripe(), FasciaStripeProps, acronym, appOrder, AuthBackdrop(), PublicAuthShellProps, usePanelThemeColor(), columnAxes (+18 more)

### Community 30 - "Modules Tests"
Cohesion: 0.07
Nodes (20): supertest@^7.1.4, testEnv, globalForPrisma, prisma, AuthAccessModuleId, AuthSessionRecord, isLaunchableModule(), LaunchablePrismaModuleId (+12 more)

### Community 31 - "Password Routes"
Cohesion: 0.09
Nodes (31): requireAdmin(), requireRoles(), AuthError, normalizeBranchAlias(), AdminAreaRecord, AdminBranchRecord, AreaPatch, BranchPatch (+23 more)

### Community 32 - "Master Data Repository"
Cohesion: 0.24
Nodes (8): MasterAreaRecord, MasterBranchRecord, MasterListFilter, MasterRepository, PrismaMasterRepository, createTestApp(), InMemoryMasterRepository, testEnv

### Community 33 - "SSO Routes & Schema"
Cohesion: 0.18
Nodes (22): Alert(), AlertDescription(), AlertTitle(), alertVariants, Table(), TableBody(), TableCell(), TableHead() (+14 more)

### Community 34 - "Users Tests"
Cohesion: 0.11
Nodes (22): AlertAction(), AlertDialogMedia(), AvatarBadge(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), CardAction(), CardFooter() (+14 more)

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
Cohesion: 0.18
Nodes (12): Badge(), badgeVariants, buttonVariants, FieldContent(), FieldLegend(), FieldSet(), FieldTitle(), fieldVariants (+4 more)

### Community 40 - "API Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:seed, dev, dev:uat, lint, prisma, prisma:generate (+4 more)

### Community 41 - "In-Memory Users Repo"
Cohesion: 0.10
Nodes (14): CreateUserInput, PrismaUserRecord, UpdateUserInput, UserListRecord, UsersRepository, UsersService, UsersServiceCreateInput, UsersServiceUpdateInput (+6 more)

### Community 42 - "Storefront Drawing"
Cohesion: 0.16
Nodes (14): apps/web index.html (SPARTA SPA entry), Frontend stack: React 19 + Vite 8 + TS 6 + Tailwind v4 + shadcn/ui, One-time Launch Token (TTL 2 min), AppModule model (DB-configured callbackUrl), Deployment Architecture (Vercel Free + Render Standard), ModuleLaunch model (launchTokenHash, consumedAt), Deployment: Vercel (web) + Render (api), @sparta/api (apps/api Express backend) (+6 more)

### Community 43 - "Database Seed"
Cohesion: 0.24
Nodes (10): branchSeeds, env, legacySeedEmails, main(), moduleSeeds, prisma, seedBranches(), seedModules() (+2 more)

### Community 44 - "Auth Repository Mapping"
Cohesion: 0.15
Nodes (12): clsx@^2.1.1, @fontsource-variable/geist@^5.2.9, tailwind-merge@^3.6.0, tw-animate-css@^1.4.0, name, private, type, version (+4 more)

### Community 45 - "Password Repository"
Cohesion: 0.29
Nodes (8): Energy role mapping (AUDITOR, ENGINEER, MANAGER, USER), Maintenance role mapping (ADMIN, BMS, BMC, BNM, MANAGER, USER), AuditEvent model, OtpChallenge model, OTP password recovery and change (HMAC-hashed OTP), Prisma Schema Draft, User model, UserModuleAccess model (per-module role)

### Community 46 - "Prisma Auth Repository"
Cohesion: 0.62
Nodes (4): AGENTS.md (Codex guidance), Frontend stack: React 19 + Vite 8 + TS 6 + Tailwind v4 + shadcn/ui, AI Coding Rules (AI_RULES.md), CLAUDE.md (Claude Code guidance)

### Community 47 - "Module Logo Assets"
Cohesion: 0.48
Nodes (5): P0 Authentication Core, Block BRANCH_ADMIN Login Implementation Plan, mapUserRecord filter excluding MAINTENANCE for BRANCH_ADMIN, NO_UI_ACCESS 403 AuthError on empty access, Block BRANCH_ADMIN Login Design

### Community 48 - "Prisma Config"
Cohesion: 0.25
Nodes (5): dotenv@^17.2.3, prisma@^6.19.0, envPath, dotenv, prisma

### Community 50 - "Vite Config"
Cohesion: 0.14
Nodes (9): CSV_FILE_PATH, CsvRow, prisma, @tailwindcss/vite@^4, vite@^8, @vitejs/plugin-react@^6, @tailwindcss/vite, vite (+1 more)

### Community 51 - "pnpm Workspace"
Cohesion: 0.25
Nodes (7): allowBuilds, esbuild, msw, prisma, @prisma/client, @prisma/engines, packages

### Community 52 - "Legacy User Merge Script"
Cohesion: 0.19
Nodes (10): pg@^8.23.0, main(), MergedUser, queryBuildingUsers(), queryEnergyUsers(), queryMaintenanceUsers(), ssoPrisma, c (+2 more)

### Community 53 - "Web Scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, preview, test, typecheck

### Community 56 - "Web TS Root Config"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

## Knowledge Gaps
- **11 isolated node(s):** `POST /v1/admin/users/sync-delete`, `GET /v1/master/branches and /v1/master/areas (updatedSince sync)`, `SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH)`, `Maintenance report/dashboard/PJUM authorization`, `Admin user and access management API` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 448 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SpartaLaunchableModuleId` connect `In-Memory Users Repo` to `Web App Shell & Assets`, `Prisma Users Repository`, `Shared API Contract`, `SSO Repository`, `Modules API`, `Modules Tests`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **What connects `POST /v1/admin/users/sync-delete`, `GET /v1/master/branches and /v1/master/areas (updatedSince sync)`, `SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH)` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Web App Shell & Assets` be split into smaller, more focused modules?**
  _Cohesion score 0.055664488017429195 - nodes in this community are weakly interconnected._
- **Why does `@prisma/client` connect `Prisma Client & Branch Alias` to `Master Data Repository`, `Password OTP Tests`, `API Dev Dependencies`, `In-Memory Users Repo`, `Database Seed`, `Vite Config`, `SSO Repository`, `Legacy User Merge Script`, `Modules API`, `Modules Tests`, `Password Routes`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Should `About Page Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06464646464646465 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `Users Tests` to `Web App Shell & Assets`, `SSO Routes & Schema`, `About Page Components`, `App Routing & Session`, `Auth Records & Tests`, `Item UI Component`, `Login Shell Components`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `Initial Auth Migration` be split into smaller, more focused modules?**
  _Cohesion score 0.09487179487179487 - nodes in this community are weakly interconnected._