-- Real, server-side subscription/trial state for the R$39,90/month paywall.
-- Run this once in the Supabase SQL Editor. Everything else in this app
-- uses localStorage as a stand-in database, which is fine for demo/edit
-- state but cannot gate paid access (any user could edit it in DevTools) —
-- this table is the first real, RLS-protected data in the project.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'canceled')),
  trial_started_at timestamptz not null default now(),
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  cakto_customer_email text,
  cakto_subscription_id text,
  cakto_order_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- Users can see their own trial/subscription status (needed for the billing
-- page's countdown) but can never write to it directly — only the trigger
-- below and the webhook (using the service_role key, which bypasses RLS
-- entirely) are allowed to change it.
create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Starts the 14-day trial automatically for every new signup, regardless of
-- whether it came through email/password or Google OAuth — this fires at
-- the database level on any new auth.users row, so it isn't tied to which
-- Next.js route handled the specific signup method.
create or replace function public.handle_new_user_trial()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, trial_started_at, trial_ends_at)
  values (new.id, new.created_at, new.created_at + interval '14 days')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user_trial();

-- Looks up a user id by email for the Cakto webhook (app/api/webhooks/cakto/route.ts)
-- to correlate a payment back to a ZYRON account — auth.users isn't
-- reachable through the normal REST API even with the service_role key, but
-- a security-definer SQL function can read it directly.
create or replace function public.get_user_id_by_email(lookup_email text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from auth.users where email = lookup_email limit 1;
$$;

-- Backfills a trial row for accounts created before this migration ran,
-- using their real signup date rather than "now" — so, e.g., an account
-- that signed up 20 days ago correctly shows an already-expired trial
-- instead of getting a fresh 14 days for free.
insert into public.subscriptions (user_id, trial_started_at, trial_ends_at)
select id, created_at, created_at + interval '14 days'
from auth.users
on conflict (user_id) do nothing;
