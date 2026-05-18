"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  INTERVIEW_DURATIONS,
  INTERVIEW_QUESTION_LIMITS,
} from "@qa-playground/interview-core";
import { AlertCircle, Loader2, Play } from "lucide-react";

export default function InterviewSetupView({
  role,
  setRole,
  companyStyle,
  setCompanyStyle,
  focus,
  setFocus,
  durationMinutes,
  setDurationMinutes,
  questionLimit,
  setQuestionLimit,
  selectedKeySource,
  sessionCreateError,
  sessionCreateLoading,
  onStart,
  onOpenSettings,
}) {
  return (
    <section className="bg-white border border-[#e9eaed] rounded-xl p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-[#1f2937] m-0">
            Interview Setup
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Add role details and any questions or context you want the AI
            interviewer to focus on.
          </p>
        </div>
        <Badge
          variant="outline"
          className={
            selectedKeySource === "PLATFORM"
              ? "border-[#dbeafe] bg-[#eff2ff] text-blue-600"
              : "border-[#dcfce7] bg-[#f0fdf4] text-green-700"
          }
        >
          {selectedKeySource === "PLATFORM"
            ? "Platform key"
            : "Local key required"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interview-role">Target role</Label>
            <Input
              id="interview-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="QA Automation Engineer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interview-company-style">Company style</Label>
            <Input
              id="interview-company-style"
              value={companyStyle}
              onChange={(e) => setCompanyStyle(e.target.value)}
              placeholder="Startup, enterprise, fintech, SaaS..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="interview-duration">Duration</Label>
              <Select
                value={durationMinutes}
                onValueChange={setDurationMinutes}
              >
                <SelectTrigger id="interview-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_DURATIONS.map((duration) => (
                    <SelectItem key={duration} value={String(duration)}>
                      {duration} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interview-question-limit">Question limit</Label>
              <Select value={questionLimit} onValueChange={setQuestionLimit}>
                <SelectTrigger id="interview-question-limit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_QUESTION_LIMITS.map((limit) => (
                    <SelectItem key={limit} value={String(limit)}>
                      {limit} questions
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interview-focus">
            Interview details, questions, or short description
          </Label>
          <Textarea
            id="interview-focus"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            className="min-h-[220px] resize-y"
            placeholder="Example: I have a QA automation interview for a fintech company. Ask me Playwright, API testing, SQL, CI/CD, and defect reporting questions. Focus on scenario-based questions and give feedback after each answer."
          />
          <p className="text-xs text-gray-500 m-0">
            This is sent to the AI interviewer so it can tailor the session to
            your target interview.
          </p>
        </div>
      </div>

      {sessionCreateError && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle size={15} />
          {sessionCreateError}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onOpenSettings}
          className="text-xs text-blue-600 hover:text-blue-700 text-left"
        >
          Manage Deepgram key and free quota in Settings
        </button>
        <Button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          onClick={onStart}
          disabled={sessionCreateLoading}
        >
          {sessionCreateLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Play size={15} />
          )}
          Start session
        </Button>
      </div>
    </section>
  );
}
