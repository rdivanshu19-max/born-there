
-- Roles enum + table
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users see their own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles readable by owner" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles updatable by owner" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "profiles insertable by owner" on public.profiles for insert to authenticated with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Simulations
create table public.simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  share_slug text not null unique,
  is_public boolean not null default true,
  input jsonb not null,
  results jsonb not null,
  top_country text,
  created_at timestamptz not null default now()
);
alter table public.simulations enable row level security;

create policy "owner can select own simulations" on public.simulations for select to authenticated using (auth.uid() = user_id);
create policy "anyone can select public simulations" on public.simulations for select to anon, authenticated using (is_public = true);
create policy "authenticated can insert own simulations" on public.simulations for insert to authenticated with check (auth.uid() = user_id);
create policy "anon can insert anonymous public simulations" on public.simulations for insert to anon with check (user_id is null and is_public = true);
create policy "owner can update own simulations" on public.simulations for update to authenticated using (auth.uid() = user_id);
create policy "owner can delete own simulations" on public.simulations for delete to authenticated using (auth.uid() = user_id);

create index simulations_user_id_idx on public.simulations(user_id);
create index simulations_share_slug_idx on public.simulations(share_slug);

-- updated_at trigger for profiles
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
