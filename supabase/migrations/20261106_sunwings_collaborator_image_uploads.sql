-- Let Sunwings collaborators (site_collaborators with site_key 'sunwings') upload images
-- to the site-assets bucket, but only inside the sunwings/ folder. Other sites stay owner-only.
-- Safe to run again.

begin;

create or replace function public.is_sunwings_collaborator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.site_collaborators c
    where c.site_key = 'sunwings'
      and lower(c.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_sunwings_collaborator() from public;
grant execute on function public.is_sunwings_collaborator() to authenticated;

drop policy if exists "sunwings collaborators upload site assets" on storage.objects;
create policy "sunwings collaborators upload site assets"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'site-assets'
  and (storage.foldername(name))[1] = 'sunwings'
  and (select public.is_sunwings_collaborator())
);

commit;

select case
  when exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='sunwings collaborators upload site assets')
  then '✅ Sunwings collaborators can upload images' else '❌ Not set up' end as result;
