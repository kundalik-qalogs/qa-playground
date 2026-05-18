import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../..");

loadEnvFile(resolve(repoRoot, ".env"));
loadEnvFile(resolve(__dirname, "../.env"));

function loadEnvFile(path) {
  if (!existsSync(path)) return;

  const contents = readFileSync(path, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

export function getConfig() {
  const port = Number(process.env.INTERVIEW_WS_PORT || process.env.PORT || 3001);
  const defaultGuidelinesPath = resolve(
    repoRoot,
    "packages/interview-core/INTERVIEW_AGENT_GUIDELINES.md",
  );

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
    interviewApiBaseUrl:
      process.env.INTERVIEW_API_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000",
    internalSecret: process.env.INTERVIEW_WS_INTERNAL_SECRET || "",
    agentGuidelinesPath:
      process.env.INTERVIEW_AGENT_GUIDELINES_PATH
        ? resolve(repoRoot, process.env.INTERVIEW_AGENT_GUIDELINES_PATH)
        : defaultGuidelinesPath,
  };
}
