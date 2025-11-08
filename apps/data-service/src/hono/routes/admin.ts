/**
 * Admin Routes
 *
 * Endpoints for admin operations: sync artists, monitor workflows.
 */

import { Hono } from "hono";
import type { SyncArtistParams } from "../../workflows/sync-artist";

// ============================================================================
// Router Setup
// ============================================================================

export const adminRouter = new Hono<{ Bindings: Env }>();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract artist ID from Spotify URL or return as-is if already an ID
 *
 * Supports:
 * - https://open.spotify.com/artist/{id}
 * - https://open.spotify.com/artist/{id}?si=...
 * - spotify:artist:{id}
 * - {id} (raw ID)
 */
function extractArtistId(input: string): string | null {
  // Remove whitespace
  input = input.trim();

  // Try to match URL pattern
  const urlMatch = input.match(
    /spotify\.com\/artist\/([a-zA-Z0-9]+)(?:\?|$)/
  );
  if (urlMatch) {
    return urlMatch[1];
  }

  // Try to match URI pattern
  const uriMatch = input.match(/^spotify:artist:([a-zA-Z0-9]+)$/);
  if (uriMatch) {
    return uriMatch[1];
  }

  // Check if it's already a valid ID (alphanumeric, typically 22 chars)
  if (/^[a-zA-Z0-9]{15,}$/.test(input)) {
    return input;
  }

  return null;
}

// ============================================================================
// Routes
// ============================================================================

/**
 * POST /admin/sync-artist
 *
 * Trigger artist sync workflow
 *
 * Body:
 * {
 *   "artistUrl": "https://open.spotify.com/artist/..." or artist ID
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "workflowId": "...",
 *   "artistId": "..."
 * }
 */
adminRouter.post("/sync-artist", async (c) => {
  try {
    const body = await c.req.json();
    const { artistUrl } = body;

    if (!artistUrl) {
      return c.json(
        {
          success: false,
          error: "Missing artistUrl in request body",
        },
        400
      );
    }

    // Extract artist ID
    const artistId = extractArtistId(artistUrl);
    if (!artistId) {
      return c.json(
        {
          success: false,
          error: "Invalid Spotify artist URL or ID",
        },
        400
      );
    }

    // Create workflow instance
    const params: SyncArtistParams = { artistId };
    const instance = await c.env.SYNC_ARTIST_WORKFLOW.create({
      params,
    });

    return c.json({
      success: true,
      workflowId: instance.id,
      artistId,
    });
  } catch (error) {
    console.error("Failed to create workflow:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

/**
 * GET /admin/workflows/:id/status
 *
 * Get workflow status and output
 *
 * Response:
 * {
 *   "workflowId": "...",
 *   "status": "running" | "complete" | "error" | "terminated" | "paused" | "queued" | "unknown",
 *   "output": {...} // Only present if status is "complete"
 * }
 */
adminRouter.get("/workflows/:id/status", async (c) => {
  try {
    const workflowId = c.req.param("id");

    // Get workflow instance
    const instance = await c.env.SYNC_ARTIST_WORKFLOW.get(workflowId);

    if (!instance) {
      return c.json(
        {
          success: false,
          error: "Workflow not found",
        },
        404
      );
    }

    const status = await instance.status();

    return c.json({
      workflowId: instance.id,
      status: status.status,
      output: status.output,
    });
  } catch (error) {
    console.error("Failed to get workflow status:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});
