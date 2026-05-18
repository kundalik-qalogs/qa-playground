export const INTERVIEW_DURATIONS = [10, 15];

export const INTERVIEW_QUESTION_LIMITS = [5, 7, 10];

export const INTERVIEW_KEY_SOURCES = {
  PLATFORM: "PLATFORM",
  USER_LOCAL: "USER_LOCAL",
};

export function isSupportedDuration(durationMinutes) {
  return INTERVIEW_DURATIONS.includes(Number(durationMinutes));
}

export function isSupportedQuestionLimit(questionLimit) {
  return INTERVIEW_QUESTION_LIMITS.includes(Number(questionLimit));
}

export function canUsePlatformKey({ plan = "FREE", durationMinutes, platformFreeInterviewsUsed = 0 }) {
  return (
    plan === "FREE" &&
    Number(durationMinutes) === 10 &&
    Number(platformFreeInterviewsUsed) < 2
  );
}

