-- Spec 003 — member sign-up and login (R1)

-- Member profiles. Rows are written only by the server (secret key) during
-- sign-up; members may read their own row.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  user_type text not null check (user_type in ('EMPLOYEE', 'PUBLIC')),
  full_name text not null check (char_length(full_name) between 2 and 100),
  employee_id text unique check (employee_id ~ '^[0-9]{6}$'),
  affiliation text,
  pdpa_consented_at timestamptz not null,
  created_at timestamptz not null default now(),
  -- BR-04: employees must have both fields, public members must have neither
  constraint profiles_employee_fields check (
    (user_type = 'EMPLOYEE' and employee_id is not null and affiliation is not null)
    or (user_type = 'PUBLIC' and employee_id is null and affiliation is null)
  )
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert, delete on public.profiles to service_role;

create policy "Members can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

-- BR-06 lockout state, keyed by normalized email (tracked even for emails
-- with no account). No policies: only the secret key (service_role) can reach it.
create table public.login_attempts (
  email text primary key check (email = lower(btrim(email))),
  failure_count integer not null default 0 check (failure_count >= 0),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.login_attempts enable row level security;
revoke all on public.login_attempts from anon, authenticated;
grant select, insert, update, delete on public.login_attempts to service_role;

create function public.is_login_locked(p_email text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.login_attempts
    where email = p_email and locked_until > now()
  );
$$;

-- Records one failed attempt and returns true if the account is now locked.
-- Reaching p_max_failures locks for p_lockout_minutes from this failure and
-- clears the counter, so the count starts from 0 once the lock expires.
create function public.record_login_failure(
  p_email text,
  p_max_failures integer,
  p_lockout_minutes integer
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer;
  v_locked_until timestamptz;
begin
  insert into public.login_attempts (email) values (p_email)
  on conflict (email) do nothing;

  select failure_count, locked_until
    into v_count, v_locked_until
    from public.login_attempts
    where email = p_email
    for update;

  -- a concurrent request already locked it
  if v_locked_until > now() then
    return true;
  end if;

  v_count := v_count + 1;
  if v_count >= p_max_failures then
    v_count := 0;
    v_locked_until := now() + make_interval(mins => p_lockout_minutes);
  else
    v_locked_until := null;
  end if;

  update public.login_attempts
    set failure_count = v_count, locked_until = v_locked_until, updated_at = now()
    where email = p_email;

  return v_locked_until is not null;
end;
$$;

revoke execute on function public.is_login_locked(text) from public, anon, authenticated;
revoke execute on function public.record_login_failure(text, integer, integer) from public, anon, authenticated;
grant execute on function public.is_login_locked(text) to service_role;
grant execute on function public.record_login_failure(text, integer, integer) to service_role;
