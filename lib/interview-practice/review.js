import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const REVIEW_GUIDELINES_PATH = path.join(
  process.cwd(),
  "lib",
  "interview-practice",
  "REVIEW_GENERATION_GUIDELINES.md",
);

const TERMINAL_REVIEW_STATUSES = new Set(["COMPLETED", "ENDED_BY_USER", "FAILED"]);

const feedbackItemSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "detail"],
  properties: {
    title: { type: "string" },
    detail: { type: "string" },
  },
};

const reviewSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "feedback"],
  properties: {
    summary: { type: "string" },
    feedback: {
      type: "object",
      additionalProperties: false,
      required: [
        "overallScore",
        "scoreLabel",
        "scoreReason",
        "cards",
        "strengths",
        "improvementAreas",
        "recommendedPractice",
        "answerQualityNotes",
      ],
      properties: {
        overallScore: { type: "integer" },
        scoreLabel: { type: "string" },
        scoreReason: { type: "string" },
        cards: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["label", "score", "note"],
            properties: {
              label: { type: "string" },
              score: { type: "integer" },
              note: { type: "string" },
            },
          },
        },
        strengths: { type: "array", items: feedbackItemSchema },
        improvementAreas: { type: "array", items: feedbackItemSchema },
        recommendedPractice: { type: "array", items: feedbackItemSchema },
        answerQualityNotes: { type: "array", items: feedbackItemSchema },
      },
    },
  },
};

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function buildSafeTranscript(messages) {
  return messages
    .filter((message) => message.content?.trim())
    .map((message) => ({
      role: message.role,
      content: message.content,
      sequence: message.sequence,
      occurredAt: message.occurredAt,
    }));
}

function clampScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 1;
  return Math.max(1, Math.min(5, Math.round(score)));
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      title: String(item?.title || "").trim(),
      detail: String(item?.detail || "").trim(),
    }))
    .filter((item) => item.title && item.detail);
}

function normalizeFeedback(feedback) {
  const cards = Array.isArray(feedback?.cards) ? feedback.cards : [];

  return {
    overallScore: clampScore(feedback?.overallScore),
    scoreLabel: String(feedback?.scoreLabel || "Review").trim(),
    scoreReason: String(feedback?.scoreReason || "").trim(),
    cards: cards
      .map((card) => ({
        label: String(card?.label || "").trim(),
        score: clampScore(card?.score),
        note: String(card?.note || "").trim(),
      }))
      .filter((card) => card.label && card.note)
      .slice(0, 4),
    strengths: normalizeItems(feedback?.strengths),
    improvementAreas: normalizeItems(feedback?.improvementAreas),
    recommendedPractice: normalizeItems(feedback?.recommendedPractice),
    answerQualityNotes: normalizeItems(feedback?.answerQualityNotes),
  };
}

function validateReview(review) {
  const summary = String(review?.summary || "").trim();
  const feedback = normalizeFeedback(review?.feedback);

  if (!summary) {
    throw new Error("Review generation returned an empty summary.");
  }
  if (feedback.cards.length < 3) {
    throw new Error("Review generation returned too few score cards.");
  }

  return { summary, feedback };
}

export function canGenerateInterviewReview(session) {
  return TERMINAL_REVIEW_STATUSES.has(session?.status);
}

export async function generateInterviewReviewForSession(sessionId) {
  const session = await prisma.interviewPracticeSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        orderBy: [{ sequence: "asc" }, { occurredAt: "asc" }],
      },
    },
  });

  if (!session) throw new Error("Session not found.");

  const transcript = buildSafeTranscript(session.messages);
  if (transcript.length === 0) {
    throw new Error("Feedback needs transcript messages before it can be generated.");
  }

  const guidelines = await readFile(REVIEW_GUIDELINES_PATH, "utf8");
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL || "gpt-5.2";

  const response = await client.responses.create({
    model,
    instructions: guidelines,
    input: JSON.stringify({
      session: {
        role: session.role,
        companyStyle: session.companyStyle,
        focus: session.focus,
        durationMinutes: session.durationMinutes,
        questionLimit: session.questionLimit,
        questionCount: session.questionCount,
        status: session.status,
        endReason: session.endReason,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
      },
      transcript,
    }),
    text: {
      format: {
        type: "json_schema",
        name: "interview_review",
        strict: true,
        schema: reviewSchema,
      },
    },
  });

  const parsed = JSON.parse(response.output_text || "{}");
  const review = validateReview(parsed);

  return prisma.interviewPracticeSession.update({
    where: { id: session.id },
    data: {
      summary: review.summary,
      feedback: review.feedback,
    },
  });
}

export async function finalizeInterviewSessionWithReview({
  session,
  finalStatus,
  endReason,
  endedAt = new Date(),
}) {
  await prisma.interviewPracticeSession.update({
    where: { id: session.id },
    data: {
      status: "SUMMARIZING",
      endedAt,
      endReason,
    },
  });

  let reviewError = null;
  try {
    await generateInterviewReviewForSession(session.id);
  } catch (error) {
    reviewError = error?.message || "Could not generate interview feedback.";
  }

  const finalizedSession = await prisma.interviewPracticeSession.update({
    where: { id: session.id },
    data: {
      status: finalStatus,
      endedAt,
      endReason,
    },
  });

  return { session: finalizedSession, reviewError };
}
