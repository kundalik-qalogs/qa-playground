export const INTERVIEW_DURATIONS = [10, 15];

export const INTERVIEW_QUESTION_LIMITS = [5, 7, 10];

export const PLATFORM_FREE_INTERVIEW_LIMIT = 2;

export const INTERVIEW_KEY_SOURCES = {
  PLATFORM: "PLATFORM",
  USER_LOCAL: "USER_LOCAL",
};

export const INTERVIEW_END_REASONS = {
  USER_ENDED: "user_ended",
  DURATION_REACHED: "duration_reached",
  QUESTION_LIMIT_REACHED: "question_limit_reached",
  DEEPGRAM_ERROR: "deepgram_error",
  CONNECTION_CLOSED: "connection_closed",
};

export const INTERVIEW_MESSAGE_ROLES = {
  SYSTEM: "SYSTEM",
  INTERVIEWER: "INTERVIEWER",
  USER: "USER",
};

export const DEEPGRAM_SAMPLE_RATE = 24000;

export function isSupportedDuration(durationMinutes) {
  return INTERVIEW_DURATIONS.includes(Number(durationMinutes));
}

export function isSupportedQuestionLimit(questionLimit) {
  return INTERVIEW_QUESTION_LIMITS.includes(Number(questionLimit));
}

export function canUsePlatformKey({
  plan = "FREE",
  durationMinutes,
  platformFreeInterviewsUsed = 0,
}) {
  return (
    plan === "FREE" &&
    Number(durationMinutes) === 10 &&
    Number(platformFreeInterviewsUsed) < PLATFORM_FREE_INTERVIEW_LIMIT
  );
}

export function buildDeepgramSettings({
  role = "Software Engineer",
  companyStyle = "General product company",
  focus = "Ask practical interview questions and give concise feedback.",
  durationMinutes = 10,
  questionLimit = 5,
  commonGuidelines = "",
} = {}) {
  const safeRole = String(role || "Software Engineer").trim();
  const safeCompanyStyle = String(
    companyStyle || "General product company",
  ).trim();
  const safeFocus = String(
    focus || "Ask practical interview questions and give concise feedback.",
  ).trim();
  const safeDuration = isSupportedDuration(durationMinutes)
    ? Number(durationMinutes)
    : 10;
  const safeQuestionLimit = isSupportedQuestionLimit(questionLimit)
    ? Number(questionLimit)
    : 5;
  const safeCommonGuidelines = String(commonGuidelines || "").trim();

  return {
    type: "Settings",
    audio: {
      input: {
        encoding: "linear16",
        sample_rate: DEEPGRAM_SAMPLE_RATE,
      },
      output: {
        encoding: "linear16",
        sample_rate: DEEPGRAM_SAMPLE_RATE,
        container: "none",
      },
    },
    agent: {
      language: "en",
      greeting: `Hi, I am your interviewer for a ${safeRole} role. Introduce yourself briefly and we will begin.`,
      listen: {
        provider: {
          type: "deepgram",
          model: "flux-general-en",
        },
      },
      think: {
        provider: {
          type: "open_ai",
          model: "gpt-4o-mini",
          temperature: 0.4,
        },
        prompt: [
          safeCommonGuidelines,
          "You are a professional interviewer helping the user practice for interviews.",
          `Target role: ${safeRole}.`,
          `Company or interview style: ${safeCompanyStyle}.`,
          `Interview focus: ${safeFocus}.`,
          `This interview has a ${safeDuration} minute time limit and a ${safeQuestionLimit} question limit.`,
          "Ask exactly one question at a time.",
          "Wait for the user's answer before asking the next question.",
          "After each answer, give brief, useful feedback before moving on.",
          "Track how many questions you have asked.",
          "When the time limit or question limit is reached, stop asking new questions.",
          "At the end, provide a concise summary, strengths, improvement areas, and next practice suggestions.",
          "If the user interrupts, stop your current response and address the interruption naturally.",
        ].join(" "),
      },
      speak: {
        provider: {
          type: "deepgram",
          model: "aura-2-asteria-en",
        },
      },
    },
  };
}

export function normalizeDeepgramEvent(event, sequence = 0) {
  if (!event || typeof event !== "object") return null;

  if (event.type === "ConversationText") {
    const deepgramRole = event.role;
    const content = String(event.content || "").trim();
    if (!content) return null;

    return {
      role:
        deepgramRole === "assistant"
          ? INTERVIEW_MESSAGE_ROLES.INTERVIEWER
          : INTERVIEW_MESSAGE_ROLES.USER,
      content,
      source: "deepgram",
      eventType: event.type,
      sequence,
      rawEvent: event,
    };
  }

  if (event.type === "Warning" || event.type === "Error") {
    return {
      role: INTERVIEW_MESSAGE_ROLES.SYSTEM,
      content: event.description || event.message || event.type,
      source: "deepgram",
      eventType: event.type,
      sequence,
      rawEvent: event,
    };
  }

  if (event.type === "SettingsApplied") {
    return {
      role: INTERVIEW_MESSAGE_ROLES.SYSTEM,
      content: "Interview coach is ready.",
      source: "deepgram",
      eventType: event.type,
      sequence,
      rawEvent: event,
    };
  }

  return null;
}

export function isInterviewerQuestion(message) {
  if (!message || message.role !== INTERVIEW_MESSAGE_ROLES.INTERVIEWER) {
    return false;
  }

  return String(message.content || "").trim().endsWith("?");
}

export function getInterviewEndCondition({
  startedAt,
  now = new Date(),
  durationMinutes,
  questionLimit,
  questionCount = 0,
  userEnded = false,
  fatalError = false,
} = {}) {
  if (userEnded) {
    return { shouldEnd: true, reason: INTERVIEW_END_REASONS.USER_ENDED };
  }

  if (fatalError) {
    return { shouldEnd: true, reason: INTERVIEW_END_REASONS.DEEPGRAM_ERROR };
  }

  if (
    Number(questionLimit) > 0 &&
    Number(questionCount) >= Number(questionLimit)
  ) {
    return {
      shouldEnd: true,
      reason: INTERVIEW_END_REASONS.QUESTION_LIMIT_REACHED,
    };
  }

  if (startedAt && isSupportedDuration(durationMinutes)) {
    const startedMs = new Date(startedAt).getTime();
    const nowMs = new Date(now).getTime();
    const elapsedMs = nowMs - startedMs;
    const durationMs = Number(durationMinutes) * 60 * 1000;

    if (elapsedMs >= durationMs) {
      return {
        shouldEnd: true,
        reason: INTERVIEW_END_REASONS.DURATION_REACHED,
      };
    }
  }

  return { shouldEnd: false, reason: null };
}

