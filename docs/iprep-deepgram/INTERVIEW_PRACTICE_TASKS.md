# Interview Practice Task Tracker

> Created: 2026-05-18
> Last updated: 2026-05-18
> Status: Foundation in progress - Prisma schema and monorepo skeleton complete

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

- [ ] **2.1** Add `GET /api/interview-practice/usage`
- [ ] **2.2** Add `POST /api/interview-practice/sessions`
- [ ] **2.3** Add `GET /api/interview-practice/sessions`
- [ ] **2.4** Add `GET /api/interview-practice/sessions/[id]`
- [ ] **2.5** Add `PATCH /api/interview-practice/sessions/[id]/end`
- [ ] **2.6** Add authenticated ownership checks
- [ ] **2.7** Add duration validation for `10` and `15` only
- [ ] **2.8** Add question limit validation for `5`, `7`, and `10` only
- [ ] **2.9** Add free quota validation: first two free `10` minute platform-key interviews only
- [ ] **2.10** Require user-local key mode after free quota or for `15` minute interviews
- [ ] **2.11** Add short-lived websocket token creation

## Phase 3 - LocalStorage Key UI

- [ ] **3.1** Add browser-only Deepgram key save/remove controls
- [ ] **3.2** Store user key in `localStorage`
- [ ] **3.3** Show whether local key exists without displaying full key
- [ ] **3.4** Send local key only when opening a user-key websocket session
- [ ] **3.5** Ensure no normal Next.js API persists or echoes the user key

## Phase 4 - Interview Utilities

- [ ] **4.1** Add Deepgram settings builder
- [ ] **4.2** Add transcript event normalizer
- [ ] **4.3** Add session token hash/verify helpers
- [ ] **4.4** Add interview end-condition helper for duration/question limit
- [~] **4.5** Add usage policy helper for platform-key vs user-local-key sessions

## Phase 5 - Study Tracker UI

- [ ] **5.1** Add sidebar nav item for Interview Practice
- [ ] **5.2** Add `/study-tracker/interview-practice/page.jsx`
- [ ] **5.3** Add setup form with role, company style, focus, duration, and question limit
- [ ] **5.4** Add free quota and local key status panels
- [ ] **5.5** Add future "buy interviews" placeholder
- [ ] **5.6** Add live status row
- [ ] **5.7** Add transcript panel
- [ ] **5.8** Add final summary/feedback panel
- [ ] **5.9** Verify responsive layout in Study Tracker shell
- [ ] **5.10** Update microphone permissions in security headers

## Phase 6 - Realtime Audio And Separate Websocket Service

- [ ] **6.1** Port browser microphone capture helper
- [ ] **6.2** Port PCM conversion/playback helper
- [ ] **6.3** Add websocket client lifecycle
- [~] **6.4** Add separate Node `ws` service
- [ ] **6.5** Add origin/session-token validation
- [ ] **6.6** Support platform-key sessions from server `.env`
- [ ] **6.7** Support user-local-key sessions without persisting or logging the key
- [ ] **6.8** Add payload, idle, duration, and question-limit guards
- [ ] **6.9** Add transcript event forwarding/persistence integration

## Phase 7 - Transcript, Summary, Feedback

- [ ] **7.1** Persist transcript rows during or after session
- [ ] **7.2** Count interviewer questions
- [ ] **7.3** Trigger end behavior on duration or question limit
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
- `server/interview-ws` exists as a starter Node `ws` service with `/health`; Deepgram proxy/session validation is still pending.
- `packages/interview-core` exists with initial constants and platform-key usage helper; deeper interview utilities are still pending.
- User-owned Deepgram keys are handled only in browser `localStorage` and active websocket payloads.
- Existing app auth uses Better Auth via `auth.api.getSession({ headers })`.
- Existing Study Tracker UI uses the shared shell at `app/(study)/study-tracker/layout.js`.
- Current `next.config.mjs` has `Permissions-Policy` set to `microphone=()`, which must be changed before microphone capture can work.
