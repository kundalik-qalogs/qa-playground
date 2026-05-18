import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { WebSocket, WebSocketServer } from "ws";
import {
  buildDeepgramSettings,
  getInterviewEndCondition,
  INTERVIEW_END_REASONS,
  INTERVIEW_KEY_SOURCES,
  normalizeDeepgramEvent,
} from "@qa-playground/interview-core";
import { getConfig } from "./config.js";

const config = getConfig();
const MAX_JSON_BYTES = 64 * 1024;
const MAX_AUDIO_BYTES = 256 * 1024;
const CLIENT_READY_TIMEOUT_MS = 15 * 1000;

if (process.argv.includes("--check-config")) {
  console.log("interview-ws config ok");
  process.exit(0);
}

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "interview-ws" }));
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

const wss = new WebSocketServer({
  server,
  path: "/interview-practice/ws",
  perMessageDeflate: false,
});

wss.on("connection", async (socket, req) => {
  const origin = req.headers.origin;

  if (origin && !config.allowedOrigins.includes(origin)) {
    socket.close(1008, "Origin not allowed");
    return;
  }

  const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
  const sessionId = url.searchParams.get("sessionId");
  const token = url.searchParams.get("token");

  if (!sessionId || !token) {
    socket.close(1008, "Missing session token");
    return;
  }

  let session;
  try {
    session = await validateSession({ sessionId, token });
  } catch (error) {
    sendJson(socket, {
      type: "Error",
      message: error.message || "Could not validate session",
    });
    socket.close(1008, "Session validation failed");
    return;
  }

  let deepgramSocket = null;
  let sequence = 0;
  let startedAt = session.startedAt || new Date().toISOString();
  let questionCount = Number(session.questionCount || 0);
  let ended = false;

  const closeSession = async (reason) => {
    if (ended) return;
    ended = true;
    await endSession(session.id, reason).catch(() => {});
    if (deepgramSocket?.readyState === WebSocket.OPEN) {
      deepgramSocket.close(1000, reason);
    }
    if (socket.readyState === WebSocket.OPEN) {
      sendJson(socket, { type: "SessionEnded", reason });
      socket.close(1000, reason);
    }
  };

  const readyTimer = setTimeout(() => {
    closeSession(INTERVIEW_END_REASONS.CONNECTION_CLOSED);
  }, CLIENT_READY_TIMEOUT_MS);

  sendJson(socket, {
    type: "SessionValidated",
    session,
    requiresUserKey: session.keySource === INTERVIEW_KEY_SOURCES.USER_LOCAL,
  });

  socket.on("message", async (data, isBinary) => {
    if (ended) return;

    if (isBinary) {
      if (!deepgramSocket || deepgramSocket.readyState !== WebSocket.OPEN) {
        return;
      }
      if (data.byteLength > MAX_AUDIO_BYTES) {
        await closeSession(INTERVIEW_END_REASONS.CONNECTION_CLOSED);
        return;
      }
      deepgramSocket.send(data);
      return;
    }

    if (data.byteLength > MAX_JSON_BYTES) {
      await closeSession(INTERVIEW_END_REASONS.CONNECTION_CLOSED);
      return;
    }

    let message;
    try {
      message = JSON.parse(data.toString("utf8"));
    } catch {
      sendJson(socket, { type: "Warning", message: "Invalid client JSON" });
      return;
    }

    if (message.type === "Start") {
      clearTimeout(readyTimer);
      const apiKey =
        session.keySource === INTERVIEW_KEY_SOURCES.USER_LOCAL
          ? String(message.deepgramApiKey || "")
          : config.deepgramApiKey;

      if (!apiKey) {
        sendJson(socket, {
          type: "Error",
          message:
            session.keySource === INTERVIEW_KEY_SOURCES.USER_LOCAL
              ? "User Deepgram key is required for this session"
              : "Platform Deepgram key is not configured",
        });
        await closeSession(INTERVIEW_END_REASONS.DEEPGRAM_ERROR);
        return;
      }

      deepgramSocket = await connectDeepgram({
        apiKey,
        onOpen: async (dgSocket) => {
          const commonGuidelines = await loadCommonGuidelines();
          dgSocket.send(
            JSON.stringify(
              buildDeepgramSettings({
                role: session.role,
                companyStyle: session.companyStyle,
                focus: session.focus,
                durationMinutes: session.durationMinutes,
                questionLimit: session.questionLimit,
                commonGuidelines,
              }),
            ),
          );
          sendJson(socket, { type: "DeepgramConnected" });
        },
        onMessage: async (eventData, eventIsBinary) => {
          if (eventIsBinary) {
            if (socket.readyState === WebSocket.OPEN) socket.send(eventData);
            return;
          }

          const raw = eventData.toString("utf8");
          sendJson(socket, { type: "DeepgramEvent", payload: raw });

          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            return;
          }

          const normalized = normalizeDeepgramEvent(parsed, ++sequence);
          if (!normalized) return;

          const persisted = await persistMessage({
            sessionId: session.id,
            message: normalized,
          }).catch(() => null);

          if (persisted?.session) {
            session = persisted.session;
            questionCount = Number(session.questionCount || questionCount);
          }

          sendJson(socket, {
            type: "Transcript",
            message: persisted?.message || normalized,
            session: persisted?.session || session,
          });

          const endCondition =
            persisted?.endCondition ||
            getInterviewEndCondition({
              startedAt,
              durationMinutes: session.durationMinutes,
              questionLimit: session.questionLimit,
              questionCount,
            });

          if (endCondition.shouldEnd) {
            await closeSession(endCondition.reason);
          }
        },
        onClose: async () => {
          await closeSession(INTERVIEW_END_REASONS.CONNECTION_CLOSED);
        },
        onError: async (error) => {
          sendJson(socket, {
            type: "Error",
            message: error.message || "Deepgram websocket error",
          });
          await closeSession(INTERVIEW_END_REASONS.DEEPGRAM_ERROR);
        },
      });
      return;
    }

    if (message.type === "End") {
      await closeSession(INTERVIEW_END_REASONS.USER_ENDED);
    }
  });

  socket.on("close", async () => {
    clearTimeout(readyTimer);
    if (!ended) {
      await closeSession(INTERVIEW_END_REASONS.CONNECTION_CLOSED);
    }
  });
});

