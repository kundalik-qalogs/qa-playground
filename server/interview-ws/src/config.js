export function getConfig() {
  const port = Number(process.env.PORT || process.env.INTERVIEW_WS_PORT || 3001);

  return {
    host: process.env.HOST || "0.0.0.0",
    port,
    deepgramApiKey: process.env.DEEPGRAM_API_KEY,
    deepgramAgentUrl:
      process.env.DEEPGRAM_AGENT_URL ||
      "wss://agent.deepgram.com/v1/agent/converse",
    allowedOrigins: String(
      process.env.ALLOWED_ORIGINS ||
        "http://localhost:3000,http://127.0.0.1:3000",
    )
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
}

