import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const haryanvibeArtists = sqliteTable("haryanvibe_artists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  photoUrl: text("photo_url").notNull(),
  popularity: integer("popularity").notNull().default(0),
  followers: integer("followers").notNull().default(0),
  monthlyListeners: integer("monthly_listeners"),
  spotifyUrl: text("spotify_url"),
  spotifyId: text("spotify_id").unique(),
  genres: text("genres"),
  bio: text("bio"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const haryanvibeSongs = sqliteTable("haryanvibe_songs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  artists: text("artists", { mode: "json" })
    .notNull()
    .$type<Array<{
      id: string;
      name: string;
      spotify_url: string;
    }>>(),
  duration: integer("duration_ms").notNull(),
  explicit: integer("explicit", { mode: "boolean" }).notNull().default(false),
  imageUrl: text("image_url").notNull(),
  albumId: text("album_id"),
  albumName: text("album_name"),
  trackNumber: integer("track_number"),
  discNumber: integer("disc_number").default(1),
  releaseDate: text("release_date"),
  releaseDatePrecision: text("release_date_precision"),
  popularity: integer("popularity").default(0),
  spotifyUrl: text("spotify_url"),
  spotifyId: text("spotify_id").unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const songArtists = sqliteTable(
  "song_artists",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    songId: text("song_id")
      .notNull()
      .references(() => haryanvibeSongs.id, { onDelete: "cascade" }),
    artistId: text("artist_id")
      .notNull()
      .references(() => haryanvibeArtists.id, { onDelete: "cascade" }),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    songIdIdx: index("song_artists_song_id_idx").on(table.songId, table.displayOrder),
    artistIdIdx: index("song_artists_artist_id_idx").on(table.artistId),
  })
);

export const artistsRelations = relations(haryanvibeArtists, ({ many }) => ({
  songArtists: many(songArtists),
}));

export const songsRelations = relations(haryanvibeSongs, ({ many }) => ({
  songArtists: many(songArtists),
}));

export const songArtistsRelations = relations(songArtists, ({ one }) => ({
  song: one(haryanvibeSongs, {
    fields: [songArtists.songId],
    references: [haryanvibeSongs.id],
  }),
  artist: one(haryanvibeArtists, {
    fields: [songArtists.artistId],
    references: [haryanvibeArtists.id],
  }),
}));

export const insertArtistSchema = createInsertSchema(haryanvibeArtists);
export const selectArtistSchema = createSelectSchema(haryanvibeArtists);
export const insertSongSchema = createInsertSchema(haryanvibeSongs);
export const selectSongSchema = createSelectSchema(haryanvibeSongs);
export const insertSongArtistSchema = createInsertSchema(songArtists);
export const selectSongArtistSchema = createSelectSchema(songArtists);

export type Artist = typeof haryanvibeArtists.$inferSelect;
export type NewArtist = typeof haryanvibeArtists.$inferInsert;
export type Song = typeof haryanvibeSongs.$inferSelect;
export type NewSong = typeof haryanvibeSongs.$inferInsert;
export type SongArtist = typeof songArtists.$inferSelect;
export type NewSongArtist = typeof songArtists.$inferInsert;

export type ArtistInSong = {
  id: string;
  name: string;
  spotify_url: string;
};
