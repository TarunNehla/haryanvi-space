import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SongCardSkeleton } from "@/components/artist/song-card-skeleton";
import type { Song } from "@repo/data-ops/drizzle/haryanvibe-schema";
import { Calendar, Clock } from "lucide-react";

interface SongListProps {
  songs: Song[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export function SongList({ songs, hasMore, isLoading, isLoadingMore, onLoadMore }: SongListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <SongCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No songs available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {songs.map((song) => {
          const fallback = song.title.slice(0, 2).toUpperCase();
          const artistNames = song.artists.map((a) => a.name).join(", ");
          const releaseDate = new Date(song.releaseDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          const durationMin = Math.floor(song.duration / 60000);
          const durationSec = Math.floor((song.duration % 60000) / 1000);
          const durationStr = `${durationMin}:${durationSec.toString().padStart(2, "0")}`;

          return (
            <div
              key={song.id}
              className="flex gap-4 p-5 rounded-xl border-2 bg-card hover:border-primary/50 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="shrink-0">
                <Avatar className="h-24 w-24 rounded-xl shadow-md">
                  <AvatarImage src={song.imageUrl} alt={song.title} className="object-cover" />
                  <AvatarFallback className="rounded-xl text-xl">{fallback}</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                    {song.title}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate mt-1">{artistNames}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{releaseDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-mono">{durationStr}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                    {song.popularity}/100
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(hasMore || isLoadingMore) && (
        <div className="flex justify-center pt-4">
          {isLoadingMore ? (
            <div className="space-y-3 w-full">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-xl border-2">
                  <Skeleton className="h-24 w-24 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Button onClick={onLoadMore} variant="outline" size="lg">
              Load More
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
