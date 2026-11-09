-- Media page for Sunwings collaborators (e.g. Marius): let them delete their own site's media and
-- upload video/audio, only inside the sunwings/ folder of the media buckets.
-- site-assets stays protected (the admin API refuses deletes there anyway).
-- Uses public.is_sunwings_collaborator() from 20261106_sunwings_collaborator_image_uploads.sql.
-- Safe to run again.

begin;

drop policy if exists "sunwings collaborators delete media" on storage.objects;
create policy "sunwings collaborators delete media"
on storage.objects for delete to authenticated
using (
  bucket_id in ('blog-images', 'social-videos', 'social-audio')
  and (storage.foldername(name))[1] = 'sunwings'
  and (select public.is_sunwings_collaborator())
);

drop policy if exists "sunwings collaborators upload video audio" on storage.objects;
create policy "sunwings collaborators upload video audio"
on storage.objects for insert to authenticated
with check (
  bucket_id in ('social-videos', 'social-audio')
  and (storage.foldername(name))[1] = 'sunwings'
  and (select public.is_sunwings_collaborator())
);

commit;

select case
  when (select count(*) from pg_policies where schemaname='storage' and tablename='objects'
        and policyname in ('sunwings collaborators delete media', 'sunwings collaborators upload video audio')) = 2
  then '✅ Sunwings collaborators can delete media and upload video/audio' else '❌ Not set up' end as result;