server.listen(config.port, config.host, () => {
  console.log(`interview-ws listening on ${config.host}:${config.port}`);
});

function sendJson(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

async function loadCommonGuidelines() {
  try {
    return await readFile(config.agentGuidelinesPath, "utf8");
  } catch {
    return "";
  }
}

async function validateSession({ sessionId, token }) {
  const data = await callInterviewApi("/api/interview-practice/ws/validate", {
    sessionId,
    token,
  });
  return data.session;
}

async function persistMessage({ sessionId, message }) {
  return callInterviewApi("/api/interview-practice/ws/messages", {
    sessionId,
    message,
  });
}

async function endSession(sessionId, reason) {
  return callInterviewApi("/api/interview-practice/ws/end", {
    sessionId,
    reason,
  });
}

async function callInterviewApi(path, body) {
  const res = await fetch(new URL(path, config.interviewApiBaseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.internalSecret
        ? { "x-interview-ws-secret": config.internalSecret }
        : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Interview API failed: ${res.status}`);
  }
  return data;
}

function connectDeepgram({ apiKey, onOpen, onMessage, onClose, onError }) {
  return new Promise((resolveSocket, reject) => {
    let opened = false;
    const dgSocket = new WebSocket(config.deepgramAgentUrl, {
      headers: {
        Authorization: `Token ${apiKey}`,
      },
      perMessageDeflate: false,
    });

    dgSocket.once("open", async () => {
      opened = true;
      try {
        await onOpen(dgSocket);
        resolveSocket(dgSocket);
      } catch (error) {
        reject(error);
      }
    });
    dgSocket.on("message", onMessage);
    dgSocket.on("close", (...args) => {
      if (!opened) reject(new Error("Deepgram websocket closed before open"));
      onClose(...args);
    });
    dgSocket.on("error", (error) => {
      if (!opened) reject(error);
      onError(error);
    });
  });
}
