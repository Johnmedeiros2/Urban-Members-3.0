import posthog from "posthog-js";

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}

export function identify(userId: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  posthog.identify(userId, properties);
}

export function reset() {
  if (typeof window === "undefined") return;
  posthog.reset();
}

// Eventos centralizados — usar essas constantes pra evitar erro de digitação
export const EVENTS = {
  // Funil de cadastro
  SIGNUP_STARTED: "signup_started",
  SIGNUP_COMPLETED: "signup_completed",
  REFERRAL_SIGNUP: "referral_signup",
  ONBOARDING_COMPLETED: "onboarding_completed",

  // Aha moments
  FIRST_POST_CREATED: "first_post_created",
  FIRST_PURCHASE: "first_purchase",
  COURSE_ENROLLMENT: "course_enrollment",

  // Lives
  LIVE_CREATED: "live_created",
  LIVE_STARTED: "live_started",
  LIVE_JOINED: "live_joined",
} as const;
