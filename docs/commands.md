# Commands

## 1. Initial Setup
- `pnpm run setup` - Install deps, build data-ops

## 2. Development (Three-Terminal Workflow)
- Terminal 1: `cd packages/data-ops && pnpm run watch` - Auto-rebuild data-ops on changes
- Terminal 2: `cd apps/user-application && pnpm run watch` - Auto-rebuild user-app on changes
- Terminal 3: `cd apps/user-application && pnpm dev` - Wrangler dev with remote D1

## 3. Development (Alternatives)
- `pnpm run dev:user-application` - Start user app (wrangler dev --remote)
- `pnpm run dev:data-service` - Start data service
- `cd apps/user-application && pnpm dev:local` - Vite dev (fast UI, no D1)

## 4. Build
- `pnpm run build:data-ops` - Build shared data-ops package
- `cd apps/user-application && pnpm run build` - Build user app

## 5. Deploy
- `pnpm run deploy:user-application` - Build + deploy user app to Cloudflare
- `pnpm run deploy:data-service` - Build + deploy data service to Cloudflare

## 6. Database & Auth (in packages/data-ops)
- `pnpm run better-auth:generate` - Generate auth schemas
- `pnpm run drizzle:generate` - Generate migrations from schema
- `pnpm run drizzle:migrate` - Apply migrations to D1
- `pnpm run drizzle:pull` - Pull schema from D1

## 7. Package Management
- `pnpm add <package> -w` - Add to workspace root
- `pnpm add <package> --filter data-ops` - Add to data-ops
- `pnpm add <package> --filter user-application` - Add to user-app
- `pnpm add <package> --filter data-service` - Add to data-service
- `pnpx shadcn@latest add <component>` - Add Shadcn component (in user-app dir)

## 8. Testing & Utilities
- `wrangler d1 execute haryanvibe-db --remote --command "..."` - Query D1 database
- `wrangler types` - Generate Cloudflare types
