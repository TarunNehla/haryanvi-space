import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "../../lib/api-client";

export const Route = createFileRoute("/admin/songs")({
  component: AdminSongs,
});

function AdminSongs() {
  const { data: songs } = useQuery({
    queryKey: ["admin", "songs"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/admin/songs/recent?limit=50"));
      return res.json();
    },
  });

  return (
    <div>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Songs
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Song
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Artists
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Popularity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Album
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {songs?.songs?.map((song: any) => (
                <tr key={song.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {song.imageUrl && (
                        <img
                          src={song.imageUrl}
                          alt={song.title}
                          className="w-10 h-10 rounded mr-3"
                        />
                      )}
                      <div className="font-medium text-gray-900">
                        {song.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {song.artists?.map((a: any) => a.name).join(", ")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {song.popularity}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {song.albumName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(song.updatedAt).toLocaleString()}
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
