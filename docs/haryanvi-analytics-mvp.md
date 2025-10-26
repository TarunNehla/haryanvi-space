# Feature: Haryanvi Music Analytics Platform

## Context
Building a music analytics platform for Haryanvi music industry using Spotify data. MVP displays top 10 artists and songs by popularity. Data already populated in D1 database, initially no Spotify API integration (added later).

## Phases

### ✅ Phase 1: Schema Integration (COMPLETE)
- [x] Move `haryanvibe-schema.ts` to `packages/data-ops/src/drizzle/`
- [x] Export schema tables from data-ops package.json paths
- [x] Rebuild data-ops package (`pnpm run build:data-ops`)
- [x] Verify exports work in user-application

### ✅ Phase 2: Query Layer (COMPLETE)
- [x] Create query functions for top artists/songs
- [x] Define query parameters & return types (offset pagination)
- [x] Export from data-ops package
- [x] Document pagination decision in CLAUDE.md

### ✅ Phase 3A: Server Functions (COMPLETE)
- [x] Create API routes for /api/artists and /api/songs
- [x] Implement server functions using query layer
- [x] Handle query params (page, limit, sortBy, order)
- [x] Return JSON responses with pagination metadata
- [x] Test with .rest client
- [x] Fix OAuth for local dev (baseURL + trustedOrigins)
- [x] Add watch mode scripts for faster iteration

### ⏳ Phase 3B: Homepage UI (TODO - Needs Brainstorming)
- [ ] Design minimal list layout
- [ ] Implement client-side data fetching from server functions
- [ ] Render top 10 artists section
- [ ] Render top 10 songs section
- _Note: UI approach, styling, responsiveness need discussion_

### ⏳ Phase 4: Testing & Polish (TODO - Needs Brainstorming)
- [ ] Test with real D1 data
- [ ] Verify images load correctly
- [ ] Basic responsive checks
- _Note: QA criteria and edge cases need definition_

## Current State
- ✅ Schema integrated into data-ops: `packages/data-ops/src/drizzle/haryanvibe-schema.ts`
- ✅ Schema exports available: `@repo/data-ops/drizzle/haryanvibe-schema`
- ✅ Query functions created: `packages/data-ops/src/queries/haryanvibe.ts`
- ✅ Offset pagination with sort options (popularity, followers, releaseDate)
- ✅ Pagination decision documented in CLAUDE.md
- ✅ API routes: `/api/artists` and `/api/songs` working with remote D1
- ✅ OAuth fixed for local dev (baseURL + trustedOrigins in Better Auth)
- ✅ Watch mode scripts added for faster dev iteration
- ✅ Dev workflow: wrangler dev --remote (connects to production D1)
- D1 database tables already created and populated with data
- Tables: `haryanvibe_artists`, `haryanvibe_songs`, `song_artists`
- All artists/songs have required images
- No Spotify API integration yet (future phase)

## Next Steps
1. ✅ ~~Implement Phase 1 (Schema Integration)~~ - COMPLETE
2. ✅ ~~Brainstorm Phase 2 (Query Layer)~~ - COMPLETE
3. ✅ ~~Implement Phase 3A (Server Functions)~~ - COMPLETE
4. Brainstorm Phase 3B (Homepage UI) - finalize visual approach

## Blockers
None

## Key Files
- `packages/data-ops/src/drizzle/haryanvibe-schema.ts` - Haryanvi schema
- `packages/data-ops/src/queries/haryanvibe.ts` - Query functions (getArtists, getSongs)
- `packages/data-ops/src/auth/setup.ts` - Better Auth config (baseURL, trustedOrigins)
- `apps/user-application/src/routes/api/artists.tsx` - Artists API route
- `apps/user-application/src/routes/api/songs.tsx` - Songs API route
- `apps/user-application/src/server.ts` - Custom server entry (DB + Auth init)
- `apps/user-application/src/routes/index.tsx` - Homepage (Phase 3B)
- `haryanvi-analytics.rest` - API test requests
- `CLAUDE.md` - Pagination decision documented

## Delete After
Feature is merged and tested
