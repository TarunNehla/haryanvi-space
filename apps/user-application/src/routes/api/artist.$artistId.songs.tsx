import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { initDatabase } from "@repo/data-ops/database/setup";
import { getArtistById, getArtistSongsByType, type ArtistSongType } from "@repo/data-ops/queries/haryanvibe";

export const Route = createFileRoute("/api/artist/$artistId/songs")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { artistId } = params;
        const url = new URL(request.url);
        const type = (url.searchParams.get("type") as ArtistSongType) || "popular";
        const page = url.searchParams.get("page") ? Number(url.searchParams.get("page")) : 1;
        const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : 20;

        if (type !== "popular" && type !== "recent") {
          return new Response("Invalid type parameter. Must be 'popular' or 'recent'", { status: 400 });
        }

        const db = initDatabase(env.DB);

        const artist = await getArtistById(artistId, db);
        if (!artist) {
          return new Response("Artist not found", { status: 404 });
        }

        const result = await getArtistSongsByType(artistId, type, db, page, limit);

        return Response.json(result);
      },
    },
  },
});
