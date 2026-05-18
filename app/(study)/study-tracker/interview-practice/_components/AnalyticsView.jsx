"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, BarChart3, FileText, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

function formatDate(value) {
  if (!value) return "Not started";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatInterviewElapsed(session) {
  if (!session?.startedAt)
    return `0 min / ${session?.durationMinutes ?? 0} min`;

  const startedMs = new Date(session.startedAt).getTime();
  const endedMs = session.endedAt
    ? new Date(session.endedAt).getTime()
    : Date.now();
  const elapsedMinutes = Math.max(
    0,
    Math.min(
      Number(session.durationMinutes || 0),
      Math.ceil((endedMs - startedMs) / 60000),
    ),
  );

  return `${elapsedMinutes} min / ${session?.durationMinutes} min`;
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-[#eef0f3] bg-[#fafbfc] p-3">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.7px] text-gray-400 m-0">
        {label}
      </p>
      <p className="font-mono text-xl font-bold text-[#111827] m-0 mt-1">
        {value}
      </p>
    </div>
  );
}

export default function AnalyticsView({
  session,
  selectedSessionId,
  messages,
  messagesLoading,
  messagesError,
  onOpenHistory,
}) {
  const analyticsTranscriptRef = useRef(null);

  useEffect(() => {
    if (!analyticsTranscriptRef.current) return;
    analyticsTranscriptRef.current.scrollTop =
      analyticsTranscriptRef.current.scrollHeight;
  }, [messages.length]);

  if (!selectedSessionId) {
    return (
      <section className="bg-white border border-[#e9eaed] rounded-xl p-8 text-center">
        <h2 className="text-lg font-semibold text-[#111827] m-0">
          Select a session
        </h2>
        <p className="text-sm text-gray-500 mt-2 mb-5">
          Open analytics from the History table to load `?tab=analytics&id=...`.
        </p>
        <Button type="button" onClick={onOpenHistory}>
          Go to History
        </Button>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="bg-white border border-[#e9eaed] rounded-xl p-8 text-center">
        <h2 className="text-lg font-semibold text-[#111827] m-0">
          Analytics not found
        </h2>
        <p className="text-sm text-gray-500 mt-2 mb-5">
          Session `{selectedSessionId}` is not in the current history list.
        </p>
        <Button type="button" onClick={onOpenHistory}>
          Back to History
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="bg-white border border-[#e9eaed] rounded-xl p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1f2937] m-0">
              Session Analytics
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Analysis for <span className="font-mono">{session.id}</span>
            </p>
          </div>
          <Badge variant="outline" className="bg-white">
            {session.status}
          </Badge>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Metric
          label="Interview time"
          value={formatInterviewElapsed(session)}
        />
        <Metric
          label="Questions"
          value={`${session.questionCount} / ${session.questionLimit}`}
        />
        <Metric label="Key source" value={session.keySource} />
        <Metric label="Ended" value={session.endedAt ? "Yes" : "No"} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
        <div className="bg-white border border-[#e9eaed] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#1f2937] m-0">
              Summary
            </h3>
            <FileText size={18} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed m-0">
            {session.summary ||
              "Summary will appear here after transcript persistence and feedback generation are wired."}
          </p>
        </div>
        <div className="bg-white border border-[#e9eaed] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#1f2937] m-0">
              Feedback
            </h3>
            <BarChart3 size={18} className="text-gray-400" />
          </div>
          <div className="rounded-lg border border-[#eef0f3] bg-[#fafbfc] p-3 text-sm text-gray-600">
            {session.feedback
              ? JSON.stringify(session.feedback)
              : "Structured feedback is pending for this session."}
          </div>
        </div>
      </section>

      <section className="bg-white border border-[#e9eaed] rounded-xl p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[#1f2937] m-0">
              Transcript
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Candidate and AI messages from this interview session.
            </p>
          </div>
          <Badge variant="outline" className="bg-white">
            {messages.length} messages
          </Badge>
        </div>

        {messagesError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle size={15} />
            {messagesError}
          </div>
        )}

        <div className="min-h-[260px] rounded-lg border border-[#e9eaed] bg-[#fafbfc] p-4">
          {messagesLoading ? (
            <div className="flex items-center justify-center min-h-[220px] text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin mr-2" />
              Loading transcript...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center min-h-[220px] text-sm text-gray-500 text-center">
              No transcript messages were saved for this session yet.
            </div>
          ) : (
            <div
              ref={analyticsTranscriptRef}
              className="max-h-[420px] overflow-y-auto space-y-3 pr-1"
            >
              {messages.map((message) => {
                const isUser = message.role === "USER";
                const isAi = message.role === "INTERVIEWER";
                const label = isUser
                  ? "Candidate"
                  : isAi
                    ? "AI interviewer"
                    : "System";
                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-xl border px-4 py-3 ${isUser ? "border-blue-200 bg-blue-50 text-blue-950" : isAi ? "border-[#e5e7eb] bg-white text-[#1f2937]" : "border-amber-200 bg-amber-50 text-amber-900"}`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.7px] text-gray-400 m-0">
                          {label}
                        </p>
                        <p className="text-[0.68rem] text-gray-400 m-0">
                          {message.occurredAt
                            ? formatDate(message.occurredAt)
                            : ""}
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed m-0">
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
