/**
 * API Client Configuration
 *
 * Centralized configuration for Data Service API endpoints.
 * Automatically switches between local development and production URLs.
 */

/**
 * Base API URL for the data service
 *
 * - Local development: http://localhost:8787 (from .env)
 * - Production: https://saas-kit-data-service.haryanvibe.workers.dev (from wrangler.jsonc)
 */
export const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://saas-kit-data-service.haryanvibe.workers.dev";

/**
 * Helper function to construct full API URLs
 *
 * @param path - API endpoint path (e.g., "/admin/artists/recent")
 * @returns Full URL to the API endpoint
 *
 * @example
 * ```typescript
 * const url = apiUrl("/admin/artists/recent?limit=10");
 * // Returns: "http://localhost:8787/admin/artists/recent?limit=10" (local)
 * // or: "https://saas-kit-data-service.haryanvibe.workers.dev/admin/artists/recent?limit=10" (prod)
 * ```
 */
export function apiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
}
