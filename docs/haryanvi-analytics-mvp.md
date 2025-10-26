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

### ⏳ Phase 3: Homepage UI (TODO - Needs Brainstorming)
- [ ] Design minimal list layout
- [ ] Implement server-side data fetching
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
- ✅ data-ops package built with schema + queries
- D1 database tables already created and populated with data
- Tables: `haryanvibe_artists`, `haryanvibe_songs`, `song_artists`
- All artists/songs have required images
- No Spotify API integration yet (future phase)

## Next Steps
1. ✅ ~~Implement Phase 1 (Schema Integration)~~ - COMPLETE
2. ✅ ~~Brainstorm Phase 2 (Query Layer)~~ - COMPLETE
3. Brainstorm Phase 3 (Homepage UI) - finalize visual approach, server functions

## Blockers
None

## Key Files
- `packages/data-ops/src/drizzle/haryanvibe-schema.ts` - Haryanvi schema
- `packages/data-ops/src/queries/haryanvibe.ts` - Query functions (getArtists, getSongs)
- `packages/data-ops/package.json` - Export paths configuration
- `apps/user-application/src/routes/index.tsx` - Homepage (Phase 3)
- `CLAUDE.md` - Pagination decision documented

## Delete After
Feature is merged and tested
