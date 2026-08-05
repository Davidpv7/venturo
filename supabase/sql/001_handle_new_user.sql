-- Keeps public."User" in sync with Supabase Auth's auth.users table.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public."User" (id, email, name, "updatedAt")
  values (new.id, new.email, new.raw_user_meta_data ->> 'name', now());
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
