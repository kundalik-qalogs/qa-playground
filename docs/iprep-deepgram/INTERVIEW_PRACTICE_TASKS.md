# Interview Practice Task Tracker

> Created: 2026-05-18
> Last updated: 2026-05-18
> Status: Phase 6 realtime websocket path complete; summary and analytics polish pending

## Status Legend

| Symbol | Meaning |
|---|---|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Done |
| `[!]` | Blocked / needs decision |

## Phase 0 - Decisions

- [x] **0.1** Deepgram key strategy decided: platform key for first two free `10` minute interviews, user local key after that
- [x] **0.2** User-owned keys decided: stored only in browser `localStorage`, not hashed or stored in DB
- [x] **0.3** Websocket hosting decided: separate Node `ws` service
- [x] **0.4** Summary/feedback provider decided: Deepgram agent
- [x] **0.5** Question limits decided: `5`, `7`, `10`
- [x] **0.6** Duration options decided: `10`, `15`
- [x] **0.7** Payment scope decided: out of V1, but DB plan/usage fields should support future paid interviews

## Phase 1 - Prisma Schema

- [x] **1.1** Add interview status/message role/key source/plan enums
- [x] **1.2** Add `UserInterviewProfile` for plan and platform free usage count
- [x] **1.3** Add `InterviewPracticeSession`
- [x] **1.4** Add `InterviewPracticeMessage`
- [x] **1.5** Add `InterviewSessionToken`
- [x] **1.6** Add interview relations to `User`
- [x] **1.7** Create Prisma migration
- [x] **1.8** Run Prisma generate
- [x] **1.9** Apply migration `20260518000000_add_interview_practice` to configured Supabase Postgres database

## Phase 2 - Usage And Session Routes

- [x] **2.1** Add `GET /api/interview-practice/usage`
- [x] **2.2** Add `POST /api/interview-practice/sessions`
- [x] **2.3** Add `GET /api/interview-practice/sessions`
- [x] **2.4** Add `GET /api/interview-practice/sessions/[id]`
- [x] **2.5** Add `PATCH /api/interview-practice/sessions/[id]/end`
- [x] **2.6** Add authenticated ownership checks
- [x] **2.7** Add duration validation for `10` and `15` only
- [x] **2.8** Add question limit validation for `5`, `7`, and `10` only
- [x] **2.9** Add free quota validation: first two free `10` minute platform-key interviews only
- [x] **2.10** Require user-local key mode after free quota or for `15` minute interviews
- [x] **2.11** Add short-lived websocket token creation

## Phase 3 - LocalStorage Key UI

- [x] **3.1** Add browser-only Deepgram key save/remove controls
- [x] **3.2** Store user key in `localStorage`
- [x] **3.3** Show whether local key exists without displaying full key
- [x] **3.4** Send local key only when opening a user-key websocket session
- [x] **3.5** Ensure no normal Next.js API persists or echoes the user key

## Phase 4 - Interview Utilities

- [x] **4.1** Add Deepgram settings builder
- [x] **4.2** Add transcript event normalizer
- [x] **4.3** Add session token hash/verify helpers
- [x] **4.4** Add interview end-condition helper for duration/question limit
- [x] **4.5** Add usage policy helper for platform-key vs user-local-key sessions

## Phase 5 - Study Tracker UI

- [x] **5.1** Add sidebar nav item for Interview Practice
- [x] **5.2** Add `/study-tracker/interview-practice/page.jsx`
- [x] **5.3** Add setup form with role, company style, focus, duration, and question limit
- [x] **5.4** Add free quota and local key status panels
- [x] **5.5** Add future "buy interviews" placeholder
- [x] **5.6** Add live status row
- [x] **5.7** Add transcript panel
- [x] **5.8** Add final summary/feedback panel
- [x] **5.9** Verify responsive layout in Study Tracker shell
- [x] **5.10** Update microphone permissions in security headers

## Phase 6 - Realtime Audio And Separate Websocket Service

