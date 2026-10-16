-- Adds the ad-unlock flow that replaces Cakto as the way to get full
-- access once the free trial ends: watching a rewarded ad grants 24h of
-- access, the same way `status = 'active'` already worked for a paid
-- subscription. Run once in the Supabase SQL Editor.
--
-- Deliberately does NOT drop the old Cakto-related columns
-- (cakto_customer_email, cakto_subscription_id, cakto_order_id,
-- cancel_requested_at) or functions (get_user_id_by_email,
-- request_cancel_subscription) — they're unused by the app from here on,
-- but kept so no already-registered account's data is deleted. Drop them
-- later, deliberately, if you ever want to.

-- security definer so a user can grant this to their own row without a
-- broader UPDATE policy that could let them tamper with is_admin —
-- auth.uid() scopes it to the caller's own row. Client code (features/billing)
-- only calls this after the AdMob SDK reports the reward was actually
-- earned, but the 24h grant itself is enforced here, not trusted from the
-- client beyond that.
create or replace function public.grant_ad_unlock()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.subscriptions
  set status = 'active', current_period_end = now() + interval '24 hours', updated_at = now()
  where user_id = auth.uid();
end;
$$;

grant execute on function public.grant_ad_unlock() to authenticated;
