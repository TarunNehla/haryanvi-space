import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_auth/app/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data: recentArtists, isLoading: loadingArtists } = useQuery({
    queryKey: ["admin", "artists", "recent"],
    queryFn: async () => {
      const res = await fetch(
        "https://saas-kit-data-service.haryanvibe.workers.dev/admin/artists/recent?limit=5"
      );
      return res.json();
    },
  });

  const { data: recentSongs, isLoading: loadingSongs } = useQuery({
    queryKey: ["admin", "songs", "recent"],
    queryFn: async () => {
      const res = await fetch(
        "https://saas-kit-data-service.haryanvibe.workers.dev/admin/songs/recent?limit=5"
      );
      return res.json();
    },
  });

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatsCard title="Total Artists" value="-" description="Coming soon" />
        <StatsCard title="Total Songs" value="-" description="Coming soon" />
        <StatsCard
          title="Active Workflows"
          value="-"
          description="Coming soon"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Artists */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recently Updated Artists
          </h2>
          {loadingArtists ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-3">
              {recentArtists?.artists?.map((artist: any) => (
                <div
                  key={artist.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {artist.photoUrl && (
                      <img
                        src={artist.photoUrl}
                        alt={artist.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">
                        {artist.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {artist.popularity} popularity
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(artist.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Songs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recently Updated Songs
          </h2>
          {loadingSongs ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-3">
              {recentSongs?.songs?.map((song: any) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {song.imageUrl && (
                      <img
                        src={song.imageUrl}
                        alt={song.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">
                        {song.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {song.artists?.[0]?.name || "Unknown"}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(song.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}
