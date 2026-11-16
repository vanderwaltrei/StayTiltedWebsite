-- Stay Tilted enquiries table.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- The public site can only INSERT. Only you (signed in to the dashboard) can read.

create table if not exists public.enquiries (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  name           text not null check (char_length(name) between 1 and 120),
  email          text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  shoot_type     text not null check (shoot_type in ('Cosplay','Portraits','Events','Brands','Studio hire','Something else')),
  preferred_date date,
  message        text not null check (char_length(message) between 1 and 2000),
  via            text not null default 'form' check (via in ('form','whatsapp')),
  page           text check (char_length(page) <= 200),
  status         text not null default 'new' check (status in ('new','replied','booked','closed'))
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);

alter table public.enquiries enable row level security;

revoke all on public.enquiries from anon, authenticated;
grant insert on public.enquiries to anon;

drop policy if exists "Anyone can submit an enquiry" on public.enquiries;
create policy "Anyone can submit an enquiry"
  on public.enquiries for insert to anon
  with check (status = 'new');
