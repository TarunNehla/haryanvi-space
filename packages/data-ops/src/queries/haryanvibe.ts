import { desc, asc } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { haryanvibeArtists, haryanvibeSongs, type Artist, type Song } from "../drizzle/haryanvibe-schema";

export type ArtistSortField = "popularity" | "followers";
export type SongSortField = "popularity" | "releaseDate";
export type SortOrder = "asc" | "desc";

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
