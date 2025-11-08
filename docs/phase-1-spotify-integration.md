# Phase 1: Spotify API Integration

## Goal
Replicate Python script logic in TypeScript using Cloudflare Workflows for reliable artist sync

## Python Script Flow (Reference)
1. Auth → Bearer token (Client Credentials)
2. Fetch albums (paginated, 50/page)
3. Batch fetch album details (20/batch)
4. Collect unique tracks (first-encountered dedup)
5. Batch fetch popularity (50/batch)
6. Transform → DB schema
7. Save to JSON

**Key params:**
- Market: IN
- Include: album,single,compilation,appears_on
- Rate limit: 2.5s delay
- Retry: 3 attempts, exponential backoff
- Batch: 20 albums, 50 tracks

---

## Spotify API Endpoints

### 1. Get Access Token
`POST https://accounts.spotify.com/api/token`
- Header: `Authorization: Basic {base64(clientId:clientSecret)}`
- Body: `grant_type=client_credentials`
- Returns: `{access_token, expires_in: 3600}`
- Cache token for 1hr

### 2. Get Artist Albums
`GET https://api.spotify.com/v1/artists/{id}/albums`
- Params: `market=IN, limit=50, offset=0, include_groups=album,single,compilation,appears_on`
- Paginate via offset until no `next` URL
- Returns: `{items: [...albums], next, total}`

### 3. Get Album Details (Batch)
`GET https://api.spotify.com/v1/albums?ids={ids}&market=IN`
- Max 20 IDs per request
- Returns: `{albums: [{id, name, tracks: {items: [...]}, images, release_date}]}`
- Includes track listings but NOT popularity

### 4. Get Tracks (Batch - For Popularity)
`GET https://api.spotify.com/v1/tracks?ids={ids}&market=IN`
- Max 50 IDs per request
- Returns: `{tracks: [{id, popularity}]}`
- Purpose: Fetch popularity separately

### 5. Get Artists (Batch - For Full Metadata) [OPTIONAL]
`GET https://api.spotify.com/v1/artists?ids={ids}`
- Max 50 IDs per request
- Returns: `{artists: [{id, name, images, popularity, followers, genres}]}`
- Purpose: Fetch complete artist metadata (popularity, followers, genres, high-res images)
- **When to use:** After syncing songs, enrich artist data with full details
- **Note:** Basic artist data (id, name, url) already comes from track.artists[], this is optional enhancement

---

## Data Mapping

### Spotify → haryanvibe_songs
- track.id → id, spotifyId
- track.name → title
- track.artists[] → artists (JSON: `{id, name, spotify_url}[]`)
- track.duration_ms → duration
- album.images[0].url → imageUrl
- album.id → albumId
- track.popularity → popularity (from separate call)
- album.release_date → releaseDate

### Spotify → haryanvibe_artists (Basic from track.artists[])
- artist.id → id, spotifyId
- artist.name → name
- artist.external_urls.spotify → spotifyUrl
- Set popularity/followers to 0 initially

### Spotify → haryanvibe_artists (Full from GET /artists - Optional)
- artist.popularity → popularity
- artist.followers.total → followers
- artist.images[0].url → photoUrl (high-res)
- artist.genres[] → genres (JSON array)

---

## File Structure

```
packages/data-ops/src/spotify/
├── client.ts         # Auth, token caching
├── types.ts          # Spotify response interfaces
├── api.ts            # fetchArtistAlbums, fetchAlbumsDetails, fetchTracksPopularity
└── transform.ts      # transformTrackToSchema, collectAndTransformSongs

packages/data-ops/src/queries/
└── haryanvibe-mutations.ts  # upsertArtist, upsertSongs, createSongArtists

apps/data-service/src/workflows/
└── sync-artist.ts    # SyncArtistWorkflow class

apps/data-service/src/hono/routes/
└── admin.ts          # POST /admin/sync-artist, GET /workflows/:id/status
```

---

## Implementation Flow

### client.ts
- getAccessToken(env) → Cache token, auto-refresh before expiry

