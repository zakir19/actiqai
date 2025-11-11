// Free tier limits
export const MAX_FREE_MEETINGS = 3;
export const MAX_FREE_AGENTS = 3;

// Monthly plan limits
export const MAX_MONTHLY_MEETINGS = 15;
export const MAX_MONTHLY_AGENTS = 15;

// Yearly plan - unlimited
export const UNLIMITED = -1;

// Plan types
export type PlanType = "free" | "monthly" | "yearly" | "enterprise";

// Plan limits configuration
export const PLAN_LIMITS = {
  free: {
    meetings: MAX_FREE_MEETINGS,
    agents: MAX_FREE_AGENTS,
    displayName: "Free Trial",
  },
  monthly: {
    meetings: MAX_MONTHLY_MEETINGS,
    agents: MAX_MONTHLY_AGENTS,
    displayName: "Monthly Plan",
  },
  yearly: {
    meetings: UNLIMITED, // -1 means unlimited
    agents: UNLIMITED,
    displayName: "Yearly Plan",
  },
  enterprise: {
    meetings: UNLIMITED,
    agents: UNLIMITED,
    displayName: "Enterprise",
  },
} as const;

// Pricing
export const PRICING = {
  monthly: {
    price: 26,
    currency: "USD",
    interval: "month",
    features: ["15 AI Agents", "15 Meetings per month", "Real-time voice calls", "Call recordings & transcripts", "Priority support"],
  },
  yearly: {
    price: 289,
    currency: "USD",
    interval: "year",
    monthlyEquivalent: 24.08, // ~$289/12
    savings: "2 months free!",
    features: ["Unlimited AI Agents", "Unlimited Meetings", "Real-time voice calls", "Call recordings & transcripts", "Priority support", "Advanced analytics"],
  },
  enterprise: {
    displayPrice: "Custom",
    features: ["Everything in Yearly", "Custom integrations", "Dedicated account manager", "SLA guarantee", "Custom training", "On-premise deployment option"],
  },
} as const;
