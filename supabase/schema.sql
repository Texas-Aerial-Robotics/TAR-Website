-- ==========================================================================
-- Texas Aerial Robotics — member login and workshop recordings
-- --------------------------------------------------------------------------
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor).
--
-- Then:
--   1. Authentication -> Providers: keep Email on. Turn "Allow new users to
--      sign up" OFF (Authentication -> Sign In / Up), so only people you
--      invite can log in. Add members under Authentication -> Users ->
--      Invite user.
--   2. Authentication -> URL Configuration: add your site URL and
--      <site>/members.html to the redirect allow-list (for email links).
--   3. Put the project URL and anon key in src/_data/site.js.
--
-- Every rule below only lets signed-in users read. Nobody can write from
-- the website; add recordings in the Supabase dashboard (Table Editor).
-- ==========================================================================

create table if not exists public.workshop_recordings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  presenter text,
  recorded_on date,
  -- Use ONE of these two:
  --   video_path  a file in the private "workshop-recordings" storage bucket
  --   video_url   a link to a video hosted elsewhere
  video_path text,
  video_url text,
  created_at timestamptz not null default now()
);

alter table public.workshop_recordings enable row level security;

create policy "Signed-in members can read recordings"
  on public.workshop_recordings
  for select
  to authenticated
  using (true);

-- Private bucket for uploaded recordings. Upload files in
-- Storage -> workshop-recordings, then put the file name in video_path.
insert into storage.buckets (id, name, public)
values ('workshop-recordings', 'workshop-recordings', false)
on conflict (id) do nothing;

create policy "Signed-in members can read recording files"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'workshop-recordings');

-- Example row (delete or edit):
-- insert into public.workshop_recordings (title, description, presenter, recorded_on, video_url)
-- values ('Intro to PX4', 'Setting up the flight stack.', 'Officer Name', '2026-09-15', 'https://example.com/video.mp4');
