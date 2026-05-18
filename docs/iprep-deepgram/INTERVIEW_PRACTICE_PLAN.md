# Interview Practice Implementation Plan

> Created: 2026-05-18
> Last updated: 2026-05-18
> Feature file: `docs/iprep-deepgram/INTERVIEW_PRACTICE_FEATURE.md`
> Task tracker: `docs/iprep-deepgram/INTERVIEW_PRACTICE_TASKS.md`

## Current Progress

- Prisma schema and migration are complete for interview profiles, sessions, transcript messages, and websocket tokens.
- Migration `20260518000000_add_interview_practice` has been applied to the configured Supabase Postgres database.
- Prisma Client has been regenerated.
- PNPM workspace and Turbo config are in place.
- `server/interview-ws` exists as a starter separate Node `ws` service.
- `packages/interview-core` exists with initial interview constants and platform-key usage helper.
- Phase 2 Next.js API routes are complete for usage, session create/list/detail, and user-ended sessions.
- Platform-key session creation increments `platformFreeInterviewsUsed`; user-owned keys are still never accepted by normal Next.js APIs.
- Initial `/study-tracker/interview-practice` UI is in place with sidebar navigation, free usage display, and browser-only local Deepgram key save/remove/status controls.
- Local Deepgram key transmission to the websocket is still pending Phase 6 websocket client work.
- Phase 4 shared utilities are complete: Deepgram settings builder, transcript event normalization, timing-safe session token verification, end-condition helper, and platform-key usage policy.

## Phase 0 - Locked Decisions

- Use server `.env` `DEEPGRAM_API_KEY` only for each free user's first two `10` minute interviews.
- Do not hash, encrypt, or store user-owned Deepgram keys in the database.
- Store user-owned Deepgram keys only in browser `localStorage`.
- Send user-owned keys to the websocket proxy only for the active call.
- Run the realtime websocket proxy as a separate Node `ws` service.
- Use duration options `10` and `15` minutes only.
- Use question limit options `5`, `7`, and `10` only.
- Let the Deepgram agent produce final summary and feedback.
- Keep payment implementation out of V1, but add DB fields that support later paid entitlements.

## Phase 1 - Data Model

Add Prisma models for:

- user interview profile and plan state
- platform free interview usage count
- interview practice sessions
- transcript messages
- short-lived websocket session tokens

The model should preserve one user to many interview sessions, and one session to many transcript messages. Every interview session gets a unique database `id` and unique `publicId`.

`InterviewPracticeSession.keySource` should identify whether the call used the platform key or a user local key. No user Deepgram key value, hash, or fingerprint should be persisted.

## Phase 2 - Usage And Session API

Add authenticated Next.js routes for:

- reading interview usage and plan status
- creating interview sessions
- listing previous sessions
- loading one session with transcript
- marking a session ended by user

`POST /api/interview-practice/sessions` should validate:

- user is signed in
- role, company style, and focus are present
- duration is exactly `10` or `15`
- question limit is exactly `5`, `7`, or `10`
- platform key is allowed only when user is free, duration is `10`, and free platform usage is below `2`
- otherwise the request must declare that a local user key will be supplied to the websocket proxy

The API should create a session in `CREATED` state and return the session id plus separate websocket connection metadata.

## Phase 3 - LocalStorage Key UI

Build client-only key management in `/study-tracker/interview-practice`:

- save user Deepgram key to `localStorage`
- show whether a local key exists
- allow removing the local key
- never send the key to normal Next.js APIs
- send the key only when opening a user-key websocket session

The UI should also show remaining free platform-key interviews and explain that paid interviews are planned but not implemented yet.

## Phase 4 - Deepgram Settings Builder

Create a server/client-safe utility to build the Deepgram `Settings` payload from:

- role
- company style
- focus
- duration
- question limit

The prompt should require one question at a time, concise feedback between questions, and an end-of-interview summary when time or the question budget is reached.

## Phase 5 - Realtime Voice Client

Create the `/study-tracker/interview-practice` route using the Study Tracker visual system.

Client responsibilities:

- collect setup fields
- request microphone permission
- open the websocket session
- stream PCM audio to the websocket proxy
- play Deepgram agent audio
- show connection, mic, agent, timer, question count, and transcript state
- end interview manually
- render final Deepgram summary and feedback

Update the app security headers so microphone access is not blocked by `Permissions-Policy`.

## Phase 6 - Separate Websocket Proxy

Create a separate Node `ws` service for realtime interviews.

The service should:

- validate allowed origin
- validate short-lived session token
- accept the user local key only for user-key sessions
- use server `DEEPGRAM_API_KEY` only for approved platform-key sessions
- open Deepgram Voice Agent websocket server-side
- forward browser audio to Deepgram
- forward Deepgram audio/events to browser
- cap payloads and buffered messages
- end on idle, duration, question limit, user stop, or fatal error
- avoid logging or persisting any user-owned key

Next.js handles session/auth/history/database APIs. The websocket service handles realtime Deepgram audio.

## Phase 7 - Transcript Persistence

Normalize Deepgram conversation events into `InterviewPracticeMessage` rows.

Store:

- role
- content
- event type
- sequence number
- timestamp
- raw event JSON where useful

Use row storage instead of a blob so the UI can render history and summary generation can pull a clean ordered transcript.

## Phase 8 - Summary And Feedback

When the session ends:

- instruct Deepgram agent to summarize and give feedback
- mark session as `SUMMARIZING`
- persist the final summary and structured feedback
- update session as `COMPLETED`, `ENDED_BY_USER`, or `FAILED`
- show feedback in the route

## Phase 9 - Verification

Run:

- Prisma generate
- lint/build checks available for this project
- GitNexus detect changes before commit
- browser verification for desktop and mobile layout

Manual acceptance:

- signed-out users cannot create sessions
- first two free `10` minute interviews can use platform key
- third free platform-key interview is blocked unless user local key exists
- `15` minute interview requires user local key in V1
- server `DEEPGRAM_API_KEY` is never sent to browser
- user local key is never stored in the database
- `10`/`15` minute duration selector works
- `5`/`7`/`10` question limit selector works
- session has unique id
- transcript persists
- user stop ends the interview
- duration/question limit ends the interview and triggers Deepgram feedback
