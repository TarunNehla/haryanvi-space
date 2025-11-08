import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Artist } from "@repo/data-ops/drizzle/haryanvibe-schema";

interface ArtistPreviewItemProps {
  artist: Artist;
  rank: number;
}

export function ArtistPreviewItem({ artist, rank }: ArtistPreviewItemProps) {
  const fallback = artist.name.slice(0, 2).toUpperCase();
  const statValue = artist.followers.toLocaleString();

  return (
    <Link to="/artist/$artistId" params={{ artistId: artist.id }}>
      <div className="flex items-center gap-3 py-2 hover:bg-accent/50 rounded-md px-2 -mx-2 transition-colors cursor-pointer">
        <Badge variant="secondary" className="min-w-[2rem] justify-center">
          #{rank}
        </Badge>
        <Avatar className="h-12 w-12">
          <AvatarImage src={artist.photoUrl} alt={artist.name} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{artist.name}</p>
          <p className="text-sm text-muted-foreground">
            {statValue} followers
          </p>
        </div>
      </div>
    </Link>
  );
}
