-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Calendars table
create table if not exists calendars (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id),
  title text not null default 'My Calendar',
  created_at timestamptz default now()
);

-- Events table
create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  calendar_id uuid references calendars(id) on delete cascade,
  date_key text not null,
  title text not null,
  color text not null default 'purple',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Users <-> Calendars join
create table if not exists calendar_users (
  calendar_id uuid references calendars(id) on delete cascade,
  user_id uuid references auth.users(id),
  role text check (role in ('viewer','editor')),
  primary key (calendar_id, user_id)
);

-- Invites
create table if not exists invites (
  id uuid primary key default uuid_generate_v4(),
  calendar_id uuid references calendars(id) on delete cascade,
  email text not null,
  role text check (role in ('viewer','editor')),
  token text unique not null,
  accepted boolean default false,
  created_at timestamptz default now()
);

-- Row-Level Security
alter table calendars enable row level security;
create policy "calendar_access" on calendars
  for select
  using (
    owner_id = auth.uid() or exists(
      select 1 from calendar_users cu
      where cu.calendar_id = calendars.id and cu.user_id = auth.uid()
    )
  );

alter table events enable row level security;
create policy "event_access" on events
  for select, insert, update, delete
  using (
    exists(
      select 1 from calendars c
      where c.id = events.calendar_id and (
        c.owner_id = auth.uid() or exists(
          select 1 from calendar_users cu
          where cu.calendar_id = c.id and cu.user_id = auth.uid() and cu.role = 'editor'
        )
      )
    )
  );
