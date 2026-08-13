-- Keeps public."User".email in sync with Supabase Auth's auth.users.email.
-- 001_handle_new_user.sql only fires on insert, so without this a tenant
-- changing their email via /account/profile (which updates auth.users
-- through supabase.auth.updateUser, only once they click the confirmation
-- link) would leave the Prisma-side email stale forever.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public."User" set email = new.email, "updatedAt" = now() where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update on auth.users
  for each row execute function public.handle_user_email_change();
