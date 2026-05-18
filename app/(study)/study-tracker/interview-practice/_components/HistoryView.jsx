"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, BarChart3, RefreshCw } from "lucide-react";

function formatDate(value) {
  if (!value) return "Not started";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function HistoryView({
  sessions,
  loading,
  error,
  onRefresh,
  onAnalytics,
}) {
  return (
    <section className="bg-white border border-[#e9eaed] rounded-xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#1f2937] m-0">
            Session History
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Review previous interview sessions and open analytics by ID.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={onRefresh}
        >
          <RefreshCw size={15} />
          Refresh history
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-[#e9eaed]">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-[#f8fafc] text-left text-[0.68rem] uppercase tracking-[0.7px] text-gray-400">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold">Questions</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef0f3]">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Loading history...
                </td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No interview sessions yet.
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr key={session.id} className="bg-white">
                  <td className="px-4 py-3 font-mono text-xs text-[#111827]">
                    {session.id}
                  </td>
                  <td className="px-4 py-3 text-[#1f2937]">{session.role}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="bg-white">
                      {session.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{session.durationMinutes} min</td>
                  <td className="px-4 py-3">
                    {session.questionCount} / {session.questionLimit}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(session.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={() => onAnalytics(session.id)}
                    >
                      <BarChart3 size={14} />
                      Analytics
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
