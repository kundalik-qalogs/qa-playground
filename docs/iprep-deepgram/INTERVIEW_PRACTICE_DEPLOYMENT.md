# Interview Practice Deployment Guide

> Last updated: 2026-05-18

This guide deploys the Study Tracker Interview Practice feature with a Next.js
app plus a separate Node websocket service.

## Architecture

```text
Browser
  -> Next.js app
     -> /api/interview-practice/*
     -> Postgres via Prisma

Browser
  -> server/interview-ws websocket service
     -> internal Next.js routes /api/interview-practice/ws/*
     -> Deepgram Agent websocket
```

The browser stores a user-owned Deepgram key only in `localStorage`. For
user-local sessions, that key is sent only through the active websocket
connection and is not persisted by Next.js APIs.

## Required Services

- Next.js hosting for the main QA Playground app.
- Postgres database configured by `DATABASE_URL`.
- Separate Node hosting for `server/interview-ws`.
- Deepgram API key for platform-key free interviews.
- A shared internal secret between Next.js and the websocket service.

## Main App Environment

Set these on the Next.js app deployment:

```bash
DATABASE_URL="postgresql://..."
DEEPGRAM_API_KEY="dg_platform_key_for_free_interviews"
INTERVIEW_WS_URL="wss://your-interview-ws.example.com/interview-practice/ws"
INTERVIEW_WS_INTERNAL_SECRET="generate-a-long-random-secret"
```

Recommended existing app env vars should remain unchanged, including Better Auth
and any production base URL settings already used by the project.

## Websocket Service Environment

Set these on the `server/interview-ws` deployment:

```bash
PORT="3001"
DEEPGRAM_API_KEY="dg_platform_key_for_free_interviews"
INTERVIEW_API_BASE_URL="https://your-next-app.example.com"
INTERVIEW_WS_INTERNAL_SECRET="same-secret-as-next-app"
ALLOWED_ORIGINS="https://your-next-app.example.com"
```

Optional:

```bash
DEEPGRAM_AGENT_URL="wss://agent.deepgram.com/v1/agent/converse"
INTERVIEW_AGENT_GUIDELINES_PATH="../../packages/interview-core/INTERVIEW_AGENT_GUIDELINES.md"
```

Use `INTERVIEW_AGENT_GUIDELINES_PATH` only if the deployment layout differs from
the repository structure.

## Build Commands

From the repository root:

```bash
corepack pnpm install
corepack pnpm exec next build
corepack pnpm exec turbo build
```

For the websocket service only:

```bash
corepack pnpm --filter @qa-playground/interview-ws build
corepack pnpm --filter @qa-playground/interview-ws start
```

## Database Setup

Run Prisma generation and migrations before production traffic:

```bash
corepack pnpm exec prisma generate
corepack pnpm exec prisma migrate deploy
```

The interview feature requires these tables:

- `UserInterviewProfile`
- `InterviewPracticeSession`
- `InterviewPracticeMessage`
- `InterviewSessionToken`

## Railway Deployment Example

### Next.js App

Use the repository root as the service root.

Build command:

```bash
corepack pnpm install && corepack pnpm exec prisma generate && corepack pnpm exec next build
```

Start command:

```bash
corepack pnpm start
```

### Websocket Service

Use the repository root as the service root.

Build command:

```bash
corepack pnpm install && corepack pnpm --filter @qa-playground/interview-ws build
```

Start command:

```bash
corepack pnpm --filter @qa-playground/interview-ws start
```

Make sure the websocket service exposes a public `wss://` URL and copy that URL
into the Next.js app as `INTERVIEW_WS_URL`.

## Security Checklist

- Use HTTPS for the Next.js app and WSS for the websocket service.
- Set `ALLOWED_ORIGINS` to the exact production app origin.
- Set `INTERVIEW_WS_INTERNAL_SECRET` on both services.
- Do not expose `DEEPGRAM_API_KEY` to the browser.
- Confirm user Deepgram keys are not logged by the websocket service.
- Keep `Permissions-Policy` allowing same-origin microphone access:

```text
microphone=(self)
```

## Verification

1. Visit:

```text
https://your-next-app.example.com/study-tracker/interview-practice
```

2. Confirm the Settings tab loads free usage.
3. Confirm a 10 minute platform-key session can be created while free usage is
   available.
4. Confirm the UI moves to:

```text
?tab=session&id=<sessionId>
```

5. Confirm the websocket service logs a validated session.
6. Confirm Deepgram connects and the agent status changes.
7. Speak into the microphone and confirm transcript messages appear.
8. End the session and confirm History shows the session row.
9. Click Analytics and confirm the URL becomes:

```text
?tab=analytics&id=<sessionId>
```

10. Confirm `InterviewPracticeMessage` rows are persisted for transcript events.

## Troubleshooting

### Websocket Fails To Connect

- Check `INTERVIEW_WS_URL` includes `/interview-practice/ws`.
- Check the websocket deployment is reachable over `wss://`.
- Check `ALLOWED_ORIGINS` includes the exact app origin.

### Session Validation Fails

- Check `INTERVIEW_API_BASE_URL` points to the Next.js app.
- Check `INTERVIEW_WS_INTERNAL_SECRET` matches on both services.
- Check websocket tokens are used before their five minute expiry.

### Deepgram Fails

- Check `DEEPGRAM_API_KEY` is set on the websocket service.
- For user-local sessions, confirm a local key is saved in Settings.
- Check Deepgram account billing/permissions for Agent websocket access.

### Microphone Is Blocked

- Confirm the site is served over HTTPS in production.
- Confirm browser permission is allowed for the site.
- Confirm `Permissions-Policy` is not set to `microphone=()`.

## Rollback

If realtime interviews cause production issues:

1. Remove or unset `INTERVIEW_WS_URL` in the Next.js app.
2. Stop the websocket service.
3. Keep Phase 2 APIs available so usage/history data remains readable.
4. Re-enable after fixing websocket or Deepgram configuration.
