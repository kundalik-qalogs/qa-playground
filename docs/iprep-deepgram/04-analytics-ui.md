# OpenAI Interview Review Generation + UI Rendering

## Summary

Implement final interview review generation and candidate-facing rendering. When an interview ends, the app will load the ordered transcript, send safe analysis inputs to OpenAI with a new markdown instruction file, store a markdown `summary` plus structured `feedback`, and render the result as score cards + FAQ-style accordions in Analytics.

## Backend Changes

- Add OpenAI review helper under `lib/interview-practice/`:
  - reads `OPENAI_API_KEY`
  - uses `OPENAI_MODEL`, default `gpt-5.2`
  - reads new `REVIEW_GENERATION_GUIDELINES.md`
  - loads session metadata and ordered transcript rows
  - excludes secrets, raw event JSON, request IDs, user email/name, and keys
  - calls Responses API with Structured Outputs
  - validates parsed output before saving
- Add `POST /api/interview-practice/sessions/[id]/feedback`:
  - requires signed-in user
  - verifies session ownership
  - only allows terminal sessions: `COMPLETED`, `ENDED_BY_USER`, `FAILED`
  - regenerates summary/feedback on demand
  - returns `{ session }`
- Wire inline generation into end flows:
  - user end route
  - websocket end route
  - auto-end after question/duration limit in transcript persistence
  - flow: set `SUMMARIZING` → generate review → save `summary`/`feedback` → set final status
  - if OpenAI fails, preserve final interview status and return `reviewError`; do not fail the session solely because review generation failed.

## Review Data Shape

- Store `summary` as markdown text in existing `InterviewPracticeSession.summary`.
- Store `feedback` JSON in existing `InterviewPracticeSession.feedback`.
- Feedback schema:

```json
{
  "overallScore": 3,
  "scoreLabel": "Developing",
  "scoreReason": "Short score explanation",
  "cards": [
    { "label": "Question Coverage", "score": 3, "note": "Specific note" },
    { "label": "Communication", "score": 4, "note": "Specific note" },
    { "label": "Automation Depth", "score": 2, "note": "Specific note" },
    { "label": "Debugging Depth", "score": 3, "note": "Specific note" }
  ],
  "strengths": [
    {
      "title": "Clear defect communication",
      "detail": "Evidence from transcript"
    }
  ],
  "improvementAreas": [
    {
      "title": "Edge case coverage",
      "detail": "What was missing and how to improve"
    }
  ],
  "recommendedPractice": [
    { "title": "Practice API negative cases", "detail": "Concrete next task" }
  ],
  "answerQualityNotes": [
    { "title": "Completeness", "detail": "Grounded note from transcript" }
  ]
}
```

## UI Changes

- Update Analytics review area:
  - replace raw `JSON.stringify(session.feedback)` with polished rendering
  - top row: 3-4 compact score cards from `feedback.cards`
  - main score card: overall score, label, and short reason
  - summary: render markdown from `session.summary` in a clean readable panel
  - feedback details: FAQ/accordion sections for:
    - Strengths
    - Improvement Areas
    - Recommended Practice
    - Answer Quality Notes
- Add states:
  - `SUMMARIZING`: show “Generating feedback...” with spinner
  - no summary/feedback on ended session: show `Generate feedback` button calling the new route
  - failed generation: show warning and `Regenerate feedback`
  - empty transcript: show disabled message explaining transcript is required

## Test Plan

- Backend:
  - unauthenticated feedback route returns `401`
  - wrong user/session returns `404`
  - active session returns `400`
  - empty transcript returns controlled error
  - OpenAI failure still leaves interview ended
  - successful generation stores markdown summary and JSON feedback
- UI:
  - renders score cards correctly
  - renders markdown summary safely
  - accordion sections handle empty arrays
  - loading/error/regenerate states work
- Verification:
  - run focused ESLint on changed API/UI/helper files
  - run `next build`
  - run GitNexus `detect_changes`
  - manually verify user end, websocket end, and analytics regenerate flow

## Assumptions

- Use OpenAI only, not Deepgram, for final review generation.
- No Prisma migration is needed because `summary` and `feedback` already exist.
- Summary is markdown; feedback is structured JSON.
- The UI should be dashboard-like: compact cards plus FAQ accordions, not a long report page.
