/**
 * Spotify API Response Types
 *
 * TypeScript interfaces for Spotify Web API responses used in artist/song sync.
 */

// ============================================================================
// Authentication
// ============================================================================

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// ============================================================================
// Common Types
// ============================================================================

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyExternalUrls {
  spotify: string;
}

export interface SpotifyFollowers {
  href: string | null;
  total: number;
}

// ============================================================================
// Artist Types
// ============================================================================

export interface SpotifyArtistSimple {
  id: string;
  name: string;
  external_urls: SpotifyExternalUrls;
  href: string;
  type: "artist";
  uri: string;
}

export interface SpotifyArtistFull extends SpotifyArtistSimple {
  followers: SpotifyFollowers;
  genres: string[];
  images: SpotifyImage[];
  popularity: number;
}

// ============================================================================
// Album Types
// ============================================================================

export interface SpotifyAlbumSimple {
  id: string;
  name: string;
  album_type: "album" | "single" | "compilation";
  total_tracks: number;
  external_urls: SpotifyExternalUrls;
  href: string;
  images: SpotifyImage[];
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  type: "album";
  uri: string;
  artists: SpotifyArtistSimple[];
  album_group?: "album" | "single" | "compilation" | "appears_on";
}

export interface SpotifyAlbumFull extends SpotifyAlbumSimple {
  tracks: {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: SpotifyTrackSimple[];
  };
  copyrights: Array<{
    text: string;
    type: string;
  }>;
  external_ids: {
    upc?: string;
    ean?: string;
    isrc?: string;
  };
  genres: string[];
  label: string;
  popularity: number;
}

// ============================================================================
// Track Types
// ============================================================================

export interface SpotifyTrackSimple {
  id: string;
  name: string;
  artists: SpotifyArtistSimple[];
  duration_ms: number;
  explicit: boolean;
  external_urls: SpotifyExternalUrls;
  href: string;
  track_number: number;
  disc_number: number;
  type: "track";
  uri: string;
  is_local: boolean;
}

export interface SpotifyTrackFull extends SpotifyTrackSimple {
  album: SpotifyAlbumSimple;
  external_ids: {
    isrc?: string;
    ean?: string;
    upc?: string;
  };
  popularity: number;
}

// ============================================================================
// Paginated Response Types
// ============================================================================

export interface SpotifyPaginatedResponse<T> {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: T[];
}

export interface SpotifyArtistAlbumsResponse {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: SpotifyAlbumSimple[];
}

// ============================================================================
// Batch Response Types
// ============================================================================

export interface SpotifyAlbumsBatchResponse {
  albums: (SpotifyAlbumFull | null)[];
}

export interface SpotifyTracksBatchResponse {
  tracks: (SpotifyTrackFull | null)[];
}

export interface SpotifyArtistsBatchResponse {
  artists: (SpotifyArtistFull | null)[];
}

// ============================================================================
// Error Types
// ============================================================================

export interface SpotifyErrorResponse {
  error: {
    status: number;
    message: string;
  };
}
