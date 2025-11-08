import { useQuery } from "@tanstack/react-query";
import type {
  Artist,
  Song,
} from "@repo/data-ops/drizzle/haryanvibe-schema";

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  hasNextPage: boolean;
}

async function fetchArtists(params: {
  limit?: number;
  sortBy?: "popularity" | "followers";
  order?: "asc" | "desc";
}): Promise<PaginatedResponse<Artist>> {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.order) searchParams.set("order", params.order);

  const response = await fetch(`/api/artists?${searchParams.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch artists");
  return response.json();
}

async function fetchSongs(params: {
  limit?: number;
  sortBy?: "popularity" | "releaseDate";
  order?: "asc" | "desc";
}): Promise<PaginatedResponse<Song>> {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.order) searchParams.set("order", params.order);

  const response = await fetch(`/api/songs?${searchParams.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch songs");
  return response.json();
}

export function usePopularArtists(limit = 5) {
  return useQuery({
    queryKey: ["artists", "popular", limit],
    queryFn: () =>
      fetchArtists({ limit, sortBy: "popularity", order: "desc" }),
  });
}

export function useFollowedArtists(limit = 5) {
  return useQuery({
    queryKey: ["artists", "followers", limit],
    queryFn: () => fetchArtists({ limit, sortBy: "followers", order: "desc" }),
  });
}

export function usePopularSongs(limit = 5) {
  return useQuery({
    queryKey: ["songs", "popular", limit],
    queryFn: () => fetchSongs({ limit, sortBy: "popularity", order: "desc" }),
  });
}

export function useLatestSongs(limit = 5) {
  return useQuery({
    queryKey: ["songs", "latest", limit],
    queryFn: () =>
      fetchSongs({ limit, sortBy: "releaseDate", order: "desc" }),
  });
}
