-- Real, server-side storage for shareable activity media. Activities
-- themselves stay in localStorage (utils/local-store.ts) — this table only
-- stores what's needed to serve a public share page and remember the
-- editor's last state, keyed loosely by the client-generated activity id
-- rather than a foreign key into a real `activities` table (none exists).

create table if not exists public.shared_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_activity_id text not null,
  share_token text not null unique,
  is_public boolean not null default false,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, client_activity_id)
);

create table if not exists public.activity_media (
  id uuid primary key default gen_random_uuid(),
  shared_activity_id uuid not null references public.shared_activities (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('photo', 'video')),
  layout text not null check (layout in ('minimal', 'sport', 'dynamic')),
  overlay_spec jsonb not null default '{}'::jsonb,
  source_storage_path text,
  output_storage_path text,
  output_mime text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'ready', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shared_activities enable row level security;
alter table public.activity_media enable row level security;

-- Owners manage their own rows directly. There is deliberately NO public
-- select policy here — the public /s/[token] page reads via the
-- service-role admin client (see lib/supabase/admin.ts, same pattern as
-- app/api/webhooks/cakto/route.ts) and explicitly filters is_public = true
-- in application code, rather than trusting RLS to gate anonymous access
-- to a table that also holds non-public snapshots.
create policy "Users manage their own shared activities"
  on public.shared_activities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own activity media"
  on public.activity_media for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists shared_activities_share_token_idx on public.shared_activities (share_token);
create index if not exists activity_media_shared_activity_id_idx on public.activity_media (shared_activity_id);
