# Commands

## 1. Initial Setup
- `pnpm run setup` - Install deps, build data-ops

## 2. Development
- `pnpm run dev:user-application` - Build + start user app on port 3000 (wrangler dev --remote)
- `pnpm run dev:local:user-application` - Start user app on port 3001 (Vite dev, fast UI, no D1)
- `pnpm run dev:data-service` - Start data service

## 3. Build
- `pnpm run build:data-ops` - Build shared data-ops package

## 4. Deploy
- `pnpm run deploy:user-application` - Build + deploy user app to Cloudflare
- `pnpm run deploy:data-service` - Build + deploy data service to Cloudflare

## 5. Database & Auth (in packages/data-ops)
- `pnpm run better-auth:generate` - Generate auth schemas
- `pnpm run drizzle:generate` - Generate migrations from schema
- `pnpm run drizzle:migrate` - Apply migrations to D1
- `pnpm run drizzle:pull` - Pull schema from D1

## 6. Package Management
- `pnpm add <package> -w` - Add to workspace root
- `pnpm add <package> --filter data-ops` - Add to data-ops
- `pnpm add <package> --filter user-application` - Add to user-app
- `pnpm add <package> --filter data-service` - Add to data-service
- `pnpx shadcn@latest add <component>` - Add Shadcn component (in user-app dir)

## 7. Testing & Utilities
- `wrangler d1 execute haryanvibe-db --remote --command "..."` - Query D1 database
- `wrangler types` - Generate Cloudflare types
