# Graph Report - login-sparta  (2026-11-19)

## Corpus Check
- Corpus is ~48,202 words - fits in a single context window. You may not need a graph.

## Summary
- 1199 nodes · 2689 edges · 63 communities (53 shown, 10 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.85)
- Token cost: 130,727 input · 0 output

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
- Branch Password Fix Script

## God Nodes (most connected - your core abstractions)
1. `cn()` - 119 edges
2. `react` - 36 edges
3. `AppShell()` - 35 edges
4. `Button()` - 34 edges
5. `AppEnv` - 32 edges
6. `createApp()` - 26 edges
7. `ChangePasswordDialog()` - 25 edges
8. `ForgotPasswordPage()` - 25 edges
9. `AuthError` - 22 edges
10. `PrismaAuthRepository` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Prisma Schema Draft` --conceptually_related_to--> `Prisma database setup (generate, migrate, seed)`  [INFERRED]
  docs/superpowers/plans/2026-06-17-sparta-backend-monorepo-spec.md → SETUP_GUIDE.md
- `antislop Skill (Anti-slop UI filter)` --conceptually_related_to--> `AI Coding Rules (AI_RULES.md)`  [INFERRED]
  .claude/skills/antislop/SKILL.md → AI_RULES.md
- `apps/web index.html (SPARTA SPA entry)` --conceptually_related_to--> `@sparta/web (apps/web)`  [INFERRED]
  apps/web/index.html → README.md
- `@sparta/shared (apps/shared types & validation)` --implements--> `Shared API contracts (SpartaModuleId, SpartaSessionDto, ApiSuccess/ApiError)`  [INFERRED]
  README.md → docs/superpowers/plans/2026-06-17-sparta-backend-monorepo-spec.md
- `Deployment: Vercel (web) + Render (api)` --implements--> `Deployment Architecture (Vercel Free + Render Standard)`  [INFERRED]
  README.md → docs/superpowers/plans/2026-06-17-sparta-backend-monorepo-spec.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **SPARTA SSO launch-token exchange flow** — docs_integration_module_sso_contract_post_v1_modules_launch, docs_integration_module_sso_contract_launch_token, docs_integration_module_sso_contract_post_v1_sso_exchange, docs_integration_module_sso_contract_user_matching_order, docs_superpowers_plans_2026_06_17_sparta_backend_monorepo_spec_module_launch_model [EXTRACTED 1.00]
- **Per-module SSO readiness checklists implementing the module SSO contract** — docs_integration_sparta_building_sso_checklist_building_sso_checklist, docs_integration_sparta_maintenance_sso_checklist_maintenance_sso_checklist, docs_integration_sparta_energy_sso_checklist_energy_sso_checklist, docs_integration_module_sso_contract_module_sso_contract [EXTRACTED 1.00]
- **BRANCH_ADMIN Maintenance login block mechanism** — docs_superpowers_specs_2026_09_09_block_branch_admin_login_design_branch_admin_email_only_rule, docs_superpowers_plans_2026_09_09_block_branch_admin_login_mapuserrecord_filter, docs_superpowers_plans_2026_09_09_block_branch_admin_login_no_ui_access_error, docs_superpowers_plans_2026_06_17_sparta_backend_monorepo_spec_user_module_access_model [INFERRED 0.85]

## Communities (63 total, 10 thin omitted)

### Community 0 - "Web App Shell & Assets"
Cohesion: 0.05
Nodes (122): AppShell(), AppShellProps, getInitials(), ChangeEmailDialog(), ChangeEmailDialogProps, MODULE_NAMES, ChangePasswordDialog(), ChangePasswordDialogProps (+114 more)

### Community 1 - "SSO Contract & Docs"
Cohesion: 0.06
Nodes (47): apps/web index.html (SPARTA SPA entry), Frontend stack: React 19 + Vite 8 + TS 6 + Tailwind v4 + shadcn/ui, POST /v1/admin/users/sync, POST /v1/admin/users/sync-delete, One-time Launch Token (TTL 2 min), GET /v1/master/branches and /v1/master/areas (updatedSince sync), Module SSO Contract, POST /v1/modules/:moduleId/launch (+39 more)

### Community 2 - "About Page Components"
Cohesion: 0.07
Nodes (46): AcronymFeatureCard(), AcronymFeatureCardProps, AcronymPart, AppPhoneMockup(), AppPhoneMockupProps, PhoneModule, ModuleExplorer(), ModuleExplorerProps (+38 more)

### Community 3 - "Initial Auth Migration"
Cohesion: 0.09
Nodes (37): "AppModule", AppModule_isActive_sortOrder_idx, "AuditEvent", AuditEvent_action_createdAt_idx, AuditEvent_actorUserId_createdAt_idx, AuditEvent_entityType_entityId_idx, "Branch", Branch_code_key (+29 more)

### Community 4 - "Password OTP Tests"
Cohesion: 0.08
Nodes (14): CreateOtpChallengeInput, UpdateOtpChallengeInput, createAppWithFakes(), createAuthenticatedAgent(), InMemoryAuthRepository, InMemoryPasswordRepository, TestEmailProvider, testEnv (+6 more)

### Community 5 - "Admin Users API"
Cohesion: 0.09
Nodes (24): requireAdmin(), AuthError, UsersRepository, createServices(), createUsersRouter(), invalidPayload(), parseBody(), UsersRouterOptions (+16 more)

### Community 6 - "Rate Limit & Session Middleware"
Cohesion: 0.11
Nodes (20): loginRateLimit, moduleLaunchRateLimit, otpRequestRateLimit, otpVerifyRateLimit, CurrentSpartaSession, Express, Request, AuthRepository (+12 more)

### Community 7 - "Auth Records & Tests"
Cohesion: 0.14
Nodes (15): AuthUserRecord, testEnv, OtpChallengeRecord, PasswordOtpPurpose, PasswordRepository, ChangePasswordConfirmInput, ForgotOtpRequestInput, ForgotOtpVerifyInput (+7 more)

### Community 8 - "App Bootstrap & Config"
Cohesion: 0.15
Nodes (17): AppOptions, createApp(), testEnv, createCorsOptions(), envSchema, loadEnv(), errorHandler(), notFoundHandler() (+9 more)

### Community 9 - "API Dev Dependencies"
Cohesion: 0.11
Nodes (25): devDependencies, tsx@^4.21.0, @types/cookie-parser@^1.4.10, @types/cors@^2.8.19, @types/express@^5.0.6, @types/node@^24.0.0, @types/nodemailer@^8.0.1, @types/pg@^8.23.1 (+17 more)

### Community 10 - "Docker CI Workflow"
Cohesion: 0.08
Nodes (25): permissions, runs-on, steps, jobs, build, name, on, push (+17 more)

### Community 11 - "Web Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cn@^0.5.2, embla-carousel-react@^8.6.0, @fontsource-variable/geist@^5.2.9, input-otp@^1.4.2, lucide-react@^1.17.0 (+17 more)

### Community 12 - "Item UI Component"
Cohesion: 0.16
Nodes (22): Item(), ItemActions(), ItemContent(), ItemDescription(), ItemFooter(), ItemGroup(), ItemHeader(), ItemMedia() (+14 more)

### Community 13 - "Shared API Contract"
Cohesion: 0.11
Nodes (16): API_SHARED_MODULE_IDS, ApiSessionResponse, ApiError, ApiResult, ApiSuccess, SPARTA_MODULE_IDS, SPARTA_SSO_CONTRACT_VERSION, SpartaModuleDto (+8 more)

### Community 14 - "Prisma Client & Branch Alias"
Cohesion: 0.14
Nodes (15): globalForPrisma, prisma, normalizeBranchAlias(), CreateAuditEventInput, CreateModuleLaunchInput, ModuleLaunchRecord, ModuleRecord, prismaModuleIdByPublicId (+7 more)

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
Cohesion: 0.13
Nodes (12): mapLaunch(), mapUser(), PrismaSsoLaunch, PrismaSsoRepository, SsoLaunchRecord, SsoUserRecord, addLaunch(), createAppWithFakes() (+4 more)

### Community 19 - "API TS Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+10 more)

### Community 20 - "Web API Client & Auth"
Cohesion: 0.13
Nodes (16): ApiClientError, apiFetch(), getApiUrl(), ChangeEmailResult, ChangePasswordWithOtpInput, defaultModuleLoginUrls, getAccessibleApps(), LoginInput (+8 more)

### Community 21 - "In-Memory Auth Repo"
Cohesion: 0.11
Nodes (3): CreateSessionInput, InMemoryAuthRepository, InMemoryAuthRepository

### Community 22 - "Lint & Format Tooling"
Cohesion: 0.14
Nodes (17): devDependencies, eslint@^10, @eslint/js@^10, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17, prettier@^3.8.3, @types/react@^19 (+9 more)

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

### Community 27 - "Web Package Manifest"
Cohesion: 0.12
Nodes (16): @sparta/shared@workspace:*, prettier-plugin-tailwindcss@^0.8.0, @types/node@^24, @types/react-dom@^19, typescript@~6, vitest@^4.1.8, prettier-plugin-tailwindcss, @sparta/shared (+8 more)

### Community 28 - "Modules API"
Cohesion: 0.25
Nodes (11): AppEnv, ModuleRepository, createModulesRouter(), invalidModule(), isModuleId(), ModulesRouterOptions, appendLaunchToken(), LaunchContext (+3 more)

### Community 29 - "Login Shell Components"
Cohesion: 0.17
Nodes (13): FasciaStripe(), FasciaStripeProps, acronym, appOrder, AuthBackdrop(), PublicAuthShell(), PublicAuthShellProps, usePanelThemeColor() (+5 more)

### Community 30 - "Modules Tests"
Cohesion: 0.13
Nodes (8): supertest@^7.1.4, AuthSessionRecord, createAppWithFakes(), InMemoryModuleRepository, ModuleLaunchInput, ModuleRecord, testEnv, supertest

### Community 31 - "Password Routes"
Cohesion: 0.27
Nodes (13): requireSession(), createFirstPasswordRouter(), createPasswordRouter(), createServices(), invalidPayload(), parseBody(), PasswordRouterOptions, changePasswordConfirmSchema (+5 more)

### Community 32 - "Master Data Repository"
Cohesion: 0.24
Nodes (8): MasterAreaRecord, MasterBranchRecord, MasterListFilter, MasterRepository, PrismaMasterRepository, createTestApp(), InMemoryMasterRepository, testEnv

### Community 33 - "SSO Routes & Schema"
Cohesion: 0.26
Nodes (10): SsoRepository, createSsoRouter(), invalidPayload(), SsoRouterOptions, SsoExchangeInput, ssoExchangeSchema, SsoService, toSsoUserPayload() (+2 more)

### Community 34 - "Users Tests"
Cohesion: 0.15
Nodes (5): createAppWithFakes(), InMemoryAuthRepository, login(), sync(), testEnv

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
Cohesion: 0.32
Nodes (10): App(), loadSession(), getCurrentSpartaSession(), isSpartaSsoEnabled(), logoutFromSparta(), AppRoute, getCurrentRoute(), getDefaultRoute() (+2 more)

### Community 40 - "API Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:seed, dev, dev:uat, lint, prisma, prisma:generate (+4 more)

### Community 41 - "In-Memory Users Repo"
Cohesion: 0.26
Nodes (4): CreateUserInput, UpdateUserInput, InMemoryUsersRepository, SpartaLaunchableModuleId

### Community 42 - "Storefront Drawing"
Cohesion: 0.26
Nodes (11): axes, Callout, callouts, circle(), delay(), line(), rect(), SketchAnimated (+3 more)

### Community 43 - "Database Seed"
Cohesion: 0.24
Nodes (10): branchSeeds, env, legacySeedEmails, main(), moduleSeeds, prisma, seedBranches(), seedModules() (+2 more)

### Community 44 - "Auth Repository Mapping"
Cohesion: 0.22
Nodes (8): AuthAccessModuleId, isLaunchableModule(), LaunchablePrismaModuleId, mapSessionRecord(), mapUserRecord(), moduleIdMap, PrismaAuthSession, PrismaAuthUser

### Community 45 - "Password Repository"
Cohesion: 0.24
Nodes (3): mapOtpChallenge(), mapUserRecord(), PrismaPasswordRepository

### Community 48 - "Prisma Config"
Cohesion: 0.25
Nodes (5): dotenv@^17.2.3, prisma@^6.19.0, envPath, dotenv, prisma

### Community 49 - "CSV User Import"
Cohesion: 0.25
Nodes (5): csv-parser@^3.2.1, CSV_FILE_PATH, CsvRow, prisma, csv-parser

### Community 50 - "Vite Config"
Cohesion: 0.25
Nodes (6): @tailwindcss/vite@^4, vite@^8, @vitejs/plugin-react@^6, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 51 - "pnpm Workspace"
Cohesion: 0.25
Nodes (7): allowBuilds, esbuild, msw, prisma, @prisma/client, @prisma/engines, packages

### Community 52 - "Legacy User Merge Script"
Cohesion: 0.43
Nodes (6): main(), MergedUser, queryBuildingUsers(), queryEnergyUsers(), queryMaintenanceUsers(), ssoPrisma

### Community 53 - "Web Scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, preview, test, typecheck

### Community 54 - "Email Change Broadcast Script"
Cohesion: 0.33
Nodes (4): pg@^8.23.0, c, { Client }, pg

### Community 56 - "Web TS Root Config"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

## Knowledge Gaps
- **11 isolated node(s):** `Two Usage Modes (During / After audit)`, `Frontend stack: React 19 + Vite 8 + TS 6 + Tailwind v4 + shadcn/ui`, `@sparta/api (apps/api Express backend)`, `Web .env.development config (VITE_API_BASE_URL, module login URLs)`, `SSO error codes (INVALID_SSO_TOKEN, SSO_TOKEN_CONSUMED, SSO_TOKEN_EXPIRED, SSO_MODULE_MISMATCH)` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 411 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SpartaLaunchableModuleId` connect `In-Memory Users Repo` to `Users Tests`, `Prisma Users Repository`, `Admin Users API`, `Auth Repository Mapping`, `Shared API Contract`, `Prisma Client & Branch Alias`, `SSO Repository`, `Web API Client & Auth`, `Modules API`, `Modules Tests`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **What connects `Two Usage Modes (During / After audit)`, `Frontend stack: React 19 + Vite 8 + TS 6 + Tailwind v4 + shadcn/ui`, `@sparta/api (apps/api Express backend)` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Web App Shell & Assets` be split into smaller, more focused modules?**
  _Cohesion score 0.050272308336824466 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Web App Shell & Assets` to `About Page Components`, `Theme Provider`, `App Routing & Session`, `Storefront Drawing`, `Web Dependencies`, `Item UI Component`, `Web Package Manifest`, `Login Shell Components`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `SSO Contract & Docs` be split into smaller, more focused modules?**
  _Cohesion score 0.05827067669172932 - nodes in this community are weakly interconnected._
- **Why does `@prisma/client` connect `Prisma Client & Branch Alias` to `Master Data Repository`, `API Dev Dependencies`, `Database Seed`, `Auth Repository Mapping`, `API Runtime Dependencies`, `CSV User Import`, `SSO Repository`, `Legacy User Merge Script`, `Branch Password Fix Script`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Should `About Page Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06638714185883997 - nodes in this community are weakly interconnected._