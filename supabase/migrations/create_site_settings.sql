-- Run this in Supabase SQL Editor
-- Creates the site_settings table for CMS content management

CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public read access (nav links, sponsors, etc. are public)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON site_settings
  FOR SELECT USING (true);

-- Only service role can write (admin API uses service key)
-- No INSERT/UPDATE policy needed — service role bypasses RLS
