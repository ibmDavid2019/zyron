export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";

export interface Subscription {
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  is_admin: boolean;
  current_period_end: string | null;
}
