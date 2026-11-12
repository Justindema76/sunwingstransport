-- Quote follow-ups: the automatic thank-you email, follow-up emails Justin sends,
-- and the one automatic reminder sent 3 days after a quote goes out.
alter table public.sunwings_quote_requests
  add column if not exists customer_ack_sent_at timestamptz,
  add column if not exists customer_ack_error text,
  add column if not exists follow_up_count integer not null default 0,
  add column if not exists last_follow_up_at timestamptz,
  add column if not exists auto_nudge_sent_at timestamptz;

notify pgrst, 'reload schema';
