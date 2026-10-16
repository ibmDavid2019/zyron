-- Lets a user request cancellation of their subscription from within the
-- app. Cakto's public API has no endpoint to cancel a subscription (only
-- read access — confirmed by hand against their API), so this can't
-- actually stop the next charge by itself: it only records the request.
-- The seller cancels the real subscription manually in the Cakto dashboard
-- (Assinaturas → selecionar → Cancelar), matching by cakto_customer_email
-- or cakto_subscription_id.
--
-- The user keeps access until current_period_end regardless — requesting
-- cancellation only stops the *next* renewal, it doesn't revoke what was
-- already paid for.

alter table public.subscriptions
  add column if not exists cancel_requested_at timestamptz;

-- security definer so a user can flip this one column on their own row
-- without a broader UPDATE policy that could let them tamper with status
-- or is_admin — auth.uid() scopes it to the caller's own row.
create or replace function public.request_cancel_subscription()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.subscriptions
  set cancel_requested_at = now(), updated_at = now()
  where user_id = auth.uid();
end;
$$;

grant execute on function public.request_cancel_subscription() to authenticated;
