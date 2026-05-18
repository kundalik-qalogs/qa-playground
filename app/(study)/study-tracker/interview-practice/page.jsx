"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Bot,
  Check,
  Clock3,
  FileText,
  History,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  MessageSquareText,
  Mic,
  Play,
  RefreshCw,
  Settings,
  ShoppingCart,
  Signal,
  Square,
  Trash2,
} from "lucide-react";
import {
  INTERVIEW_DURATIONS,
  INTERVIEW_QUESTION_LIMITS,
} from "@qa-playground/interview-core";
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
import { useTracker } from "../_components/StudyTrackerProvider";

const LOCAL_DEEPGRAM_KEY = "qa_interview_deepgram_key";
const DEFAULT_FOCUS =
  "Ask one interview question at a time, wait for my answer, then give concise feedback before the next question. Mix practical QA, automation, and follow-up questions.";

const TABS = [
  { id: "interview", label: "Interview", icon: Mic },
  { id: "session", label: "Session", icon: Signal },
  { id: "history", label: "History", icon: History },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

function maskKey(value) {
  if (!value) return "";
  if (value.length <= 8) return "saved";
  return `Saved locally: ${value.slice(0, 4)}...${value.slice(-4)}`;
}

function formatDate(value) {
  if (!value) return "Not started";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function updateUrl(tab, id = "") {
  const params = new URLSearchParams(window.location.search);
  params.set("tab", tab);
  if (id) {
    params.set("id", id);
  } else {
    params.delete("id");
  }
  window.history.pushState({}, "", `${window.location.pathname}?${params}`);
}

function floatTo16BitPcm(input) {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return buffer;
}

export default function InterviewPracticePage() {
  const { user, sessionPending, showToast } = useTracker();
  const [activeTab, setActiveTab] = useState("interview");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [usage, setUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState("");
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [hasLocalKey, setHasLocalKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState("");
  const [role, setRole] = useState("QA Automation Engineer");
  const [companyStyle, setCompanyStyle] = useState("SaaS product company");
  const [focus, setFocus] = useState(DEFAULT_FOCUS);
  const [durationMinutes, setDurationMinutes] = useState("10");
  const [questionLimit, setQuestionLimit] = useState("5");
  const [sessionCreateLoading, setSessionCreateLoading] = useState(false);
  const [sessionCreateError, setSessionCreateError] = useState("");
  const [currentSession, setCurrentSession] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Not connected");
  const [micStatus, setMicStatus] = useState("Permission pending");
  const [agentStatus, setAgentStatus] = useState("Standing by");
  const [transcriptMessages, setTranscriptMessages] = useState([]);
  const wsRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const captureContextRef = useRef(null);
  const captureProcessorRef = useRef(null);
  const playbackContextRef = useRef(null);

  const refreshLocalKeyState = useCallback(() => {
    const stored = window.localStorage.getItem(LOCAL_DEEPGRAM_KEY) || "";
    setHasLocalKey(Boolean(stored));
    setMaskedKey(maskKey(stored));
  }, []);

  const syncTabFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const id = params.get("id") || "";
    setActiveTab(TABS.some((item) => item.id === tab) ? tab : "interview");
    setSelectedSessionId(id);
  }, []);

  const navigateTab = useCallback((tab, id = "") => {
    setActiveTab(tab);
    setSelectedSessionId(id);
    updateUrl(tab, id);
  }, []);

  const fetchUsage = useCallback(async () => {
    if (!user) return;

    setUsageLoading(true);
    setUsageError("");
    try {
      const res = await fetch("/api/interview-practice/usage", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load usage");
      setUsage(await res.json());
    } catch {
      setUsageError("Could not load interview usage.");
    } finally {
      setUsageLoading(false);
    }
  }, [user]);

  const fetchSessions = useCallback(async () => {
    if (!user) return;

    setSessionsLoading(true);
    setSessionsError("");
    try {
      const res = await fetch("/api/interview-practice/sessions", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch {
      setSessionsError("Could not load interview history.");
    } finally {
      setSessionsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshLocalKeyState();
    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);
    return () => window.removeEventListener("popstate", syncTabFromUrl);
  }, [refreshLocalKeyState, syncTabFromUrl]);

  useEffect(() => {
    fetchUsage();
    fetchSessions();
  }, [fetchUsage, fetchSessions]);

  const canUsePlatformKey = (usage?.platformFreeInterviewsRemaining ?? 0) > 0;
  const requiresLocalKey = Number(durationMinutes) === 15 || !canUsePlatformKey;
  const selectedKeySource = requiresLocalKey ? "USER_LOCAL" : "PLATFORM";
  const selectedSession = useMemo(() => {
    if (currentSession?.id === selectedSessionId) return currentSession;
    return sessions.find((session) => session.id === selectedSessionId) || null;
  }, [currentSession, selectedSessionId, sessions]);

  const accessHint = useMemo(() => {
    if (canUsePlatformKey) {
      return "Your next 10 minute interview can use the platform Deepgram key.";
    }
    if (hasLocalKey) {
      return "Future interviews will use your local Deepgram key for the active call only.";
    }
    return "Add your own Deepgram key to continue after the free quota or to use 15 minute interviews.";
  }, [canUsePlatformKey, hasLocalKey]);

  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      showToast("Enter a Deepgram API key first", true);
      return;
    }

    window.localStorage.setItem(LOCAL_DEEPGRAM_KEY, trimmed);
    setKeyInput("");
    refreshLocalKeyState();
    showToast("Deepgram key saved locally");
  };

  const handleRemoveKey = () => {
    window.localStorage.removeItem(LOCAL_DEEPGRAM_KEY);
    refreshLocalKeyState();
    showToast("Local Deepgram key removed");
  };

  const handleStartSession = async () => {
    setSessionCreateError("");

    if (!role.trim() || !companyStyle.trim() || !focus.trim()) {
      setSessionCreateError("Role, company style, and focus are required.");
      return;
    }

    if (requiresLocalKey && !hasLocalKey) {
      setSessionCreateError(
        Number(durationMinutes) === 15
          ? "Save a local Deepgram key in Settings before starting a 15 minute interview."
          : "Save a local Deepgram key in Settings to continue after the free quota.",
      );
      return;
    }

    setSessionCreateLoading(true);
    try {
      const res = await fetch("/api/interview-practice/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          companyStyle,
          focus,
          durationMinutes: Number(durationMinutes),
          questionLimit: Number(questionLimit),
          keySource: selectedKeySource,
          hasLocalKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create interview session");
      }

      setCurrentSession(data.session);
      setSessions((prev) => [data.session, ...prev]);
      if (data?.usage) setUsage(data.usage);
      navigateTab("session", data.session.id);
      await startLiveSession(data);
      showToast("Session started");
    } catch (error) {
      setSessionCreateError(error.message || "Could not start session.");
    } finally {
      setSessionCreateLoading(false);
    }
  };

  const handleEndSession = async () => {
    stopLiveSession();
    if (!currentSession?.id) {
      navigateTab("history");
      return;
    }

    try {
      const res = await fetch(
        `/api/interview-practice/sessions/${currentSession.id}/end`,
        { method: "PATCH" },
      );
      const data = await res.json();
      if (res.ok && data?.session) {
        setCurrentSession(data.session);
      }
      await fetchSessions();
      navigateTab("history");
    } catch {
      showToast("Could not end session cleanly", true);
    }
  };

  const startLiveSession = useCallback(
    async (sessionPayload) => {
      stopLiveSession();
      setTranscriptMessages([]);
      setConnectionStatus("Connecting");
      setMicStatus("Permission pending");
      setAgentStatus("Validating session");

      const websocket = sessionPayload?.websocket;
      const session = sessionPayload?.session;
      const baseUrl =
        websocket?.url || "ws://localhost:3001/interview-practice/ws";
      const url = new URL(baseUrl);
      url.searchParams.set("sessionId", websocket?.sessionId || session?.id);
      url.searchParams.set("token", websocket?.token || "");

      const socket = new WebSocket(url);
      socket.binaryType = "arraybuffer";
      wsRef.current = socket;

      socket.onopen = () => {
        setConnectionStatus("Connected");
        setAgentStatus("Starting agent");
        const localKey =
          websocket?.keySource === "USER_LOCAL"
            ? window.localStorage.getItem(LOCAL_DEEPGRAM_KEY) || ""
            : "";
        socket.send(
          JSON.stringify({
            type: "Start",
            ...(localKey ? { deepgramApiKey: localKey } : {}),
          }),
        );
        startMicrophoneCapture(socket).catch((error) => {
          setMicStatus("Mic unavailable");
          setTranscriptMessages((prev) => [
            ...prev,
            {
              id: `mic-${Date.now()}`,
              role: "SYSTEM",
              content:
                error?.message ||
                "Microphone capture could not be started in this browser.",
            },
          ]);
        });
      };

      socket.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          playPcmAudio(event.data);
          return;
        }

        let message;
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }

        if (message.type === "SessionValidated") {
          setAgentStatus("Session validated");
        }
        if (message.type === "DeepgramConnected") {
          setAgentStatus("Listening");
        }
        if (message.type === "Transcript" && message.message) {
          setTranscriptMessages((prev) => [...prev, message.message]);
          if (message.session) setCurrentSession(message.session);
        }
        if (message.type === "SessionEnded") {
          setConnectionStatus("Ended");
          setAgentStatus("Complete");
          stopMicrophoneCapture();
          fetchSessions();
        }
        if (message.type === "Error") {
          setAgentStatus("Error");
          setTranscriptMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: "SYSTEM",
              content: message.message || "Realtime session error.",
            },
          ]);
        }
      };

      socket.onclose = () => {
        setConnectionStatus("Disconnected");
        stopMicrophoneCapture();
      };
      socket.onerror = () => {
        setConnectionStatus("Error");
        setAgentStatus("Error");
      };
    },
    [fetchSessions],
  );

  const stopLiveSession = useCallback(() => {
    stopMicrophoneCapture();
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "End" }));
      wsRef.current.close(1000, "user_ended");
    }
    wsRef.current = null;
  }, []);

  const stopMicrophoneCapture = useCallback(() => {
    captureProcessorRef.current?.disconnect();
    captureProcessorRef.current = null;
    captureContextRef.current?.close().catch(() => {});
    captureContextRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    setMicStatus("Stopped");
  }, []);

  const startMicrophoneCapture = useCallback(
    async (socket) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass({ sampleRate: 24000 });
      captureContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      captureProcessorRef.current = processor;
      processor.onaudioprocess = (event) => {
        if (socket.readyState !== WebSocket.OPEN) return;
        const input = event.inputBuffer.getChannelData(0);
        socket.send(floatTo16BitPcm(input));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      setMicStatus("Live");
    },
    [],
  );

  const playPcmAudio = useCallback((arrayBuffer) => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!playbackContextRef.current) {
      playbackContextRef.current = new AudioContextClass({ sampleRate: 24000 });
    }
    const audioContext = playbackContextRef.current;
    const pcm = new Int16Array(arrayBuffer);
    const audioBuffer = audioContext.createBuffer(1, pcm.length, 24000);
    const channel = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcm.length; i += 1) {
      channel[i] = Math.max(-1, Math.min(1, pcm[i] / 32768));
    }
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  }, []);

  useEffect(() => {
    return () => {
      stopLiveSession();
      playbackContextRef.current?.close().catch(() => {});
    };
  }, [stopLiveSession]);

  if (!sessionPending && !user) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="text-center max-w-[380px] bg-white border border-[#e9eaed] rounded-xl px-10 py-10">
          <div className="w-12 h-12 rounded-lg bg-[#eff2ff] text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Lock size={22} />
          </div>
          <h1 className="text-lg font-semibold text-[#1f2937] mb-2">
            Sign in to practice interviews
          </h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Interview usage, history, and free platform-key interviews are
            linked to your account.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors no-underline"
          >
            <LogIn size={16} />
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (sessionPending) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-[#eff2ff] text-blue-600 flex items-center justify-center">
              <Mic size={18} />
            </div>
            <Badge
              variant="outline"
              className="border-[#dbeafe] bg-white text-blue-600"
            >
              Voice interview
            </Badge>
          </div>
          <h1 className="text-[1.55rem] font-bold text-[#111827] m-0">
            Interview Practice
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Set up, run, review, and tune your interview practice workspace.
          </p>
        </div>
        <div className="flex justify-end sm:ml-auto">
          <Button
            type="button"
            variant="outline"
            className="gap-2 dark:text-white"
            onClick={() => {
              fetchUsage();
              fetchSessions();
            }}
            disabled={usageLoading || sessionsLoading}
          >
            {usageLoading || sessionsLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <RefreshCw size={15} />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <nav className="bg-white border border-[#e9eaed] rounded-xl p-1 flex gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => navigateTab(tab.id, tab.id === "analytics" ? selectedSessionId : "")}
            className={`h-10 px-4 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-[#f3f6fb] hover:text-[#111827]"
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "interview" && (
        <InterviewSetupView
          role={role}
          setRole={setRole}
          companyStyle={companyStyle}
          setCompanyStyle={setCompanyStyle}
          focus={focus}
          setFocus={setFocus}
          durationMinutes={durationMinutes}
          setDurationMinutes={setDurationMinutes}
          questionLimit={questionLimit}
          setQuestionLimit={setQuestionLimit}
          selectedKeySource={selectedKeySource}
          sessionCreateError={sessionCreateError}
          sessionCreateLoading={sessionCreateLoading}
          onStart={handleStartSession}
          onOpenSettings={() => navigateTab("settings")}
        />
      )}

      {activeTab === "session" && (
        <SessionView
          session={selectedSession || currentSession}
          durationMinutes={durationMinutes}
          questionLimit={questionLimit}
          connectionStatus={connectionStatus}
          micStatus={micStatus}
          agentStatus={agentStatus}
          transcriptMessages={transcriptMessages}
          onEnd={handleEndSession}
          onBackToSetup={() => navigateTab("interview")}
        />
      )}

      {activeTab === "history" && (
        <HistoryView
          sessions={sessions}
          loading={sessionsLoading}
          error={sessionsError}
          onRefresh={fetchSessions}
          onAnalytics={(id) => navigateTab("analytics", id)}
        />
      )}

      {activeTab === "analytics" && (
        <AnalyticsView
          session={selectedSession}
          selectedSessionId={selectedSessionId}
          onOpenHistory={() => navigateTab("history")}
        />
      )}

      {activeTab === "settings" && (
        <SettingsView
          usage={usage}
          usageLoading={usageLoading}
          usageError={usageError}
          accessHint={accessHint}
          hasLocalKey={hasLocalKey}
          maskedKey={maskedKey}
          keyInput={keyInput}
          setKeyInput={setKeyInput}
          onSaveKey={handleSaveKey}
          onRemoveKey={handleRemoveKey}
        />
      )}
    </div>
  );
}

function InterviewSetupView({
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
            Choose the target role and interview constraints before starting.
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
              <Select value={durationMinutes} onValueChange={setDurationMinutes}>
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
          <Label htmlFor="interview-focus">Interview focus</Label>
          <Textarea
            id="interview-focus"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            className="min-h-[220px] resize-y"
            placeholder="What should the interviewer focus on?"
          />
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

function SessionView({
  session,
  durationMinutes,
  questionLimit,
  connectionStatus,
  micStatus,
  agentStatus,
  transcriptMessages,
  onEnd,
  onBackToSetup,
}) {
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
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 text-red-600 hover:text-red-700"
                  onClick={onEnd}
                >
                  <Square size={14} />
                  End session
                </Button>
              </div>
            </div>
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
                  <p className="text-sm text-gray-500 m-0">
                    Waiting for Deepgram transcript events.
                  </p>
                ) : (
                  <div className="w-full h-full max-h-[300px] overflow-y-auto space-y-3 text-left">
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

function HistoryView({ sessions, loading, error, onRefresh, onAnalytics }) {
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
        <Button type="button" variant="outline" className="gap-2" onClick={onRefresh}>
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

function AnalyticsView({ session, selectedSessionId, onOpenHistory }) {
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
        <Metric label="Duration" value={`${session.durationMinutes} min`} />
        <Metric label="Questions" value={`${session.questionCount} / ${session.questionLimit}`} />
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
    </div>
  );
}

function SettingsView({
  usage,
  usageLoading,
  usageError,
  accessHint,
  hasLocalKey,
  maskedKey,
  keyInput,
  setKeyInput,
  onSaveKey,
  onRemoveKey,
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-4">
      <section className="bg-white border border-[#e9eaed] rounded-xl p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#1f2937] m-0">
              Free Interview Usage
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Platform key access is limited to two 10 minute interviews.
            </p>
          </div>
          <Badge className="bg-[#eff2ff] text-blue-600 border-transparent">
            {usage?.plan ?? "FREE"}
          </Badge>
        </div>

        {usageError ? (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle size={15} />
            {usageError}
          </div>
        ) : usageLoading && !usage ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={15} className="animate-spin" />
            Loading usage...
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Limit" value={usage?.platformFreeInterviewsLimit ?? 2} />
            <Metric label="Used" value={usage?.platformFreeInterviewsUsed ?? 0} />
            <Metric label="Left" value={usage?.platformFreeInterviewsRemaining ?? 0} />
          </div>
        )}

        <div className="mt-4 rounded-lg border border-[#e9eaed] bg-white px-3 py-3 text-sm text-gray-600">
          {accessHint}
        </div>
      </section>

      <section className="bg-white border border-[#e9eaed] rounded-xl p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#1f2937] m-0">
              Local Deepgram Key
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Stored only in this browser and sent only for an active user-key
              call.
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#f8fafc] border border-[#e9eaed] text-gray-500 flex items-center justify-center">
            <KeyRound size={17} />
          </div>
        </div>

        <div className="rounded-lg border border-[#eef0f3] bg-[#fafbfc] px-3 py-3 mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                hasLocalKey ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <p className="text-sm font-medium text-[#1f2937] m-0">
              {hasLocalKey ? "Local key saved" : "No local key saved"}
            </p>
          </div>
          {hasLocalKey && (
            <p className="text-xs text-gray-500 mt-1 mb-0">{maskedKey}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deepgram-local-key">Deepgram API key</Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              id="deepgram-local-key"
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Paste your Deepgram API key"
              autoComplete="off"
            />
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onSaveKey}
            >
              <Check size={15} />
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              className="text-red-600 hover:text-red-700 dark:text-red-500"
              onClick={onRemoveKey}
              disabled={!hasLocalKey}
            >
              <Trash2 size={15} />
              Remove
            </Button>
          </div>
          <p className="text-xs text-gray-500 m-0">
            This key is not sent to `/api/interview-practice/*` and is not saved
            in the database.
          </p>
        </div>

        <div className="mt-5 rounded-lg border border-[#fed7aa] bg-[#fff7ed] p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-white text-orange-600 flex items-center justify-center shrink-0">
              <ShoppingCart size={17} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1f2937] m-0">
                Buy Interviews
              </h3>
              <p className="text-sm text-gray-600 mt-1 mb-3">
                Paid interview packs are planned after the realtime V1 flow is
                stable.
              </p>
              <Button type="button" variant="outline" disabled>
                Coming soon
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
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

function Detail({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#eef0f3] pb-3 last:border-b-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-[#111827]">{value || "-"}</dd>
    </div>
  );
}
