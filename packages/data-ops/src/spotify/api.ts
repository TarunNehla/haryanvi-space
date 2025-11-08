/**
 * Spotify API Functions
 *
 * API call functions with retry logic, rate limiting, and 429 handling.
 */

import type {
  SpotifyAlbumSimple,
  SpotifyAlbumFull,
  SpotifyAlbumsBatchResponse,
  SpotifyTracksBatchResponse,
  SpotifyArtistsBatchResponse,
  SpotifyArtistAlbumsResponse,
  SpotifyArtistFull,
} from "./types";

// ============================================================================
// Constants
// ============================================================================

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const RATE_LIMIT_DELAY_MS = 2500; // 2.5 seconds
const RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 5000; // 5 seconds

const ALBUMS_BATCH_SIZE = 20;
const TRACKS_BATCH_SIZE = 50;
const ARTISTS_BATCH_SIZE = 50;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Sleep for specified milliseconds
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Apply rate limiting delay between API calls
 */
async function rateLimitDelay(): Promise<void> {
  await sleep(RATE_LIMIT_DELAY_MS);
}

/**
 * Make API request with retry logic and rate limit handling
 */
async function makeApiRequest<T>(
  url: string,
  accessToken: string,
  retryCount = 0
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Handle rate limiting (429)
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000; // Default to 60s
      console.log(`Rate limited. Waiting ${waitTime / 1000}s...`);
      await sleep(waitTime);
      return makeApiRequest<T>(url, accessToken, retryCount);
    }

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (retryCount < RETRY_ATTEMPTS) {
      const delayMs = RETRY_BASE_DELAY_MS * (retryCount + 1);
      console.log(
        `Request failed, retrying (${retryCount + 1}/${RETRY_ATTEMPTS}) after ${delayMs / 1000}s...`
      );
      await sleep(delayMs);
      return makeApiRequest<T>(url, accessToken, retryCount + 1);
    }

    throw new Error(
      `API request failed after ${RETRY_ATTEMPTS} attempts: ${error}`
    );
  }
}

// ============================================================================
// Artist Functions
// ============================================================================

/**
 * Fetch all albums for an artist with pagination
 *
 * @param artistId - Spotify artist ID
 * @param accessToken - Valid access token
 * @param market - Market code (default: IN)
 * @returns Array of album objects
 */
export async function fetchArtistAlbums(
  artistId: string,
  accessToken: string,
  market = "IN"
): Promise<SpotifyAlbumSimple[]> {
  const allAlbums: SpotifyAlbumSimple[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const params = new URLSearchParams({
      market,
      limit: limit.toString(),
      offset: offset.toString(),
      include_groups: "album,single,compilation,appears_on",
    });

    const url = `${SPOTIFY_API_BASE}/artists/${artistId}/albums?${params}`;
    const data = await makeApiRequest<SpotifyArtistAlbumsResponse>(
      url,
      accessToken
    );

    const albums = data.items || [];
    allAlbums.push(...albums);

    // Check if we have more pages
    if (!data.next || albums.length < limit) {
      break;
    }

    offset += albums.length;
    await rateLimitDelay();
  }

  return allAlbums;
}

/**
 * Fetch full artist metadata (popularity, followers, genres, images)
 *
 * @param artistIds - Array of Spotify artist IDs (max 50)
 * @param accessToken - Valid access token
 * @returns Array of artist objects with full metadata
 */
export async function fetchArtistsMetadata(
  artistIds: string[],
  accessToken: string
): Promise<SpotifyArtistFull[]> {
  const allArtists: SpotifyArtistFull[] = [];

  // Process in batches of 50
  for (let i = 0; i < artistIds.length; i += ARTISTS_BATCH_SIZE) {
    const batch = artistIds.slice(i, i + ARTISTS_BATCH_SIZE);
    const params = new URLSearchParams({
      ids: batch.join(","),
    });

    const url = `${SPOTIFY_API_BASE}/artists?${params}`;
    const data = await makeApiRequest<SpotifyArtistsBatchResponse>(
      url,
      accessToken
    );

    // Filter out null values
    const artists = data.artists.filter(
      (a): a is SpotifyArtistFull => a !== null
    );
    allArtists.push(...artists);

    // Rate limit delay between batches (except last batch)
    if (i + ARTISTS_BATCH_SIZE < artistIds.length) {
      await rateLimitDelay();
    }
  }

  return allArtists;
}

// ============================================================================
// Album Functions
// ============================================================================

/**
 * Fetch detailed information for multiple albums in batches
 *
 * @param albumIds - Array of album IDs
 * @param accessToken - Valid access token
 * @param market - Market code (default: IN)
 * @returns Array of detailed album objects
 */
export async function fetchAlbumsDetails(
  albumIds: string[],
  accessToken: string,
  market = "IN"
): Promise<SpotifyAlbumFull[]> {
  const allDetails: SpotifyAlbumFull[] = [];

  // Process in batches of 20
  for (let i = 0; i < albumIds.length; i += ALBUMS_BATCH_SIZE) {
    const batch = albumIds.slice(i, i + ALBUMS_BATCH_SIZE);
    const params = new URLSearchParams({
      market,
      ids: batch.join(","),
    });

    const url = `${SPOTIFY_API_BASE}/albums?${params}`;
    const data = await makeApiRequest<SpotifyAlbumsBatchResponse>(
      url,
      accessToken
    );

    // Filter out null values
    const albums = data.albums.filter((a): a is SpotifyAlbumFull => a !== null);
    allDetails.push(...albums);

    // Rate limit delay between batches (except last batch)
    if (i + ALBUMS_BATCH_SIZE < albumIds.length) {
      await rateLimitDelay();
    }
  }

  return allDetails;
}

// ============================================================================
// Track Functions
// ============================================================================

/**
 * Fetch popularity scores for multiple tracks in batches
 *
 * @param trackIds - Array of track IDs
 * @param accessToken - Valid access token
 * @param market - Market code (default: IN)
 * @returns Map of track ID to popularity score
 */
export async function fetchTracksPopularity(
  trackIds: string[],
  accessToken: string,
  market = "IN"
): Promise<Map<string, number>> {
  const popularityMap = new Map<string, number>();

  // Process in batches of 50
  for (let i = 0; i < trackIds.length; i += TRACKS_BATCH_SIZE) {
    const batch = trackIds.slice(i, i + TRACKS_BATCH_SIZE);
    const params = new URLSearchParams({
      market,
      ids: batch.join(","),
    });

    const url = `${SPOTIFY_API_BASE}/tracks?${params}`;
    const data = await makeApiRequest<SpotifyTracksBatchResponse>(
      url,
      accessToken
    );

    // Map track ID to popularity
    for (const track of data.tracks) {
      if (track) {
        popularityMap.set(track.id, track.popularity || 0);
      }
    }

    // Rate limit delay between batches (except last batch)
    if (i + TRACKS_BATCH_SIZE < trackIds.length) {
      await rateLimitDelay();
    }
  }

  return popularityMap;
}
