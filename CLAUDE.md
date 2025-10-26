# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Setup
- `pnpm run setup` - Install deps and build data-ops package

### Development
- `pnpm run dev:user-application` - Start user app on port 3000
- `pnpm run dev:data-service` - Start data service with remote bindings

### Build & Deploy
- `pnpm run build:data-ops` - Build shared data-ops package
- `pnpm run deploy:user-application` - Build data-ops, then deploy user app to Cloudflare
- `pnpm run deploy:data-service` - Build data-ops, then deploy data service to Cloudflare

### Database & Auth (in packages/data-ops)
- `pnpm run better-auth:generate` - Generate Better Auth schemas to src/drizzle/auth-schema.ts
- `pnpm run drizzle:generate` - Generate Drizzle migrations from schema
- `pnpm run drizzle:migrate` - Apply migrations to database
- `pnpm run drizzle:pull` - Pull schema from database (auth tables filtered via tablesFilter)

### Shadcn (in apps/user-application)
- `pnpx shadcn@latest add <component>` - Add new Shadcn components

## Architecture

Monorepo SaaS with **pnpm workspaces**. Two applications share a data-ops package for auth, database, schemas, and queries.

### Workspace Structure
```
apps/
  user-application/    - TanStack Start frontend (Cloudflare Workers)
  data-service/        - Hono API backend (Cloudflare Workers)
packages/
  data-ops/           - Shared data layer (auth, db, schemas, queries)
```

### data-ops Package
**Purpose:** Centralized data operations shared across apps

**Structure:**
- `src/auth/` - Better Auth setup (setup.ts, server.ts)
- `src/database/` - Database initialization (setup.ts)
- `src/drizzle/` - Generated schemas (auth-schema.ts)
- `src/queries/` - Shared database queries
- `src/zod-schema/` - Validation schemas
- `config/auth.ts` - Better Auth CLI config

**Exports:** Path-based exports via package.json
```
@repo/data-ops/auth/*
@repo/data-ops/database/*
@repo/data-ops/zod-schema/*
@repo/data-ops/queries/*
```

**Build:** TypeScript compilation to dist/ with tsc-alias for path mapping

### user-application (Frontend)
**Stack:** TanStack Start (React 19, TanStack Router, TanStack Query), Tailwind CSS v4, Better Auth, Polar payments

**Key Files:**
- `src/server.ts` - Custom server entry: initializes DB, sets auth before handler
- `src/routes/__root.tsx` - Root layout with query/router integration
- `src/routes/_auth/route.tsx` - Protected route wrapper
- `src/routes/api/auth.$.tsx` - Better Auth catch-all handler
- `src/lib/auth-client.ts` - Better Auth React client
- `src/core/middleware/` - Middleware (auth, polar)
- `src/core/functions/` - Server functions

**Routing:** File-based, auto-generates src/routeTree.gen.ts

**Auth Flow:**
1. `server.ts` calls `setAuth()` with DB adapter + secrets on each request
2. OAuth routes handled by `/api/auth/$` catch-all
3. Protected routes use `_auth` layout with client-side or SSR checks

**Payments:** Polar SDK integration via middleware, server functions create checkouts, no webhooks/payment tables

**Deployment:** Cloudflare Workers via wrangler

### data-service (Backend)
**Stack:** Hono, Cloudflare Workers (WorkerEntrypoint)

**Structure:**
- `src/index.ts` - WorkerEntrypoint exporting DataService class
- `src/hono/app.ts` - Hono app with routes
- `src/durable-objects/` - Durable Objects
- `src/workflows/` - Cloudflare Workflows

**Purpose:** Separate API service, can use Durable Objects/Workflows

**Deployment:** Cloudflare Workers via wrangler

### Database & Auth Setup
**Database:** Cloudflare D1 (SQLite), initialized via `initDatabase(d1: D1Database)` with D1 binding from env

**Why NO local db ? :**
- Deploy-first approach works better than local dev (D1 bindings complex in Vite)

**Auth:** Better Auth with Drizzle adapter (SQLite)
- Tables: `auth_user`, `auth_session`, `auth_account`, `auth_verification`
- CLI: `config/auth.ts` uses better-sqlite3 for schema generation
- Runtime: `setAuth()` in server.ts uses D1 binding with SQLite adapter
- Auth tables filtered in drizzle.config.ts (`tablesFilter: ["!auth_*"]`)

**Workflow:**
1. Generate auth schema: `pnpm run better-auth:generate`
2. Create migrations: `pnpm run drizzle:generate`
3. Apply: `pnpm run drizzle:migrate` (uses D1 HTTP API)

**D1 Setup:**
- Binding: `env.DB` in wrangler.jsonc
- Drizzle config: Uses d1-http driver with API token for migrations
- Runtime: D1Database passed to drizzle-orm/d1

### Key Patterns

**Server Entry Customization:** user-application uses custom server.ts to initialize per-request DB/auth before TanStack handler

**Auth Integration:** Two-phase setup
- CLI: `config/auth.ts` for schema generation
- Runtime: `setAuth()` in server.ts for request handling

**Protected Routes:** `_auth` layout checks session, renders GoogleLogin if unauthenticated

**Polar Payments:** Middleware provides SDK, server functions handle products/checkouts, product metadata controls features

**Shared Data Layer:** data-ops package must be built before running/deploying apps

## Key Implementation Details

**Better Auth Server Instance:** Created per-request via `setAuth()` then retrieved via `getAuth()`. Uses singleton pattern within request scope.

**Database Connection:** Singleton pattern in `initDatabase()` - returns existing instance if already initialized.

**Polar Metadata-Driven Features:** Product metadata (JSON in Polar dashboard) controls app features, checked via `collectSubscription()`.

**TanStack Query SSR:** Setup via `setupRouterSsrQueryIntegration` in router.tsx, query client in route context.

**Pagination Strategy (Haryanvi Analytics):** Offset-based pagination used for MVP simplicity. Performs well for first 10-20 pages with datasets under 100K records. Migrate to cursor-based if deep pagination (page 50+) becomes common or dataset exceeds 500K records.

## Documentation
See apps/user-application/public/docs/ for detailed guides on authentication.md and polar.md
