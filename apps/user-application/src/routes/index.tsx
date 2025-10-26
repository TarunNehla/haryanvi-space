import { createFileRoute } from "@tanstack/react-router";
import { NavigationBar } from "@/components/navigation";
import { Footer } from "@/components/landing/footer";
import { ChartCard } from "@/components/charts/chart-card";
import {
  usePopularArtists,
  useFollowedArtists,
  usePopularSongs,
  useLatestSongs,
} from "@/components/charts/hooks";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const popularArtists = usePopularArtists(5);
  const followedArtists = useFollowedArtists(5);
  const popularSongs = usePopularSongs(5);
  const latestSongs = useLatestSongs(5);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Haryanvi Music Analytics</h1>
          <p className="text-lg text-muted-foreground">
            Discover trending artists and songs in Haryanvi music
          </p>
        </div>

        {/* Top Artists Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Top Artists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ChartCard
              title="Most Popular"
              description="Top artists by popularity score"
              href="/charts/artists/popular"
              data={popularArtists.data?.data}
              isLoading={popularArtists.isLoading}
              type="artist"
            />
            <ChartCard
              title="Most Followed"
              description="Top artists by follower count"
              href="/charts/artists/followers"
              data={followedArtists.data?.data}
              isLoading={followedArtists.isLoading}
              type="artist"
            />
          </div>
        </section>

        {/* Top Songs Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Top Songs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ChartCard
              title="Most Popular"
              description="Top songs by popularity score"
              href="/charts/songs/popular"
              data={popularSongs.data?.data}
              isLoading={popularSongs.isLoading}
              type="song"
            />
            <ChartCard
              title="Latest Releases"
              description="Newest songs released"
              href="/charts/songs/latest"
              data={latestSongs.data?.data}
              isLoading={latestSongs.isLoading}
              type="song"
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
