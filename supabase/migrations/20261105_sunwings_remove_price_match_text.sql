-- Sunwings saved page text: drop the blanket price-match promise and "Call or text".
-- Only changes these exact saved sentences in the Pages editor content. Safe to run again.

begin;

update public.site_pages
set content = replace(replace(replace(replace(replace(replace(content::text,
  '"Price-match guarantee"', '"Upfront quotes"'),
  'Every quote is based on crew size, truck time and distance. Found a lower written quote? We’ll match it.', 'Clear, upfront quotes tailored to your job, based on crew size, truck time and distance.'),
  'Upfront quotes based on crew size, truck time and distance, backed by our price-match guarantee.', 'Clear, upfront quotes tailored to your job, based on crew size, truck time and distance.'),
  'Show us a lower written quote for the same job and we’ll match it.', 'Tell us what you’re moving and where. We’ll confirm the price before anything is booked.'),
  '"Found a lower written quote?"', '"Clear, upfront quotes tailored to your job."'),
  '"callTitle": "Call or text"', '"callTitle": "Call us"')::jsonb
where site_key = 'sunwings' and page_id in ('home', 'pricing', 'contact');

commit;

select case when count(*) = 0 then '✅ Price-match and "Call or text" wording removed'
  else '❌ Still found in: ' || string_agg(page_id, ', ') end as result
from public.site_pages
where site_key = 'sunwings'
  and (content::text ilike '%price-match%' or content::text ilike '%lower written quote%' or content::text like '%Call or text%');
