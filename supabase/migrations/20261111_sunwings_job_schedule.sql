-- Job Calendar: the day, time and crew a booked job is scheduled for.
-- preferred_date / preferred_time stay what the customer asked for;
-- these columns are what Justin actually booked.
alter table public.sunwings_quote_requests
  add column if not exists scheduled_date date,
  add column if not exists scheduled_start time,
  add column if not exists scheduled_hours numeric(4,1),
  add column if not exists crew text not null default '',
  add column if not exists truck text not null default '',
  add column if not exists crew_notes text not null default '';

create index if not exists sunwings_quote_requests_scheduled_date_idx
  on public.sunwings_quote_requests (site_key, scheduled_date)
  where scheduled_date is not null;

notify pgrst, 'reload schema';
