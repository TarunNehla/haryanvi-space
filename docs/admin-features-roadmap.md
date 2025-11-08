# Feature: Admin Data Management System

## Context
Building comprehensive admin features to manage artists/songs via Spotify API integration, enable song version grouping (lofi/slowed variants), and add YouTube video integration. Currently app is read-only analytics platform with static D1 data. Need dynamic data management for growth.

## Phases

### ⏳ Phase 1: Spotify API Integration (TODO)
**Goal:** Fetch artist/song data from Spotify via Cloudflare Workflows

**Backend (data-service):**
- [ ] Setup Spotify client credentials in wrangler secrets
- [ ] Create Spotify client (`packages/data-ops/src/spotify/`)
  - [ ] `client.ts` - Auth flow (Client Credentials, token caching)
  - [ ] `types.ts` - Spotify API response types
  - [ ] `api.ts` - getArtistAlbums(), getAlbumsDetails(), getTracksPopularity()
  - [ ] `transform.ts` - Transform Spotify data → DB schema
- [ ] Design Workflow (`apps/data-service/src/workflows/sync-artist.ts`)
  - [ ] Fetch albums (paginated, includes: album,single,compilation,appears_on)
  - [ ] Batch fetch album details (20 per batch)
  - [ ] Batch fetch track popularity (50 per batch)
  - [ ] Deduplicate tracks (first-encountered strategy)
  - [ ] Upsert artists, songs, song_artists junction records
  - [ ] Handle rate limiting (2.5s delays) + retry logic (3 attempts)
- [ ] Create database mutations (`packages/data-ops/src/queries/haryanvibe-mutations.ts`)
  - [ ] upsertArtist() - Insert/update by spotifyId
  - [ ] upsertSongs() - Bulk insert with conflict handling
  - [ ] createSongArtists() - Junction records
- [ ] Admin endpoints (`apps/data-service/src/hono/routes/admin.ts`)
  - [ ] POST /admin/sync-artist (enqueues Workflow)
  - [ ] GET /admin/workflows/:id/status (polling endpoint)
  - [ ] GET /admin/workflows/:id/stream (SSE real-time updates)
- [ ] Test with small artist (~10 songs), verify D1 data

**Timeline:** 3-5 days

---

### ⏳ Phase 2: Admin CRUD + Dashboard UI (TODO)
**Goal:** Full admin interface for manual data management

**Backend (data-service):**
- [ ] CRUD endpoints (`apps/data-service/src/hono/routes/admin.ts`)
  - [ ] POST /admin/songs/add-single (fetch single track from Spotify)
  - [ ] DELETE /admin/songs/:id (cascade delete song_artists)
  - [ ] DELETE /admin/artists/:id (delete artist + junctions)
  - [ ] GET /admin/artists/recent (dashboard stats)
  - [ ] GET /admin/songs/recent (dashboard stats)
- [ ] Query functions (data-ops mutations)
  - [ ] deleteSong(), deleteArtist()
  - [ ] getRecentArtists(), getRecentSongs()

**Frontend (user-application):**
- [ ] Admin dashboard routes (`apps/user-application/src/routes/_auth/app/admin/`)
  - [ ] `route.tsx` - Layout with tabs
  - [ ] `index.tsx` - Overview (stats, recent activity)
  - [ ] `artists.tsx` - Artist management table
  - [ ] `songs.tsx` - Song management table
  - [ ] `workflows.tsx` - Workflow monitoring
- [ ] Admin components (`apps/user-application/src/components/admin/`)
  - [ ] AddArtistForm.tsx (Spotify URL input, triggers Workflow, SSE progress)
  - [ ] AddSongForm.tsx (single track URL, immediate add)
  - [ ] ArtistTable.tsx (search, filter, delete, re-sync buttons)
  - [ ] SongTable.tsx (search, filter, delete, artist links)
  - [ ] WorkflowMonitor.tsx (live progress bar via SSE)
- [ ] SSE integration (`apps/user-application/src/lib/sse.ts`)
  - [ ] useWorkflowStatus(workflowId) hook
  - [ ] Real-time UI updates

**Timeline:** 5-7 days

---

### ⏳ Phase 3: Song Versions Grouping (TODO)
**Goal:** Group alternate versions (lofi, slowed, reverb) under original song

**Backend:**
- [ ] Schema migration (data-ops)
  - [ ] Add originalSongId (nullable FK to songs.id)
  - [ ] Add versionType (text: 'lofi'|'slowed'|'reverb'|'sped_up'|'acoustic')
  - [ ] Add index on originalSongId
  - [ ] Self-referencing FK with ON DELETE SET NULL
- [ ] Version detection (`packages/data-ops/src/versions/`)
  - [ ] `detector.ts` - Regex patterns for version detection
  - [ ] `ai-classifier.ts` - OpenRouter integration for uncertain cases
  - [ ] `grouper.ts` - Hybrid logic (regex first, AI for edge cases)
  - [ ] Cache AI results in D1 table
- [ ] Workflow (`apps/data-service/src/workflows/group-versions.ts`)
  - [ ] Input: artistId
  - [ ] Run hybrid grouper
  - [ ] Update originalSongId + versionType
  - [ ] Return grouping stats
- [ ] Endpoint (data-service)
  - [ ] POST /admin/artists/:id/group-versions

**Frontend:**
- [ ] Update ArtistTable.tsx (add "Group Versions" button)
- [ ] Update SongTable.tsx (expandable rows for versions)
- [ ] Create VersionGroup.tsx component (collapsible version list)
- [ ] Update queries (getSongsGrouped, getArtistSongsGrouped)

**Timeline:** 4-6 days

---

### ⏳ Phase 4: YouTube Integration (TODO)
**Goal:** Display YouTube videos for each song

