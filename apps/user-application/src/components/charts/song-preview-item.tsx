import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Song } from "@repo/data-ops/drizzle/haryanvibe-schema";

interface SongPreviewItemProps {
  song: Song;
  rank: number;
}

export function SongPreviewItem({ song, rank }: SongPreviewItemProps) {
  const fallback = song.title.slice(0, 2).toUpperCase();
  const artistNames = song.artists.map((a) => a.name).join(", ");
  const durationMin = Math.floor(song.duration / 60000);
  const durationSec = Math.floor((song.duration % 60000) / 1000);

  return (
    <div className="flex items-center gap-3 py-2">
      <Badge variant="secondary" className="min-w-[2rem] justify-center">
        #{rank}
      </Badge>
      <Avatar className="h-12 w-12 rounded">
        <AvatarImage src={song.imageUrl} alt={song.title} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{song.title}</p>
        <p className="text-sm text-muted-foreground truncate">
          {artistNames}
        </p>
      </div>
      <Badge variant="outline" className="text-xs shrink-0">
        {durationMin}:{durationSec.toString().padStart(2, "0")}
      </Badge>
    </div>
  );
}
