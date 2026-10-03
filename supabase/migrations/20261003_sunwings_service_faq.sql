alter table public.sunwings_services
  add column if not exists faq jsonb not null default '[]'::jsonb;
