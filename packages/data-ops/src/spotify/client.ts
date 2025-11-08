/**
 * Spotify API Client
 *
 * Handles authentication and token caching for Spotify Web API.
 */

import type { SpotifyTokenResponse } from "./types";

// ============================================================================
// Constants
// ============================================================================

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const TOKEN_BUFFER_SECONDS = 60; // Refresh token 60s before expiry

// ============================================================================
// Token Cache
// ============================================================================

interface CachedToken {
  accessToken: string;
  expiresAt: number; // Unix timestamp in milliseconds
}

// In-memory token cache (per-worker instance)
let tokenCache: CachedToken | null = null;

// ============================================================================
// Authentication
// ============================================================================

/**
 * Get a valid Spotify access token using Client Credentials flow.
 * Implements token caching to avoid unnecessary API calls.
 *
 * @param env - Environment variables containing Spotify credentials
 * @returns Valid access token
 * @throws Error if authentication fails
 */
export async function getAccessToken(env: {
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
}): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  // Fetch new token
  const credentials = `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`;
  const credentialsB64 = btoa(credentials);

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentialsB64}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Spotify authentication failed: ${response.status} ${errorText}`
    );
  }

  const data = (await response.json()) as SpotifyTokenResponse;

  // Cache token with buffer (expires_in is in seconds)
  const expiresInMs = (data.expires_in - TOKEN_BUFFER_SECONDS) * 1000;
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + expiresInMs,
  };

  return data.access_token;
}

/**
 * Clear the token cache.
 * Useful for testing or forcing token refresh.
 */
export function clearTokenCache(): void {
  tokenCache = null;
}
