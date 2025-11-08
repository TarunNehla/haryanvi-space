/**
 * HaryanVibe Database Mutations
 *
 * Insert and update operations for artists, songs, and song-artist relationships.
 */

import { eq, and } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import {
  haryanvibeArtists,
  haryanvibeSongs,
  songArtists,
  type NewArtist,
  type NewSong,
  type NewSongArtist,
} from "../drizzle/haryanvibe-schema";

// ============================================================================
// Artist Mutations
// ============================================================================

/**
 * Insert or update an artist
 *
 * Uses spotifyId as the conflict target. On conflict, updates all fields.
 *
 * @param db - Drizzle database instance
 * @param artist - Artist data to insert/update
 * @returns Inserted or updated artist
 */
export async function upsertArtist(
  db: DrizzleD1Database,
  artist: NewArtist
): Promise<void> {
  await db
    .insert(haryanvibeArtists)
    .values({
      ...artist,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: haryanvibeArtists.spotifyId,
      set: {
        name: artist.name,
        photoUrl: artist.photoUrl,
        popularity: artist.popularity,
        followers: artist.followers,
        spotifyUrl: artist.spotifyUrl,
        genres: artist.genres,
        updatedAt: new Date(),
      },
    });
}

/**
 * Bulk upsert multiple artists
 *
 * @param db - Drizzle database instance
 * @param artists - Array of artist data to insert/update
 */
export async function upsertArtists(
  db: DrizzleD1Database,
  artists: NewArtist[]
): Promise<void> {
  for (const artist of artists) {
    await upsertArtist(db, artist);
  }
}

// ============================================================================
// Song Mutations
// ============================================================================

/**
 * Insert or update a song
 *
 * Uses spotifyId as the conflict target. On conflict, updates all fields.
 *
 * @param db - Drizzle database instance
 * @param song - Song data to insert/update
 * @returns Inserted or updated song
 */
export async function upsertSong(
  db: DrizzleD1Database,
  song: NewSong
): Promise<void> {
  await db
    .insert(haryanvibeSongs)
    .values({
      ...song,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: haryanvibeSongs.spotifyId,
      set: {
        title: song.title,
        artists: song.artists,
        duration: song.duration,
        explicit: song.explicit,
        imageUrl: song.imageUrl,
        albumId: song.albumId,
        albumName: song.albumName,
        trackNumber: song.trackNumber,
        discNumber: song.discNumber,
        releaseDate: song.releaseDate,
        releaseDatePrecision: song.releaseDatePrecision,
        popularity: song.popularity,
        spotifyUrl: song.spotifyUrl,
        updatedAt: new Date(),
      },
    });
}

/**
 * Bulk upsert multiple songs
 *
 * @param db - Drizzle database instance
 * @param songs - Array of song data to insert/update
 */
export async function upsertSongs(
  db: DrizzleD1Database,
  songs: NewSong[]
): Promise<void> {
  for (const song of songs) {
    await upsertSong(db, song);
  }
}

// ============================================================================
// Song-Artist Junction Mutations
// ============================================================================

/**
 * Create song-artist relationship
 *
 * Checks if relationship already exists before inserting to avoid duplicates.
 *
 * @param db - Drizzle database instance
 * @param songId - Song ID
 * @param artistId - Artist ID
 * @param displayOrder - Display order for artist in song
 */
export async function createSongArtist(
  db: DrizzleD1Database,
  songId: string,
  artistId: string,
  displayOrder: number
): Promise<void> {
  // Check if relationship already exists
  const existing = await db
    .select()
    .from(songArtists)
    .where(
      and(
        eq(songArtists.songId, songId),
        eq(songArtists.artistId, artistId)
      )
    )
    .limit(1);

  if (existing.length === 0) {
    await db.insert(songArtists).values({
      songId,
      artistId,
      displayOrder,
    });
  }
}

/**
 * Create all song-artist relationships for a song
 *
 * @param db - Drizzle database instance
 * @param songId - Song ID
 * @param artistIds - Array of artist IDs in display order
 */
export async function createSongArtists(
  db: DrizzleD1Database,
  songId: string,
  artistIds: string[]
): Promise<void> {
  for (let i = 0; i < artistIds.length; i++) {
    const artistId = artistIds[i];
    if (artistId) {
      await createSongArtist(db, songId, artistId, i);
    }
  }
}

/**
 * Delete all song-artist relationships for a song
 *
 * Useful when re-syncing a song to update artist relationships.
 *
 * @param db - Drizzle database instance
 * @param songId - Song ID
 */
export async function deleteSongArtists(
  db: DrizzleD1Database,
  songId: string
): Promise<void> {
  await db.delete(songArtists).where(eq(songArtists.songId, songId));
}

/**
 * Delete and recreate all song-artist relationships for a song
 *
 * @param db - Drizzle database instance
 * @param songId - Song ID
 * @param artistIds - Array of artist IDs in display order
 */
export async function replaceSongArtists(
  db: DrizzleD1Database,
  songId: string,
  artistIds: string[]
): Promise<void> {
  await deleteSongArtists(db, songId);
  await createSongArtists(db, songId, artistIds);
}

// ============================================================================
// Delete Operations
// ============================================================================

/**
 * Delete a song by ID
 *
 * Cascades to song_artists junction records automatically via DB constraints.
 *
 * @param db - Drizzle database instance
 * @param songId - Song ID to delete
 */
export async function deleteSong(
  db: DrizzleD1Database,
  songId: string
): Promise<void> {
  await db.delete(haryanvibeSongs).where(eq(haryanvibeSongs.id, songId));
}

/**
 * Delete an artist by ID
 *
 * Cascades to song_artists junction records automatically via DB constraints.
 *
 * @param db - Drizzle database instance
 * @param artistId - Artist ID to delete
 */
export async function deleteArtist(
  db: DrizzleD1Database,
  artistId: string
): Promise<void> {
  await db.delete(haryanvibeArtists).where(eq(haryanvibeArtists.id, artistId));
}
