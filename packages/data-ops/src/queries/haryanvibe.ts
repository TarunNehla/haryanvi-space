import { desc, asc, eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { haryanvibeArtists, haryanvibeSongs, songArtists, type Artist, type Song } from "../drizzle/haryanvibe-schema";

export type ArtistSortField = "popularity" | "followers";
export type SongSortField = "popularity" | "releaseDate";
export type SortOrder = "asc" | "desc";
export type ArtistSongType = "popular" | "recent";

export type ArtistQueryParams = {
  page?: number;
  limit?: number;
  sortBy?: ArtistSortField;
  order?: SortOrder;
};

export type SongQueryParams = {
  page?: number;
  limit?: number;
  sortBy?: SongSortField;
  order?: SortOrder;
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  hasNextPage: boolean;
};

export async function getArtists(
  db: DrizzleD1Database,
  params: ArtistQueryParams = {}
): Promise<PaginatedResponse<Artist>> {
  const { page = 1, limit = 20, sortBy = "popularity", order = "desc" } = params;

  const offset = (page - 1) * limit;
  const sortField = haryanvibeArtists[sortBy];
  const sortFn = order === "desc" ? desc : asc;

  const results = await db
    .select()
    .from(haryanvibeArtists)
    .orderBy(sortFn(sortField), asc(haryanvibeArtists.id))
    .limit(limit + 1)
    .offset(offset);

  const hasNextPage = results.length > limit;
  const data = hasNextPage ? results.slice(0, limit) : results;

  return { data, page, hasNextPage };
}

export async function getSongs(
  db: DrizzleD1Database,
  params: SongQueryParams = {}
): Promise<PaginatedResponse<Song>> {
  const { page = 1, limit = 20, sortBy = "popularity", order = "desc" } = params;

  const offset = (page - 1) * limit;
  const sortField = haryanvibeSongs[sortBy];
  const sortFn = order === "desc" ? desc : asc;

  const results = await db
    .select()
    .from(haryanvibeSongs)
    .orderBy(sortFn(sortField), asc(haryanvibeSongs.id))
    .limit(limit + 1)
    .offset(offset);

  const hasNextPage = results.length > limit;
  const data = hasNextPage ? results.slice(0, limit) : results;

  return { data, page, hasNextPage };
}

export async function getArtistById(
  artistId: string,
  db: DrizzleD1Database
): Promise<Artist | null> {
  const result = await db
    .select()
    .from(haryanvibeArtists)
    .where(eq(haryanvibeArtists.id, artistId))
    .limit(1);

  return result[0] ?? null;
}

export async function getArtistSongsByType(
  artistId: string,
  type: ArtistSongType,
  db: DrizzleD1Database,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Song>> {
  const offset = (page - 1) * limit;

  const sortField = type === "popular" ? haryanvibeSongs.popularity : haryanvibeSongs.releaseDate;

  const results = await db
    .select({
      id: haryanvibeSongs.id,
      title: haryanvibeSongs.title,
      artists: haryanvibeSongs.artists,
      duration: haryanvibeSongs.duration,
      explicit: haryanvibeSongs.explicit,
      imageUrl: haryanvibeSongs.imageUrl,
      albumId: haryanvibeSongs.albumId,
      albumName: haryanvibeSongs.albumName,
      trackNumber: haryanvibeSongs.trackNumber,
      discNumber: haryanvibeSongs.discNumber,
      releaseDate: haryanvibeSongs.releaseDate,
      releaseDatePrecision: haryanvibeSongs.releaseDatePrecision,
      popularity: haryanvibeSongs.popularity,
      spotifyUrl: haryanvibeSongs.spotifyUrl,
      spotifyId: haryanvibeSongs.spotifyId,
      createdAt: haryanvibeSongs.createdAt,
      updatedAt: haryanvibeSongs.updatedAt,
    })
    .from(songArtists)
    .innerJoin(haryanvibeSongs, eq(songArtists.songId, haryanvibeSongs.id))
    .where(eq(songArtists.artistId, artistId))
    .orderBy(desc(sortField), asc(haryanvibeSongs.id))
    .limit(limit + 1)
    .offset(offset);

  const hasNextPage = results.length > limit;
  const data = hasNextPage ? results.slice(0, limit) : results;

  return { data, page, hasNextPage };
}

/**
 * Get recently added or updated artists
 *
 * @param db - Drizzle database instance
 * @param limit - Number of artists to return
 * @returns Array of recent artists
 */
export async function getRecentArtists(
  db: DrizzleD1Database,
  limit = 10
): Promise<Artist[]> {
  return await db
    .select()
    .from(haryanvibeArtists)
    .orderBy(desc(haryanvibeArtists.updatedAt), desc(haryanvibeArtists.createdAt))
    .limit(limit);
}

/**
 * Get recently added or updated songs
 *
 * @param db - Drizzle database instance
 * @param limit - Number of songs to return
 * @returns Array of recent songs
 */
export async function getRecentSongs(
  db: DrizzleD1Database,
  limit = 10
): Promise<Song[]> {
  return await db
    .select()
    .from(haryanvibeSongs)
    .orderBy(desc(haryanvibeSongs.updatedAt), desc(haryanvibeSongs.createdAt))
    .limit(limit);
}