### api.ts
- makeApiRequest() → Retry logic, handle 429 rate limits
- fetchArtistAlbums() → Paginate albums, return all
- fetchAlbumsDetails() → Batch 20 IDs, collect album details
- fetchTracksPopularity() → Batch 50 IDs, return Map<trackId, popularity>
- fetchArtistsMetadata() → Batch 50 IDs, get full artist data (optional)

### transform.ts
- transformTrackToSchema() → Map Spotify track → DB schema
- collectAndTransformSongs() → Deduplicate tracks, fetch popularity, transform all

### sync-artist.ts (Workflow)
- Step 1: Get token
- Step 2: Fetch albums
- Step 3: Fetch album details (batched)
- Step 4: Collect/transform songs (deduplicate, fetch popularity)
- Step 5: Upsert to D1 (artist, songs, song_artists junctions)
- Step 6 (optional): Fetch full artist metadata, enrich artist record
- Return: {success, artistId, songsAdded, albumsProcessed, error?}

### haryanvibe-mutations.ts
- upsertArtist() → Insert or update on conflict (spotifyId)
- upsertSongs() → Batch insert with conflict handling
- createSongArtists() → Insert junction if not exists

### admin.ts (Endpoints)
- POST /admin/sync-artist → Parse Spotify URL, enqueue Workflow, return workflowId
- GET /workflows/:id/status → Get Workflow status + output
- GET /workflows/:id/stream → SSE for real-time updates (later)

---

## Key Implementation Details

**Token caching:** Cache in memory with expiry timestamp (expires_in - 60s buffer)

**Rate limiting:** 2.5s delay between API calls via sleep()

**Retry logic:** Catch errors, retry up to 3x with exponential backoff (5s base)

**429 handling:** Check Retry-After header, wait specified duration, retry

**Deduplication:** Use Map/Set to store first-encountered track per ID

**Batch processing:** Slice IDs into chunks (20 for albums, 50 for tracks), process sequentially

**Error handling:** Try-catch at Workflow level, return error in output, don't throw

**Upsert strategy:** Use onConflictDoUpdate with spotifyId as target

**Junction records:** Check existing before insert to avoid duplicates

**Artist metadata enrichment (optional):** After inserting songs, collect unique artist IDs, batch fetch full metadata (50/request), update artist records with popularity, followers, genres, photoUrl

---

## Environment Setup

**Wrangler secrets:**
- SPOTIFY_CLIENT_ID
- SPOTIFY_CLIENT_SECRET

**Add via CLI:**
```bash
wrangler secret put SPOTIFY_CLIENT_ID
wrangler secret put SPOTIFY_CLIENT_SECRET
```

---

## Testing Checklist

- [ ] Token caching works (no re-auth on 2nd call)
- [ ] Pagination handles >50 albums
- [ ] Batch fetching works for 20+ albums
- [ ] Deduplication removes track duplicates
- [ ] Rate limiting delays applied
- [ ] Retry logic handles failures
- [ ] 429 responses trigger backoff
- [ ] Transform matches Python output
- [ ] Upsert prevents duplicates
- [ ] Workflow completes for small artist (10 songs)
- [ ] Workflow completes for large artist (100+ songs)
- [ ] Admin endpoint parses URLs correctly
- [ ] Optional: Full artist metadata fetched (popularity, followers, genres)

---

## Differences from Python

| Aspect | Python | TypeScript |
|--------|--------|------------|
| Execution | CLI | Cloudflare Workflow |
| Storage | JSON files | D1 database |
| Resumability | Manual tracking | Built-in Workflow state |
| Progress | Console logs | SSE endpoint |
| Error handling | Log to file | Return in output |

---

## Performance Estimates

**Small artist (50 songs, 10 albums):** ~15-20s
- Albums: 5s
- Album details: 5s (2 batches)
- Popularity: 5s (1 batch)

**Large artist (500 songs, 50 albums):** ~60-70s
- Albums: 10s
- Album details: 20s (3 batches)
- Popularity: 30s (10 batches)

No timeout risk with Workflows (no CPU limit unlike regular Workers)

---

## Next Steps

1. Create spotify/ directory in data-ops
2. Implement auth + token caching
3. Add API call functions with retry/rate limit
4. Add transform logic
5. Create DB mutations
6. Define Workflow
7. Add admin endpoints
8. Test with small artist
9. Optional: Add full artist metadata enrichment
10. Deploy
