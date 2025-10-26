import { Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import type { Artist, Song } from "@repo/data-ops/drizzle/haryanvibe-schema";
import { ArtistPreviewItem } from "./artist-preview-item";
import { SongPreviewItem } from "./song-preview-item";

interface ChartCardProps {
  title: string;
  description: string;
  href: string;
  data: Artist[] | Song[] | undefined;
  isLoading?: boolean;
  type: "artist" | "song";
}

export function ChartCard({
  title,
  description,
  href,
  data,
  isLoading,
  type,
}: ChartCardProps) {
  return (
    <Link to={href} className="block">
      <Card className="transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:border-primary/50 cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <div className="space-y-1">
              {data.slice(0, 5).map((item, index) => {
                if (type === "artist") {
                  return (
                    <ArtistPreviewItem
                      key={item.id}
                      artist={item as Artist}
                      rank={index + 1}
                    />
                  );
                } else {
                  return (
                    <SongPreviewItem
                      key={item.id}
                      song={item as Song}
                      rank={index + 1}
                    />
                  );
                }
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No data available
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
