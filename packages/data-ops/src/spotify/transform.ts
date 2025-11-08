/**
 * Spotify Data Transformation
 *
 * Transform Spotify API responses to HaryanVibe database schema format.
 */

import type {
  SpotifyAlbumFull,
  SpotifyTrackSimple,
  SpotifyArtistFull,
} from "./types";
import type { NewSong, NewArtist, ArtistInSong } from "../drizzle/haryanvibe-schema";

// ============================================================================
// Song Transformation
// ============================================================================

/**
 * Transform Spotify track data to HaryanVibe song schema
 *
 * @param track - Spotify track object
 * @param album - Album containing the track
 * @param popularity - Track popularity score (from separate API call)
 * @returns Transformed song object matching DB schema
 */
export function transformTrackToSchema(
  track: SpotifyTrackSimple,
  album: SpotifyAlbumFull,
  popularity: number
): NewSong {
  // Extract artists array
  const artists: ArtistInSong[] = track.artists.map((artist) => ({
    id: artist.id,
    name: artist.name,
    spotify_url: artist.external_urls.spotify,
  }));

  // Get best quality image (first image is typically highest resolution)
  const imageUrl = album.images.length > 0 && album.images[0] ? album.images[0].url : "";

  return {
    id: track.id,
    title: track.name,
    artists,
    duration: track.duration_ms,
    explicit: track.explicit,
    imageUrl,
    albumId: album.id,
    albumName: album.name,
    trackNumber: track.track_number,
    discNumber: track.disc_number,
    releaseDate: album.release_date,
    releaseDatePrecision: album.release_date_precision,
    popularity,
    spotifyUrl: track.external_urls.spotify,
    spotifyId: track.id,
  };
}

/**
 * Collect unique tracks from albums and transform to schema
 *
 * Implements first-encountered deduplication strategy:
 * If a track appears in multiple albums, only the first occurrence is kept.
 *
 * @param albumsDetails - Array of detailed album objects
 * @param popularityMap - Map of track ID to popularity score
 * @returns Array of transformed song objects
 */
export function collectAndTransformSongs(
  albumsDetails: SpotifyAlbumFull[],
  popularityMap: Map<string, number>
): NewSong[] {
  // Collect all unique tracks (first-encountered deduplication)
  const tracksMap = new Map<
    string,
    { track: SpotifyTrackSimple; album: SpotifyAlbumFull }
  >();

  for (const album of albumsDetails) {
    if (!album || !album.tracks || !album.tracks.items) {
      continue;
    }

    for (const track of album.tracks.items) {
      if (track && track.id && !tracksMap.has(track.id)) {
        // Store first occurrence only
        tracksMap.set(track.id, { track, album });
      }
    }
  }

  // Transform all tracks to schema
  const transformedSongs: NewSong[] = [];

  for (const [trackId, { track, album }] of tracksMap.entries()) {
    const popularity = popularityMap.get(trackId) || 0;
    const transformedSong = transformTrackToSchema(track, album, popularity);
    transformedSongs.push(transformedSong);
  }

  return transformedSongs;
}

// ============================================================================
// Artist Transformation
// ============================================================================

/**
 * Transform Spotify artist data to HaryanVibe artist schema
 *
 * @param artist - Spotify artist object with full metadata
 * @returns Transformed artist object matching DB schema
 */
export function transformArtistToSchema(artist: SpotifyArtistFull): NewArtist {
  // Get best quality photo (first image is typically highest resolution)
  const photoUrl = artist.images.length > 0 && artist.images[0] ? artist.images[0].url : "";

  // Serialize genres as JSON string
  const genres = artist.genres.length > 0 ? JSON.stringify(artist.genres) : null;

  return {
    id: artist.id,
    name: artist.name,
    photoUrl,
    popularity: artist.popularity || 0,
    followers: artist.followers?.total || 0,
    spotifyUrl: artist.external_urls.spotify,
    spotifyId: artist.id,
    genres,
  };
}

/**
 * Extract unique artist IDs from songs
 *
 * @param songs - Array of transformed songs
 * @returns Array of unique artist IDs
 */
export function extractUniqueArtistIds(songs: NewSong[]): string[] {
  const artistIds = new Set<string>();

  for (const song of songs) {
    for (const artist of song.artists) {
      artistIds.add(artist.id);
    }
  }

  return Array.from(artistIds);
}

/**
 * Create basic artist records from song artist data
 *
 * Used as fallback if full artist metadata fetch fails.
 *
 * @param songs - Array of transformed songs
 * @returns Array of basic artist objects
 */
export function createBasicArtistsFromSongs(songs: NewSong[]): NewArtist[] {
  const artistsMap = new Map<string, ArtistInSong>();

  // Collect unique artists from all songs
  for (const song of songs) {
    for (const artist of song.artists) {
      if (!artistsMap.has(artist.id)) {
        artistsMap.set(artist.id, artist);
      }
    }
  }

  // Transform to basic artist records
  return Array.from(artistsMap.values()).map((artist) => ({
    id: artist.id,
    name: artist.name,
    photoUrl: "", // No photo available from basic data
    popularity: 0,
    followers: 0,
    spotifyUrl: artist.spotify_url,
    spotifyId: artist.id,
    genres: null,
  }));
}
