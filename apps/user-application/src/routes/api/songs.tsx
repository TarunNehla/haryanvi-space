import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { initDatabase } from "@repo/data-ops/database/setup";
import { getSongs, type SongQueryParams, type SongSortField, type SortOrder } from "@repo/data-ops/queries/haryanvibe";

export const Route = createFileRoute("/api/songs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const params: SongQueryParams = {
          page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined,
          limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
          sortBy: (url.searchParams.get("sortBy") as SongSortField) || undefined,
          order: (url.searchParams.get("order") as SortOrder) || undefined,
        };

        const db = initDatabase(env.DB);
        const result = await getSongs(db, params);

        return Response.json(result);
      },
    },
  },
});