- [x] **6.1** Port browser microphone capture helper
- [x] **6.2** Port PCM conversion/playback helper
- [x] **6.3** Add websocket client lifecycle
- [x] **6.4** Add separate Node `ws` service
- [x] **6.5** Add origin/session-token validation
- [x] **6.6** Support platform-key sessions from server `.env`
- [x] **6.7** Support user-local-key sessions without persisting or logging the key
- [x] **6.8** Add payload, idle, duration, and question-limit guards
- [x] **6.9** Add transcript event forwarding/persistence integration

## Phase 7 - Transcript, Summary, Feedback

- [x] **7.1** Persist transcript rows during or after session
- [x] **7.2** Count interviewer questions
- [x] **7.3** Trigger end behavior on duration or question limit
- [ ] **7.4** Ask Deepgram agent for summary and feedback
- [ ] **7.5** Store summary and structured feedback
- [ ] **7.6** Render saved feedback for completed session

## Phase 8 - Verification

- [x] **8.1** Run `npx gitnexus analyze` if index is stale
- [~] **8.2** Run GitNexus impact analysis before editing every existing symbol
- [~] **8.3** Run lint/build checks
- [~] **8.4** Run `gitnexus_detect_changes()` before commit
- [ ] **8.5** Manually verify create, start, stop, auto-end, transcript, and feedback flows
- [ ] **8.6** Verify server platform key never reaches browser
- [ ] **8.7** Verify user local key never reaches DB or logs

## Files Expected To Change

```text
prisma/schema.prisma
prisma/migrations/20260518000000_add_interview_practice/migration.sql
pnpm-workspace.yaml
turbo.json
packages/interview-core/**
lib/interview-practice/api.js
app/(study)/study-tracker/_components/Sidebar.jsx
app/(study)/study-tracker/interview-practice/page.jsx
app/api/interview-practice/**
lib/interview-practice/**
server/interview-ws/**
next.config.mjs
docs/iprep-deepgram/INTERVIEW_PRACTICE_FEATURE.md
docs/iprep-deepgram/INTERVIEW_PRACTICE_PLAN.md
docs/iprep-deepgram/INTERVIEW_PRACTICE_TASKS.md
```

## Notes

- Prisma migration `20260518000000_add_interview_practice` has been applied and `prisma generate` has run successfully.
- PNPM workspace and Turbo config have been added with root Next.js app kept in place.
- `server/interview-ws` exists as a separate Node `ws` service with `/health`, Deepgram proxying, origin checks, session token validation, and transcript forwarding.
- `packages/interview-core` exists with interview constants, platform-key usage helper, Deepgram settings builder, transcript event normalizer, and end-condition helper.
- Common first-session interview agent guidelines are stored at `packages/interview-core/INTERVIEW_AGENT_GUIDELINES.md` for the websocket/session-start payload.
- Phase 2 API routes are complete and compile in Next build. Creating a platform-key session increments `platformFreeInterviewsUsed`.
- Phase 3 local key management UI is complete for save/remove/status. User-owned keys are sent only through the active websocket start message for user-local sessions.
- Phase 4 utilities are complete. `verifySessionToken()` is available in `lib/interview-practice/api.js` for upcoming websocket validation.
- The `/study-tracker/interview-practice` route now has the Phase 5 setup form, session creation action, live status placeholders, transcript placeholder, feedback placeholder, buy-interviews placeholder, usage panel, and local-key panel.
- Phase 6 realtime path is wired: browser mic capture, PCM send/playback, websocket client lifecycle, separate `ws` proxy, origin/session token validation, platform and user-local key support, transcript persistence, and duration/question-limit end checks.
- The websocket service calls internal Next routes under `/api/interview-practice/ws/*`. Set the same `INTERVIEW_WS_INTERNAL_SECRET` in the Next app and websocket service in production.
- `next.config.mjs` allows same-origin microphone access with `microphone=(self)` while keeping camera and geolocation disabled.
- User-owned Deepgram keys are handled only in browser `localStorage` and active websocket payloads.
- Existing app auth uses Better Auth via `auth.api.getSession({ headers })`.
- Existing Study Tracker UI uses the shared shell at `app/(study)/study-tracker/layout.js`.
- Local websocket setup is represented in `.env` with `INTERVIEW_WS_URL`, `INTERVIEW_WS_PORT`, `INTERVIEW_API_BASE_URL`, `ALLOWED_ORIGINS`, and `INTERVIEW_AGENT_GUIDELINES_PATH`.
