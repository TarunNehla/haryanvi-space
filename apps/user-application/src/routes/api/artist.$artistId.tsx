import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { initDatabase } from "@repo/data-ops/database/setup";
import { getArtistById, getArtistSongsByType } from "@repo/data-ops/queries/haryanvibe";

export const Route = createFileRoute("/api/artist/$artistId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { artistId } = params;
        const db = initDatabase(env.DB);

        const artist = await getArtistById(artistId, db);
        if (!artist) {
          return new Response("Artist not found", { status: 404 });
        }

        const popularSongsResult = await getArtistSongsByType(artistId, "popular", db, 1, 20);
        const recentSongsResult = await getArtistSongsByType(artistId, "recent", db, 1, 10);

        return Response.json({
          artist,
          popularSongs: {
            data: popularSongsResult.data,
            hasMore: popularSongsResult.hasNextPage,
          },
          recentSongs: {
            data: recentSongsResult.data,
            hasMore: recentSongsResult.hasNextPage,
          },
        });
      },
    },
  },
});
