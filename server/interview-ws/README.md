# Interview Websocket Service

Separate Node `ws` service for real-time Deepgram interview calls.

## Local Commands

```bash
pnpm dev:ws
```

or from this folder:

```bash
pnpm dev
```

## Railway Setup

- Root directory: `server/interview-ws`
- Start command: `pnpm start`
- Health check path: `/health`

## Environment Variables

```env
DEEPGRAM_API_KEY=your_platform_key
DEEPGRAM_AGENT_URL=wss://agent.deepgram.com/v1/agent/converse
ALLOWED_ORIGINS=http://localhost:3000,https://qaplayground.com,https://www.qaplayground.com
INTERVIEW_WS_PORT=3001
```

