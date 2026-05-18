import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { getConfig } from "./config.js";

const config = getConfig();

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

wss.on("connection", (socket, req) => {
  const origin = req.headers.origin;

  if (origin && !config.allowedOrigins.includes(origin)) {
    socket.close(1008, "Origin not allowed");
    return;
  }

  socket.send(
    JSON.stringify({
      type: "System",
      message: "Interview websocket service is running. Deepgram proxy wiring is pending.",
    }),
  );
});

server.listen(config.port, config.host, () => {
  console.log(`interview-ws listening on ${config.host}:${config.port}`);
});