**Backend:**
- [ ] Schema migration (data-ops)
  - [ ] Add youtubeUrl, youtubeVideoId (nullable)
  - [ ] Add youtubeMetadata (JSON: title, channelName, thumbnail, fetchedAt)
- [ ] YouTube client (`packages/data-ops/src/youtube/`)
  - [ ] `client.ts` - YouTube Data API v3 setup
  - [ ] `ai-picker.ts` - OpenRouter picks best video from search results
  - [ ] Cache decisions
- [ ] Workflow (`apps/data-service/src/workflows/fetch-youtube.ts`)
  - [ ] Input: artistId
  - [ ] For each song: search YouTube → AI picks → update DB
  - [ ] Handle rate limits (10K quota/day)
  - [ ] Track progress for SSE
- [ ] Endpoints (data-service)
  - [ ] POST /admin/artists/:id/fetch-youtube
  - [ ] GET /admin/youtube/quota

**Frontend:**
- [ ] Update ArtistTable.tsx (add "Fetch YouTube" button)
- [ ] Update SongTable.tsx (YouTube icon, preview modal)
- [ ] Create YouTubePlayer.tsx component
- [ ] Create song detail route (`/_auth/app/song/$songId.tsx`)
- [ ] Update queries (getSongWithYoutube, getArtistSongsWithYoutube)

**Timeline:** 3-5 days

---

## Git Branching Strategy

**Approach:** Independent feature branches off `main`, deploy after each phase

**Branch naming:** `feat/{descriptive-name}`

**Flow:**
- Phase 1: `feat/spotify-api-integration` → main → deploy
- Phase 2: `feat/admin-dashboard` → main → deploy
- Phase 3: `feat/song-version-grouping` → main → deploy
- Phase 4: `feat/youtube-integration` → main → deploy

**Per-phase cycle:**
1. Create branch from latest main
2. Develop + test
3. PR → review → merge (squash)
4. Deploy to production
5. Start next phase

**Benefits:** Incremental deployment, small PRs, production feedback between phases, always-deployable main

---

## Current State
- Read-only analytics platform
- Static D1 database (pre-populated via Python scripts)
- Offset pagination for songs/artists
- No admin features or external API integrations
- User auth via Better Auth (Google OAuth)
- Spotify scraper Python scripts exist as reference

## Next Steps
1. Review Phase 1 detailed implementation guide
2. Setup Spotify Developer credentials
3. Implement Spotify client in data-ops package
4. Build sync-artist Workflow
5. Create admin endpoint + test with small artist
6. Deploy Phase 1 → move to Phase 2

## Blockers
None currently. Spotify Developer account ready.

## Key Files

### Existing
- `packages/data-ops/src/drizzle/haryanvibe-schema.ts` - DB schema
- `packages/data-ops/src/queries/haryanvibe.ts` - Read queries
- `apps/data-service/src/hono/app.ts` - Hono router
- `apps/data-service/wrangler.jsonc` - Workflows config
- `spotify-scrapper/fetch_all_artists_songs.py` - Reference implementation

### To Create (Phase 1)
- `packages/data-ops/src/spotify/client.ts`
- `packages/data-ops/src/spotify/types.ts`
- `packages/data-ops/src/spotify/api.ts`
- `packages/data-ops/src/spotify/transform.ts`
- `packages/data-ops/src/queries/haryanvibe-mutations.ts`
- `apps/data-service/src/workflows/sync-artist.ts`
- `apps/data-service/src/hono/routes/admin.ts`

### To Create (Phase 2)
- `apps/user-application/src/routes/_auth/app/admin/*`
- `apps/user-application/src/components/admin/*`
- `apps/user-application/src/lib/sse.ts`

### To Create (Phase 3)
- `packages/data-ops/src/versions/detector.ts`
- `packages/data-ops/src/versions/ai-classifier.ts`
- `packages/data-ops/src/versions/grouper.ts`
- `apps/data-service/src/workflows/group-versions.ts`

### To Create (Phase 4)
- `packages/data-ops/src/youtube/client.ts`
- `packages/data-ops/src/youtube/ai-picker.ts`
- `apps/data-service/src/workflows/fetch-youtube.ts`
- `apps/user-application/src/routes/_auth/app/song/$songId.tsx`

## Architecture Decisions

**Endpoint Separation:**
- user-application: All READ operations (GET /api/songs, /api/artists)
- data-service: All WRITE operations + external APIs (Spotify, YouTube, AI)

**Data Management:**
- No manual form entry - all data from Spotify API
- No edit functionality - only add/delete/re-sync
- No filtering for MVP - store all Spotify data
- First-encountered deduplication for tracks in multiple albums
- Include "appears_on" albums (featured artist tracks)

**Workflows:**
- Use Cloudflare Workflows for all long-running operations
- Real-time progress via Server-Sent Events (SSE)
- Manual triggers for version grouping & YouTube fetch

**Version Grouping:**
- Hybrid approach: Regex for obvious patterns, AI for uncertain cases
- Self-referencing FK in songs table (originalSongId)
- Expandable rows UI pattern

**YouTube Integration:**
- One-time sync per song (5K songs = acceptable with quotas)
- AI-assisted video selection (prefer audio-only, official, not live/cover)
- OpenRouter free/cheap models

**Admin Access:**
- Public for development (no RBAC)
- Add role-based permissions before production launch
- Dashboard at `/_auth/app/admin` (requires Google OAuth)

**APIs & Dependencies:**
- Spotify Web API (Client Credentials flow)
- YouTube Data API v3
- OpenRouter (for AI classification)
- All API keys in wrangler secrets

## Total Timeline
15-23 days for complete MVP (all 4 phases)

## Delete After
Feature is merged, tested in production, and documentation moved to main README or wiki.
