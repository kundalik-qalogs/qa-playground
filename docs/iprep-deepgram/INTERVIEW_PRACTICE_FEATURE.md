# Study Tracker Interview Practice Feature

> Created: 2026-05-18
> Last updated: 2026-05-18
> Route: `/study-tracker/interview-practice`
> Reference docs: `docs/iprep-deepgram/INSTRUCTIONS.md`, `docs/iprep-deepgram/ARCHITECTURE_NOTES.md`
> Status: Planned

## Goal

Add a signed-in interview practice area inside the Study Tracker where users can start real-time Deepgram Voice Agent interviews by entering:

- role
- company style
- interview focus
- interview duration: `10` or `15` minutes only
- question limit: `5`, `7`, or `10` questions only

The interview should store transcript rows in the database, end automatically when the selected duration or question limit is reached, then ask the Deepgram agent to produce summary and feedback before the call ends.

## Access And Deepgram Key Rules

V1 has three access situations:

1. Free users get two `10` minute interviews using the platform `DEEPGRAM_API_KEY` from `.env`.
2. After the two free platform-key interviews are used, users must add their own Deepgram API key for future interviews.
3. Paid users still use their own Deepgram API key in V1. Later, when the payment system is built, paid plans can receive platform-provided interview credits or a platform-managed key policy.

User-owned Deepgram API keys are never hashed and never stored in the database. The browser stores the user key in `localStorage`. When a user-key interview starts, the browser sends the key to the separate websocket proxy for that active call only. The proxy must not log, persist, or return that key.

The server-owned `.env` key must never be sent to the browser.

## User Experience

The new route should live at:

```text
/study-tracker/interview-practice
```

It should follow the existing Study Tracker UI system:

- same sidebar shell, page background, spacing, and quiet dashboard-style cards
- no marketing hero page
- a compact setup form for role, company style, focus, duration, and question limit
- local Deepgram key status with save/remove controls backed by `localStorage`
- usage status showing remaining free platform-key interviews
- live status row for connection, mic, agent, elapsed time, remaining time, and question count
- transcript panel with grouped messages
- final summary and feedback panel after the interview ends
- a simple "buy interviews" placeholder for the future payment system

## Core Flow

1. User opens `/study-tracker/interview-practice`.
2. UI loads local Deepgram key status from `localStorage`.
3. UI fetches server-side interview usage and plan status.
4. User creates an interview configuration with role, company style, focus, duration, and question limit.
5. Next.js API validates the signed-in user and key policy:
   - platform key allowed only for free user, `10` minute duration, and fewer than two platform-key interviews used
   - otherwise the session requires a user key from `localStorage`
6. Server creates a unique interview record for that user.
7. Browser opens a backend-owned websocket session on the separate Node websocket service.
8. Websocket proxy connects to Deepgram:
   - platform-key sessions use server `DEEPGRAM_API_KEY`
   - user-key sessions use the key provided for that active websocket only
9. Browser streams microphone audio and plays agent audio.
10. Transcript events are normalized and persisted.
11. Interview ends when:
   - user clicks end call
   - selected duration is reached
   - selected question limit is reached
   - websocket or Deepgram returns a fatal error
12. Deepgram agent produces final summary and feedback, and the session is marked completed or failed.

## Proposed Prisma Models

```prisma
enum InterviewPlan {
  FREE
  PAID
}

enum InterviewKeySource {
  PLATFORM
  USER_LOCAL
}

enum InterviewStatus {
  CREATED
  ACTIVE
  SUMMARIZING
  COMPLETED
  ENDED_BY_USER
  FAILED
}

enum InterviewMessageRole {
  SYSTEM
  INTERVIEWER
  USER
}

model UserInterviewProfile {
  id                         String        @id @default(cuid())
  userId                     String        @unique
  user                       User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan                       InterviewPlan @default(FREE)
  platformFreeInterviewsUsed Int           @default(0)
  createdAt                  DateTime      @default(now())
  updatedAt                  DateTime      @updatedAt
}

model InterviewPracticeSession {
  id                String                     @id @default(cuid())
  userId            String
  user              User                       @relation(fields: [userId], references: [id], onDelete: Cascade)
  publicId          String                     @unique @default(cuid())
  status            InterviewStatus            @default(CREATED)
  keySource         InterviewKeySource
  role              String
  companyStyle      String
  focus             String
  durationMinutes   Int
  questionLimit     Int
  questionCount     Int                        @default(0)
  deepgramRequestId String?
  startedAt         DateTime?
  endedAt           DateTime?
  endReason         String?
  summary           String?
  feedback          Json?
  createdAt         DateTime                   @default(now())
  updatedAt         DateTime                   @updatedAt
  messages          InterviewPracticeMessage[]
  tokens            InterviewSessionToken[]

  @@index([userId, createdAt])
  @@index([userId, status])
}

model InterviewPracticeMessage {
  id         String                   @id @default(cuid())
  sessionId  String
  session    InterviewPracticeSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  role       InterviewMessageRole
  content    String
  source     String                   @default("deepgram")
  eventType  String?
  sequence   Int
  occurredAt DateTime                 @default(now())
  rawEvent   Json?

  @@unique([sessionId, sequence])
  @@index([sessionId, occurredAt])
}

model InterviewSessionToken {
  id        String                   @id @default(cuid())
  sessionId String
  session   InterviewPracticeSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  tokenHash String
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime                 @default(now())

  @@index([sessionId])
}
```

Add these relations to `User`:

```prisma
interviewProfile  UserInterviewProfile?
interviewSessions InterviewPracticeSession[]
```

## API Surface

Proposed Next.js routes:

```text
GET    /api/interview-practice/usage
GET    /api/interview-practice/sessions
POST   /api/interview-practice/sessions
GET    /api/interview-practice/sessions/[id]
PATCH  /api/interview-practice/sessions/[id]/end
```

There is no credential persistence API in V1 because user Deepgram keys stay in browser `localStorage`.

The realtime websocket proxy should run as a separate Node `ws` service, not as a Vercel/serverless API route:

```text
wss://<interview-ws-service>/interview-practice/ws
```

Next.js owns auth, usage rules, session records, history, and transcript APIs. The websocket service owns realtime audio proxying to Deepgram.

## Transcript Storage Format

Store transcript as normalized rows in `InterviewPracticeMessage`, not a single blob. This makes it easier to:

- render live history
- generate summaries
- count interviewer questions
- audit Deepgram event handling
- add search or analytics later

Each row should store the display content plus the raw Deepgram event JSON when useful.

## Summary And Feedback

At interview end, the Deepgram agent should produce:

- concise session summary
- strengths
- improvement areas
- answer quality notes
- follow-up practice suggestions
- question count and duration metadata

Store the structured feedback in `feedback Json` and a short human-readable overview in `summary`.

## Final Decisions

- Server `.env` `DEEPGRAM_API_KEY` is used only for the first two free `10` minute interviews.
- User-owned Deepgram keys are never hashed and never stored in the database.
- User-owned keys are stored in browser `localStorage`.
- User-owned keys are sent to the websocket proxy only for the active call.
- Websocket proxy runs as a separate Node service.
- Question limits are exactly `5`, `7`, and `10`.
- Durations are exactly `10` and `15` minutes.
- Deepgram agent produces final summary and feedback.
- Payment system is out of scope for V1, but plan/usage DB fields should support it later.

## Implementation Warning

The current `next.config.mjs` security header sets `Permissions-Policy` to `microphone=()`, which blocks microphone access. The implementation must update this policy so the interview route can request microphone permission safely.
