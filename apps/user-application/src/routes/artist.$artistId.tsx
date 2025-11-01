import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { NavigationBar } from "@/components/navigation";
import { Footer } from "@/components/landing/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ArtistHeader } from "@/components/artist/artist-header";
import { SongTabs } from "@/components/artist/song-tabs";
import { SongList } from "@/components/artist/song-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Artist, Song } from "@repo/data-ops/drizzle/haryanvibe-schema";

export const Route = createFileRoute("/artist/$artistId")({
  component: ArtistDetailPage,
});

type TabType = "popular" | "recent";

interface ArtistResponse {
  artist: Artist;
  popularSongs: {
    data: Song[];
    hasMore: boolean;
  };
  recentSongs: {
    data: Song[];
    hasMore: boolean;
  };
}

interface SongsPageResponse {
  data: Song[];
  page: number;
  hasNextPage: boolean;
}

function ArtistDetailPage() {
  const { artistId } = Route.useParams();
  const [activeTab, setActiveTab] = useState<TabType>("popular");
  const queryClient = useQueryClient();

  // Fetch initial artist data (for artist info only, not used for songs display)
  const { data, isLoading, error } = useQuery({
    queryKey: ["artist", artistId],
    queryFn: async () => {
      const response = await fetch(`/api/artist/${artistId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Artist not found");
        }
        throw new Error("Failed to fetch artist");
      }
      return response.json() as Promise<ArtistResponse>;
    },
  });

  // Popular songs infinite query
  const popularQuery = useInfiniteQuery({
    queryKey: ["artist-songs", artistId, "popular"],
    queryFn: async ({ pageParam }) => {
      const response = await fetch(
        `/api/artist/${artistId}/songs?type=popular&page=${pageParam}&limit=20`
      );
      if (!response.ok) throw new Error("Failed to fetch popular songs");
      return response.json() as Promise<SongsPageResponse>;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNextPage ? allPages.length + 1 : undefined,
    enabled: activeTab === "popular",
  });

  // Recent songs infinite query
  const recentQuery = useInfiniteQuery({
    queryKey: ["artist-songs", artistId, "recent"],
    queryFn: async ({ pageParam }) => {
      const response = await fetch(
        `/api/artist/${artistId}/songs?type=recent&page=${pageParam}&limit=20`
      );
      if (!response.ok) throw new Error("Failed to fetch recent songs");
      return response.json() as Promise<SongsPageResponse>;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNextPage ? allPages.length + 1 : undefined,
    enabled: activeTab === "recent",
  });

  // Extract flattened song arrays from pages
  const popularSongs = popularQuery.data?.pages.flatMap(page => page.data) ?? [];
  const recentSongs = recentQuery.data?.pages.flatMap(page => page.data) ?? [];

  // Tab change handler - resets the tab we're entering
  const handleTabChange = (newTab: TabType) => {
    // Reset the tab we're switching TO (force fresh page 1 load)
    if (newTab === "popular") {
      queryClient.removeQueries({ queryKey: ["artist-songs", artistId, "popular"] });
    } else {
      queryClient.removeQueries({ queryKey: ["artist-songs", artistId, "recent"] });
    }

    setActiveTab(newTab);  // Then activate the tab
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <main className="container mx-auto px-4 py-8 pt-24">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load artist"}
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <main className="container mx-auto px-4 py-8 pt-24">
          <Skeleton className="h-6 w-64 mb-6" />
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-8">
            <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-10 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 p-4 rounded-lg border">
                <Skeleton className="h-full w-full aspect-square rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { artist } = data;

  // Determine current state based on active tab
  const currentSongs = activeTab === "popular" ? popularSongs : recentSongs;
  const currentQuery = activeTab === "popular" ? popularQuery : recentQuery;
  const hasMore = currentQuery.hasNextPage ?? false;
  const isLoadingTab = currentQuery.isLoading;
  const isLoadingMore = currentQuery.isFetchingNextPage;
  const onLoadMore = () => currentQuery.fetchNextPage();

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Artists", href: "/" },
            { label: artist.name },
          ]}
          className="mb-6"
        />

        <ArtistHeader artist={artist} />

        <SongTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <SongList
          songs={currentSongs}
          hasMore={hasMore}
          isLoading={isLoadingTab}
          isLoadingMore={isLoadingMore}
          onLoadMore={onLoadMore}
        />
      </main>
      <Footer />
    </div>
  );
}
