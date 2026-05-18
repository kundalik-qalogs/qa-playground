"use client";

import { Button } from "@/components/ui/button";
import {
  BarChart3,
  History,
  Loader2,
  Lock,
  LogIn,
  Mic,
  RefreshCw,
  Settings,
  Signal,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTracker } from "../_components/StudyTrackerProvider";
import AnalyticsView from "./_components/AnalyticsView";
import HistoryView from "./_components/HistoryView";
import InterviewSetupView from "./_components/InterviewSetupView";
import SessionView from "./_components/SessionView";
import SettingsView from "./_components/SettingsView";

const LOCAL_DEEPGRAM_KEY = "qa_interview_deepgram_key";
const DEEPGRAM_AUDIO_SAMPLE_RATE = 24000;
const DEFAULT_FOCUS =
  "I want a realistic QA automation interview. Ask practical questions about Playwright, API testing, debugging flaky tests, CI/CD, test strategy, and real project scenarios. Include follow-up questions when my answer is too short.";

const TABS = [
  { id: "interview", label: "Interview", icon: Mic },
  { id: "session", label: "Session", icon: Signal },
  { id: "history", label: "History", icon: History },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const SHOW_DEEPGRAM_SETTINGS = false;
const SHOW_BUY_CARD = true;

function maskKey(value) {
  if (!value) return "";
  if (value.length <= 8) return "saved";
  return `Saved locally: ${value.slice(0, 4)}...${value.slice(-4)}`;
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
  const [selectedSessionMessages, setSelectedSessionMessages] = useState([]);
  const [selectedSessionLoading, setSelectedSessionLoading] = useState(false);
  const [selectedSessionError, setSelectedSessionError] = useState("");
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
  const nextPlaybackTimeRef = useRef(0);

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

  const fetchSessionDetails = useCallback(
    async (id) => {
      if (!user || !id) return;

      setSelectedSessionLoading(true);
      setSelectedSessionError("");
      try {
        const res = await fetch(`/api/interview-practice/sessions/${id}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load session details");
        const data = await res.json();
        setSelectedSessionMessages(data.messages || []);
        if (data.session) {
          setSessions((prev) =>
            prev.map((session) =>
              session.id === data.session.id ? data.session : session,
            ),
          );
          if (currentSession?.id === data.session.id) {
            setCurrentSession(data.session);
          }
        }
      } catch {
        setSelectedSessionMessages([]);
        setSelectedSessionError("Could not load transcript for this session.");
      } finally {
        setSelectedSessionLoading(false);
      }
    },
    [currentSession?.id, user],
  );

  const stopMicrophoneCapture = useCallback(() => {
    captureProcessorRef.current?.disconnect();
    captureProcessorRef.current = null;
    captureContextRef.current?.close().catch(() => {});
    captureContextRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    setMicStatus("Stopped");
  }, []);

  const stopLiveSession = useCallback(() => {
    stopMicrophoneCapture();
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "End" }));
      wsRef.current.close(1000, "user_ended");
    }
    wsRef.current = null;
    nextPlaybackTimeRef.current = 0;
  }, [stopMicrophoneCapture]);

  const startMicrophoneCapture = useCallback(async (socket) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    mediaStreamRef.current = stream;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContextClass({
      sampleRate: DEEPGRAM_AUDIO_SAMPLE_RATE,
    });
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
  }, []);

  const playPcmAudio = useCallback((arrayBuffer) => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!playbackContextRef.current) {
      playbackContextRef.current = new AudioContextClass({
        sampleRate: DEEPGRAM_AUDIO_SAMPLE_RATE,
      });
    }
    const audioContext = playbackContextRef.current;
    const pcm = new Int16Array(arrayBuffer);
    const audioBuffer = audioContext.createBuffer(
      1,
      pcm.length,
      DEEPGRAM_AUDIO_SAMPLE_RATE,
    );
    const channel = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcm.length; i += 1) {
      channel[i] = Math.max(-1, Math.min(1, pcm[i] / 32768));
    }
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);

    const leadTime = 0.08;
    const currentTime = audioContext.currentTime;
    if (nextPlaybackTimeRef.current < currentTime + leadTime) {
      nextPlaybackTimeRef.current = currentTime + leadTime;
    }

    source.start(nextPlaybackTimeRef.current);
    nextPlaybackTimeRef.current += audioBuffer.duration;
  }, []);

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
        setAgentStatus("Waiting for validation");
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
          setAgentStatus("Starting agent");
          if (message.session) setCurrentSession(message.session);
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
        }
        if (message.type === "DeepgramConnected") {
          setAgentStatus("Listening");
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
    [
      fetchSessions,
      playPcmAudio,
      startMicrophoneCapture,
      stopLiveSession,
      stopMicrophoneCapture,
    ],
  );

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

  useEffect(() => {
    if (activeTab === "analytics" && selectedSessionId) {
      fetchSessionDetails(selectedSessionId);
    }
  }, [activeTab, fetchSessionDetails, selectedSessionId]);

  useEffect(() => {
    return () => {
      stopLiveSession();
      playbackContextRef.current?.close().catch(() => {});
    };
  }, [stopLiveSession]);

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
            <RefreshCw
              size={15}
              className={usageLoading || sessionsLoading ? "animate-spin" : ""}
            />
            Refresh
          </Button>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto border-b border-[#e9eaed] pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigateTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:text-blue-600 border border-[#e9eaed]"
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
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
          session={currentSession}
          durationMinutes={durationMinutes}
          questionLimit={questionLimit}
          connectionStatus={connectionStatus}
          micStatus={micStatus}
          agentStatus={agentStatus}
          transcriptMessages={transcriptMessages}
          onEnd={handleEndSession}
          onBackToSetup={() => navigateTab("interview")}
          onOpenHistory={() => navigateTab("history")}
          onOpenAnalytics={(id) => navigateTab("analytics", id)}
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
          messages={selectedSessionMessages}
          messagesLoading={selectedSessionLoading}
          messagesError={selectedSessionError}
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
          showDeepgramSettings={SHOW_DEEPGRAM_SETTINGS}
          showBuyCard={SHOW_BUY_CARD}
        />
      )}
    </div>
  );
}
