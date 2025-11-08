import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_auth/app/admin/workflows")({
  component: AdminWorkflows,
});

function AdminWorkflows() {
  const [workflowId, setWorkflowId] = useState("");
  const [monitoringId, setMonitoringId] = useState<string | null>(null);

  const { data: status } = useQuery({
    queryKey: ["workflow", monitoringId],
    queryFn: async () => {
      const res = await fetch(
        `https://saas-kit-data-service.haryanvibe.workers.dev/admin/workflows/${monitoringId}/status`
      );
      return res.json();
    },
    enabled: !!monitoringId,
    refetchInterval: (data) => {
      if (data?.state?.data?.status === "complete" || data?.state?.data?.status === "error") {
        return false;
      }
      return 2000;
    },
  });

  const handleMonitor = () => {
    if (workflowId.trim()) {
      setMonitoringId(workflowId);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Monitor Workflow
        </h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={workflowId}
            onChange={(e) => setWorkflowId(e.target.value)}
            placeholder="Workflow ID"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleMonitor}
            disabled={!workflowId.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            Monitor
          </button>
        </div>

        {monitoringId && status && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">
              Workflow: {monitoringId}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    status.status === "complete"
                      ? "bg-green-100 text-green-800"
                      : status.status === "running"
                      ? "bg-blue-100 text-blue-800"
                      : status.status === "error"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {status.status}
                </span>
              </div>

              {status.output && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Output:</h4>
                  <pre className="bg-white p-4 rounded border border-gray-200 text-sm overflow-x-auto">
                    {JSON.stringify(status.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Workflow Information
        </h2>
        <div className="prose text-sm text-gray-600">
          <p>
            Workflows are automatically created when you sync an artist. You can
            monitor their progress here by entering the workflow ID.
          </p>
          <p className="mt-2">
            Workflow IDs are returned when you trigger an artist sync in the
            Artists tab.
          </p>
        </div>
      </div>
    </div>
  );
}
