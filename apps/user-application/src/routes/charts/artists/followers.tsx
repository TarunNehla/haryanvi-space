import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { NavigationBar } from "@/components/navigation";
import { Footer } from "@/components/landing/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Artist } from "@repo/data-ops/drizzle/haryanvibe-schema";

export const Route = createFileRoute("/charts/artists/followers")({
  component: FollowersArtistsPage,
});

function FollowersArtistsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["artists", "followers", 20],
    queryFn: async () => {
      const response = await fetch("/api/artists?sortBy=followers&order=desc&limit=20");
      if (!response.ok) throw new Error("Failed to fetch artists");
      return response.json() as Promise<{ data: Artist[] }>;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Artists", href: "/" },
            { label: "Most Followed" },
          ]}
          className="mb-6"
        />

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Most Followed Artists</h1>
          <p className="text-lg text-muted-foreground">
            Top 20 artists ranked by follower count
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 20 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-16 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))
          ) : data?.data ? (
            data.data.map((artist, index) => {
              const fallback = artist.name.slice(0, 2).toUpperCase();
              return (
                <Card
                  key={artist.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary" className="text-lg font-bold">
                        #{index + 1}
                      </Badge>
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={artist.photoUrl} alt={artist.name} />
                        <AvatarFallback>{fallback}</AvatarFallback>
                      </Avatar>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 truncate">
                      {artist.name}
                    </h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Followers: {artist.followers.toLocaleString()}</p>
                      <p>Popularity: {artist.popularity}/100</p>
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
