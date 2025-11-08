/**
 * Sync Artist Workflow
 *
 * Cloudflare Workflow to sync artist and song data from Spotify to D1 database.
 */

import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { initDatabase } from "@repo/data-ops/database/setup";

// Spotify API functions
import { getAccessToken } from "@repo/data-ops/spotify/client";
import {
  fetchArtistAlbums,
  fetchAlbumsDetails,
  fetchTracksPopularity,
  fetchArtistsMetadata,
} from "@repo/data-ops/spotify/api";
import {
  collectAndTransformSongs,
  transformArtistToSchema,
  extractUniqueArtistIds,
  createBasicArtistsFromSongs,
} from "@repo/data-ops/spotify/transform";

// Database mutations
import {
  upsertArtist,
  upsertSongs,
  replaceSongArtists,
} from "@repo/data-ops/queries/haryanvibe-mutations";

// ============================================================================
// Workflow Input/Output Types
// ============================================================================

export interface SyncArtistParams {
  artistId: string;
}

export interface SyncArtistResult {
  success: boolean;
  artistId: string;
  artistName: string;
  songsAdded: number;
  albumsProcessed: number;
  error?: string;
}

// ============================================================================
// Workflow Class
// ============================================================================

export class SyncArtistWorkflow extends WorkflowEntrypoint<
  Env,
  SyncArtistParams
> {
  async run(
    event: Readonly<WorkflowEvent<SyncArtistParams>>,
    step: WorkflowStep
  ): Promise<SyncArtistResult> {
    const { artistId } = event.payload;

    try {
      // Step 1: Get Spotify access token
      const accessToken = await step.do("Get Spotify access token", async () => {
        return await getAccessToken({
          SPOTIFY_CLIENT_ID: this.env.SPOTIFY_CLIENT_ID,
          SPOTIFY_CLIENT_SECRET: this.env.SPOTIFY_CLIENT_SECRET,
        });
      });

      // Step 2: Fetch all albums for the artist
      const albums = await step.do("Fetch artist albums", async () => {
        return await fetchArtistAlbums(artistId, accessToken);
      });

      if (albums.length === 0) {
        return {
          success: true,
          artistId,
          artistName: "Unknown",
          songsAdded: 0,
          albumsProcessed: 0,
          error: "No albums found for artist",
        };
      }

      // Step 3: Fetch album details (includes track listings)
      const albumsDetails = await step.do("Fetch album details", async () => {
        const albumIds = albums.map((a) => a.id);
        return await fetchAlbumsDetails(albumIds, accessToken);
      });

      // Step 4: Collect and deduplicate tracks
      const trackIds = await step.do(
        "Collect and deduplicate tracks",
        async () => {
          const tracksMap = new Map<string, boolean>();

          for (const album of albumsDetails) {
            if (album && album.tracks && album.tracks.items) {
              for (const track of album.tracks.items) {
                if (track && track.id) {
                  tracksMap.set(track.id, true);
                }
              }
            }
          }

          return Array.from(tracksMap.keys());
        }
      );

      // Step 5: Fetch track popularity
      const popularityMap = await step.do(
        "Fetch track popularity",
        async () => {
          return await fetchTracksPopularity(trackIds, accessToken);
        }
      );

      // Step 6: Transform songs
      const songs = await step.do("Transform songs to schema", async () => {
        return collectAndTransformSongs(albumsDetails, popularityMap);
      });

      // Step 7: Fetch full artist metadata
      const artistMetadata = await step.do(
        "Fetch artist metadata",
        async () => {
          const uniqueArtistIds = extractUniqueArtistIds(songs);
          try {
            return await fetchArtistsMetadata(uniqueArtistIds, accessToken);
          } catch (error) {
            console.error("Failed to fetch artist metadata:", error);
            // Fallback to basic artist data from songs
            return null;
          }
        }
      );

      // Step 8: Upsert to database
      const result = await step.do("Upsert data to database", async () => {
        const db = initDatabase(this.env.DB);

        // 8.1: Upsert artists
        if (artistMetadata && artistMetadata.length > 0) {
          // Use full metadata
          for (const artist of artistMetadata) {
            const transformedArtist = transformArtistToSchema(artist);
            await upsertArtist(db, transformedArtist);
          }
        } else {
          // Fallback to basic artist data
          const basicArtists = createBasicArtistsFromSongs(songs);
          for (const artist of basicArtists) {
            await upsertArtist(db, artist);
          }
        }

        // 8.2: Upsert songs
        await upsertSongs(db, songs);

        // 8.3: Create/update song-artist junction records
        for (const song of songs) {
          const artistIds = song.artists.map((a) => a.id);
          await replaceSongArtists(db, song.id, artistIds);
        }

        // Get artist name from metadata or first song
        let artistName = "Unknown";
        if (artistMetadata && artistMetadata.length > 0) {
          const mainArtist = artistMetadata.find((a) => a.id === artistId);
          if (mainArtist) {
            artistName = mainArtist.name;
          }
        } else if (songs.length > 0) {
          const mainArtist = songs[0].artists.find((a) => a.id === artistId);
          if (mainArtist) {
            artistName = mainArtist.name;
          }
        }

        return {
          artistName,
          songsCount: songs.length,
          albumsCount: albumsDetails.length,
        };
      });

      return {
        success: true,
        artistId,
        artistName: result.artistName,
        songsAdded: result.songsCount,
        albumsProcessed: result.albumsCount,
      };
    } catch (error) {
      console.error("Workflow error:", error);
      return {
        success: false,
        artistId,
        artistName: "Unknown",
        songsAdded: 0,
        albumsProcessed: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
