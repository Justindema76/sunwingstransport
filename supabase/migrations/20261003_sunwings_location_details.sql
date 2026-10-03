alter table public.sunwings_locations
  add column if not exists local_notes jsonb not null default '[]'::jsonb,
  add column if not exists recent_job text not null default '';
