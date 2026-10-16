export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";

export interface Subscription {
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  is_admin: boolean;
  current_period_end: string | null;
  cancel_requested_at: string | null;
  // Only set by the Cakto webhook — distinguishes a real paid subscription
  // from `status === "active"` granted temporarily by watching a rewarded
  // ad (see grant_ad_unlock() in supabase/migrations/0007_*.sql), which has
  // nothing to actually cancel.
  cakto_subscription_id: string | null;
}
