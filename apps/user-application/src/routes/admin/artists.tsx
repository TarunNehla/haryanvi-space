import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/admin/artists")({
  component: AdminArtists,
});

function AdminArtists() {
  const queryClient = useQueryClient();
  const [artistUrl, setArtistUrl] = useState("");
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);

  // Sync artist mutation
  const syncMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch(
        "https://saas-kit-data-service.haryanvibe.workers.dev/admin/sync-artist",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artistUrl: url }),
        }
      );
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setCurrentWorkflowId(data.workflowId);
        setArtistUrl("");
      }
    },
  });

  // Workflow status polling
  const { data: workflowStatus } = useQuery({
    queryKey: ["workflow", currentWorkflowId],
    queryFn: async () => {
      const res = await fetch(
        `https://saas-kit-data-service.haryanvibe.workers.dev/admin/workflows/${currentWorkflowId}/status`
      );
      return res.json();
    },
    enabled: !!currentWorkflowId,
    refetchInterval: (data) => {
      // Stop polling if complete or error
      if (data?.state?.data?.status === "complete" || data?.state?.data?.status === "error") {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });

  // Recent artists
  const { data: artists, refetch } = useQuery({
    queryKey: ["admin", "artists"],
    queryFn: async () => {
      const res = await fetch(
        "https://saas-kit-data-service.haryanvibe.workers.dev/admin/artists/recent?limit=20"
      );
      return res.json();
    },
  });

  const handleSync = () => {
    if (artistUrl.trim()) {
      syncMutation.mutate(artistUrl);
    }
  };

  // Effect to refetch artists when workflow completes
  if (workflowStatus?.status === "complete") {
    setTimeout(() => {
      refetch();
      setCurrentWorkflowId(null);
    }, 1000);
  }

  return (
    <div>
      {/* Add Artist Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Sync Artist from Spotify
        </h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={artistUrl}
            onChange={(e) => setArtistUrl(e.target.value)}
            placeholder="https://open.spotify.com/artist/..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={syncMutation.isPending}
          />
          <button
            onClick={handleSync}
            disabled={syncMutation.isPending || !artistUrl.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {syncMutation.isPending ? "Syncing..." : "Sync Artist"}
          </button>
        </div>

        {/* Workflow Status */}
        {currentWorkflowId && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-blue-900">
                  Workflow: {currentWorkflowId}
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  Status: {workflowStatus?.status || "Starting..."}
                </div>
                {workflowStatus?.output && (
                  <div className="text-sm text-blue-700 mt-1">
                    {workflowStatus.output.success
                      ? `✓ Synced ${workflowStatus.output.artistName} - ${workflowStatus.output.songsAdded} songs added`
                      : `✗ Error: ${workflowStatus.output.error}`}
                  </div>
                )}
              </div>
              {workflowStatus?.status === "running" && (
                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
              )}
            </div>
          </div>
        )}

        {syncMutation.isError && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
            Error: {(syncMutation.error as Error).message}
          </div>
        )}
      </div>

      {/* Artists Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Artists
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Artist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Popularity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Followers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {artists?.artists?.map((artist: any) => (
                <tr key={artist.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {artist.photoUrl && (
                        <img
                          src={artist.photoUrl}
                          alt={artist.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      )}
                      <div className="font-medium text-gray-900">
                        {artist.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {artist.popularity}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {artist.followers?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(artist.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
