-- Shortens the free trial from 14 to 7 days and drops the monthly price to
-- R$19,90 (price itself lives in Cakto, not here — this migration only
-- covers the trial length, which is enforced server-side by this table).
-- Run once in the Supabase SQL Editor. Only affects NEW signups from here
-- on; existing trialing users keep whatever trial_ends_at they already have.

alter table public.subscriptions
  alter column trial_ends_at set default (now() + interval '7 days');

create or replace function public.handle_new_user_trial()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, trial_started_at, trial_ends_at)
  values (new.id, new.created_at, new.created_at + interval '7 days')
  on conflict (user_id) do nothing;
  return new;
end;
$$;
