import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Artist } from "@repo/data-ops/drizzle/haryanvibe-schema";
import { Users, TrendingUp, Music } from "lucide-react";

interface ArtistHeaderProps {
  artist: Artist;
}

export function ArtistHeader({ artist }: ArtistHeaderProps) {
  const fallback = artist.name.slice(0, 2).toUpperCase();
  const spotifyUrl = `https://open.spotify.com/artist/${artist.id}`;

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-8">
      <Avatar className="h-32 w-32 md:h-40 md:w-40">
        <AvatarImage src={artist.photoUrl} alt={artist.name} />
        <AvatarFallback className="text-3xl">{fallback}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-4xl md:text-5xl font-bold">{artist.name}</h1>
          <Button
            asChild
            variant="outline"
            size="icon"
            className="shrink-0 hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors"
          >
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Listen to ${artist.name} on Spotify`}
            >
              <Music className="h-5 w-5" />
            </a>
          </Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg">
              <span className="font-semibold">{artist.followers.toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">followers</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg">
              <span className="font-semibold">{artist.popularity}</span>
              <span className="text-muted-foreground ml-1">/ 100 popularity</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
