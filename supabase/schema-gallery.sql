-- Gallery albums
create table if not exists gallery_albums (
  id          uuid default gen_random_uuid() primary key,
  tournament_id uuid not null,
  title       text not null,
  description text,
  cover_url   text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

alter table gallery_albums enable row level security;
create policy "gallery_albums public select" on gallery_albums for select using (true);
create policy "gallery_albums service write" on gallery_albums for all using (auth.role() = 'service_role');

-- Gallery photos
create table if not exists gallery_photos (
  id         uuid default gen_random_uuid() primary key,
  album_id   uuid not null references gallery_albums(id) on delete cascade,
  url        text not null,
  caption    text,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table gallery_photos enable row level security;
create policy "gallery_photos public select" on gallery_photos for select using (true);
create policy "gallery_photos service write" on gallery_photos for all using (auth.role() = 'service_role');

-- Index for fast album photo queries
create index if not exists idx_gallery_photos_album_id on gallery_photos(album_id);
create index if not exists idx_gallery_albums_tournament_id on gallery_albums(tournament_id);
