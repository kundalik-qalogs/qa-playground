"use client";

import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Square,
  Signal,
  Mic,
  Bot,
  Clock3,
  MessageSquareText,
  Loader2,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "Not started";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function Detail({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#eef0f3] pb-3 last:border-b-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-[#111827]">{value || "-"}</dd>
    </div>
  );
}

export default function SessionView({
  session,
  durationMinutes,
  questionLimit,
  connectionStatus,
  micStatus,
  agentStatus,
  transcriptMessages,
  onEnd,
  onBackToSetup,
  onOpenHistory,
  onOpenAnalytics,
}) {
  const liveTranscriptRef = useRef(null);
  const isSessionActive = ["CREATED", "ACTIVE", "SUMMARIZING"].includes(
    session?.status,
  );
  const statusCards = [
    {
      label: "Connection",
      value: session ? connectionStatus : "No session",
      icon: Signal,
    },
    { label: "Mic", value: micStatus, icon: Mic },
    { label: "Agent", value: agentStatus, icon: Bot },
    {
      label: "Timer",
      value: `${session?.durationMinutes ?? durationMinutes}:00`,
      icon: Clock3,
    },
    {
      label: "Questions",
      value: `${session?.questionCount ?? 0} / ${session?.questionLimit ?? questionLimit}`,
      icon: MessageSquareText,
    },
  ];

  useEffect(() => {
    if (!liveTranscriptRef.current) return;
    liveTranscriptRef.current.scrollTop =
      liveTranscriptRef.current.scrollHeight;
  }, [transcriptMessages.length]);

  return (
    <div className="space-y-4">
      {!session ? (
        <section className="bg-white border border-[#e9eaed] rounded-xl p-8 text-center">
          <h2 className="text-lg font-semibold text-[#111827] m-0">
            No active session
          </h2>
          <p className="text-sm text-gray-500 mt-2 mb-5">
            Start from the Interview tab to create a session.
          </p>
          <Button type="button" onClick={onBackToSetup}>
            Go to Interview
          </Button>
        </section>
      ) : (
        <>
          <section className="bg-white border border-[#e9eaed] rounded-xl p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#1f2937] m-0">
                  Live Session
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {session.role} at {session.companyStyle}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white">
                  {session.id}
                </Badge>
                {isSessionActive ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 text-red-600 hover:text-red-700"
                    onClick={onEnd}
                  >
                    <Square size={14} />
                    End session
                  </Button>
                ) : (
                  <Badge className="bg-green-50 text-green-700 border border-green-200">
                    Session closed
                  </Badge>
                )}
              </div>
            </div>
            {!isSessionActive && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                This session is already {String(session.status).toLowerCase()}.
                Live controls are disabled. Open History or Analytics to review
                the completed attempt.
              </div>
            )}
          </section>

          <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {statusCards.map((item) => (
              <div
                key={item.label}
                className="bg-white border border-[#e9eaed] rounded-xl p-3 min-h-[86px]"
              >
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <item.icon size={15} />
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.7px] m-0">
                    {item.label}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[#1f2937] m-0">
                  {item.value}
                </p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-4">
            <div className="bg-white border border-[#e9eaed] rounded-xl p-5 min-h-[410px]">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-semibold text-[#1f2937] m-0">
                    Interview Room
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Realtime audio and transcript stream will attach here.
                  </p>
                </div>
                <Mic size={18} className="text-gray-400" />
              </div>
              <div className="rounded-lg border border-dashed border-[#d8dde5] bg-[#fafbfc] min-h-[300px] flex items-center justify-center px-6 text-center">
                {transcriptMessages.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 m-0">
                      {isSessionActive
                        ? "Waiting for Deepgram transcript events."
                        : "This session is no longer active."}
                    </p>
                    {!isSessionActive && (
                      <div className="flex flex-wrap justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onOpenHistory}
                        >
                          View history
                        </Button>
                        <Button
                          type="button"
                          onClick={() => onOpenAnalytics(session.id)}
                        >
                          View analytics
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    ref={liveTranscriptRef}
                    className="w-full h-full max-h-[300px] overflow-y-auto space-y-3 text-left pr-1"
                  >
                    {transcriptMessages.map((message, index) => (
                      <div
                        key={message.id || `${message.sequence}-${index}`}
                        className="rounded-lg border border-[#eef0f3] bg-white p-3"
                      >
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.7px] text-gray-400 m-0 mb-1">
                          {message.role}
                        </p>
                        <p className="text-sm text-[#1f2937] m-0">
                          {message.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#e9eaed] rounded-xl p-5">
              <h2 className="text-base font-semibold text-[#1f2937] m-0 mb-3">
                Session Details
              </h2>
              <dl className="space-y-3 text-sm">
                <Detail label="Status" value={session.status} />
                <Detail label="Key source" value={session.keySource} />
                <Detail label="Started" value={formatDate(session.startedAt)} />
                <Detail label="Created" value={formatDate(session.createdAt)} />
              </dl>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
