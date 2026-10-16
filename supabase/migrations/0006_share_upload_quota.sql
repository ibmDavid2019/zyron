-- Tracks how many bytes each upload to app/api/share/upload actually wrote,
-- so that route can enforce a 1GB-per-user-per-day sharing upload quota by
-- summing this column over today's rows — protects the public
-- `activity-shares` Storage bucket from a logged-in user racking up
-- unbounded storage/bandwidth cost.

alter table public.activity_media
  add column if not exists output_size_bytes bigint not null default 0;

create index if not exists activity_media_user_updated_idx
  on public.activity_media (user_id, updated_at);
