import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { initDatabase } from "@repo/data-ops/database/setup";
import { getArtists, type ArtistQueryParams, type ArtistSortField, type SortOrder } from "@repo/data-ops/queries/haryanvibe";

export const Route = createFileRoute("/api/artists")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const params: ArtistQueryParams = {
          page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined,
          limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
          sortBy: (url.searchParams.get("sortBy") as ArtistSortField) || undefined,
          order: (url.searchParams.get("order") as SortOrder) || undefined,
        };

        const db = initDatabase(env.DB);
        const result = await getArtists(db, params);

        return Response.json(result);
      },
    },
  },
});
