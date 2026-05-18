"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

function getFeedback(session) {
  if (!session?.feedback || typeof session.feedback !== "object") return null;
  return session.feedback;
}

function renderInlineMarkdown(text) {
  return String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
}

function MarkdownSummary({ value }) {
  const lines = String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return (
      <p className="text-sm text-gray-500 m-0">
        Summary will appear here after feedback generation is complete.
      </p>
    );
  }

  return (
    <div className="space-y-2 text-sm text-gray-600 leading-relaxed">
      {lines.map((line, index) => {
        if (line.startsWith("### ")) {
          return (
            <h4
              key={`${line}-${index}`}
              className="text-sm font-semibold text-[#1f2937] mt-3 mb-1"
            >
              {renderInlineMarkdown(line.slice(4))}
            </h4>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3
              key={`${line}-${index}`}
              className="text-base font-semibold text-[#1f2937] mt-3 mb-1"
            >
              {renderInlineMarkdown(line.slice(3))}
            </h3>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h3
              key={`${line}-${index}`}
              className="text-base font-semibold text-[#1f2937] mt-3 mb-1"
            >
              {renderInlineMarkdown(line.slice(2))}
            </h3>
          );
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={`${line}-${index}`} className="flex gap-2">
              <span className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
              <p className="m-0">{renderInlineMarkdown(line.slice(2))}</p>
            </div>
          );
        }
        return <p key={`${line}-${index}`} className="m-0">{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

function ScoreCard({ label, score, note }) {
  return (
    <div className="rounded-lg border border-[#eef0f3] bg-[#fafbfc] p-3 min-h-[118px]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.7px] text-gray-400 m-0">
          {label}
        </p>
        <span className="font-mono text-sm font-bold text-blue-600">
          {score}/5
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed m-0 mt-3">{note}</p>
    </div>
  );
}

function FeedbackList({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-sm text-gray-500 m-0">No items generated yet.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={`${item.title}-${index}`}
          className="rounded-lg border border-[#eef0f3] bg-[#fafbfc] p-3"
        >
          <p className="text-sm font-semibold text-[#1f2937] m-0">
            {item.title}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed m-0 mt-1">
            {item.detail}
          </p>
        </div>
      ))}
    </div>
  );
}

function FeedbackAccordion({ feedback }) {
  return (
    <Accordion
      type="multiple"
      defaultValue={["strengths", "improvementAreas", "recommendedPractice"]}
      className="rounded-lg border border-[#e9eaed] bg-white px-3"
    >
      <AccordionItem value="strengths">
        <AccordionTrigger>Strengths</AccordionTrigger>
        <AccordionContent>
          <FeedbackList items={feedback.strengths} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="improvementAreas">
        <AccordionTrigger>Improvement Areas</AccordionTrigger>
        <AccordionContent>
          <FeedbackList items={feedback.improvementAreas} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="recommendedPractice">
        <AccordionTrigger>Recommended Practice</AccordionTrigger>
        <AccordionContent>
          <FeedbackList items={feedback.recommendedPractice} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="answerQualityNotes" className="border-b-0">
        <AccordionTrigger>Answer Quality Notes</AccordionTrigger>
        <AccordionContent>
          <FeedbackList items={feedback.answerQualityNotes} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function ReviewPanel({
  session,
  messages,
  generating,
  reviewError,
  onGenerate,
}) {
  const feedback = getFeedback(session);
  const hasReview = Boolean(session?.summary || feedback);
  const isSummarizing = session?.status === "SUMMARIZING";
  const hasTranscript = messages.length > 0;

  return (
    <section className="bg-white border border-[#e9eaed] rounded-xl p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#1f2937] m-0">
            Interview Review
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Summary and structured feedback generated from the saved transcript.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={onGenerate}
          disabled={generating || isSummarizing || !hasTranscript}
        >
          {generating || isSummarizing ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <RefreshCw size={15} />
          )}
          {hasReview ? "Regenerate feedback" : "Generate feedback"}
        </Button>
      </div>

      {(generating || isSummarizing) && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <Loader2 size={15} className="animate-spin" />
          Generating feedback...
        </div>
      )}

      {!hasTranscript && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Feedback needs transcript messages before it can be generated.
        </div>
      )}

      {reviewError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle size={15} />
          {reviewError}
        </div>
      )}

      {feedback && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.15fr] gap-4 mb-4">
            <div className="rounded-lg border border-[#dbeafe] bg-[#eff6ff] p-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.7px] text-blue-500 m-0">
                Overall score
              </p>
              <div className="flex items-end gap-2 mt-2">
                <p className="font-mono text-4xl font-bold text-blue-700 m-0">
                  {feedback.overallScore}
                </p>
                <p className="text-sm font-semibold text-blue-700 mb-1">
                  / 5
                </p>
              </div>
              <p className="text-sm font-semibold text-[#1f2937] m-0 mt-2">
                {feedback.scoreLabel}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed m-0 mt-2">
                {feedback.scoreReason}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(feedback.cards || []).map((card) => (
                <ScoreCard
                  key={card.label}
                  label={card.label}
                  score={card.score}
                  note={card.note}
                />
              ))}
            </div>
          </div>

          <FeedbackAccordion feedback={feedback} />
        </>
      )}

      <div className="mt-4 rounded-lg border border-[#e9eaed] bg-[#fafbfc] p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-[#1f2937] m-0">Summary</h4>
          <FileText size={16} className="text-gray-400" />
        </div>
        <MarkdownSummary value={session?.summary} />
      </div>
    </section>
  );
}

export default function AnalyticsView({
  session,
  selectedSessionId,
  messages,
  messagesLoading,
  messagesError,
  onOpenHistory,
  onSessionUpdated,
}) {
  const analyticsTranscriptRef = useRef(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

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

  const handleGenerateFeedback = async () => {
    setReviewLoading(true);
    setReviewError("");
    try {
      const res = await fetch(
        `/api/interview-practice/sessions/${session.id}/feedback`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Could not generate feedback.");
      }
      if (data?.session) onSessionUpdated?.(data.session);
      if (data?.reviewError) {
        setReviewError(data.reviewError);
      }
    } catch (error) {
      setReviewError(error.message || "Could not generate feedback.");
    } finally {
      setReviewLoading(false);
    }
  };

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

      <ReviewPanel
        session={session}
        messages={messages}
        generating={reviewLoading}
        reviewError={reviewError}
        onGenerate={handleGenerateFeedback}
      />

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
