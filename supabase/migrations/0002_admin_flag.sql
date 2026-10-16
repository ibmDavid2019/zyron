-- Adds a real "administrator" flag, decoupled from `status` (the field the
-- Cakto webhook writes to). Keeping them separate means an admin account's
-- access can never be accidentally revoked by a webhook test or a real
-- Cakto event (renewal failure, refund, etc.) touching `status`.

alter table public.subscriptions
  add column if not exists is_admin boolean not null default false;

update public.subscriptions
set is_admin = true
where user_id = public.get_user_id_by_email('davidlukas145@gmail.com');
