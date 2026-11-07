-- Media page and Moving Tips posts upload to the blog-images bucket (folder = site key).
-- Let Sunwings collaborators upload there too, only inside the sunwings/ folder.
-- Uses public.is_sunwings_collaborator() from 20261106_sunwings_collaborator_image_uploads.sql.
-- Safe to run again.

begin;

drop policy if exists "sunwings collaborators upload blog images" on storage.objects;
create policy "sunwings collaborators upload blog images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'blog-images'
  and (storage.foldername(name))[1] = 'sunwings'
  and (select public.is_sunwings_collaborator())
);

commit;

select case
  when exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='sunwings collaborators upload blog images')
  then '✅ Sunwings collaborators can upload blog/media images' else '❌ Not set up' end as result;
