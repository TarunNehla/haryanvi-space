import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { NavigationBar } from "@/components/navigation";
import { Footer } from "@/components/landing/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Song } from "@repo/data-ops/drizzle/haryanvibe-schema";

export const Route = createFileRoute("/charts/songs/popular")({
  component: PopularSongsPage,
});

function PopularSongsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["songs", "popular", 20],
    queryFn: async () => {
      const response = await fetch("/api/songs?sortBy=popularity&order=desc&limit=20");
      if (!response.ok) throw new Error("Failed to fetch songs");
      return response.json() as Promise<{ data: Song[] }>;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Songs", href: "/" },
            { label: "Most Popular" },
          ]}
          className="mb-6"
        />

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Most Popular Songs</h1>
          <p className="text-lg text-muted-foreground">
            Top 20 songs ranked by popularity score
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 20 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-16 w-16 rounded" />
                  </div>
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))
          ) : data?.data ? (
            data.data.map((song, index) => {
              const fallback = song.title.slice(0, 2).toUpperCase();
              const artistNames = song.artists.map((a) => a.name).join(", ");
              const durationMin = Math.floor(song.duration / 60000);
              const durationSec = Math.floor((song.duration % 60000) / 1000);

              return (
                <Card
                  key={song.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary" className="text-lg font-bold">
                        #{index + 1}
                      </Badge>
                      <Avatar className="h-16 w-16 rounded">
                        <AvatarImage src={song.imageUrl} alt={song.title} />
                        <AvatarFallback>{fallback}</AvatarFallback>
                      </Avatar>
                    </div>
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {song.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 truncate">
                      {artistNames}
                    </p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Popularity: {song.popularity}/100</p>
                      <p>
                        Duration: {durationMin}:
                        {durationSec.toString().padStart(2, "0")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="col-span-full text-center text-muted-foreground">
              No data available
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
