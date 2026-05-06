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

  // Aha moments (PostHog detecta primeira ocorrência via funis)
  POST_CREATED: "post_created",
  PURCHASE_COMPLETED: "purchase_completed",
  COURSE_ENROLLED: "course_enrolled",

  // Lives
  LIVE_CREATED: "live_created",
  LIVE_STARTED: "live_started",
  LIVE_JOINED: "live_joined",
} as const;
