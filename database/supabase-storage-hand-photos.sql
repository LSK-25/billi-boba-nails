insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'hand-photos',
  'hand-photos',
  false,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Customers can upload own hand photo files" on storage.objects;
drop policy if exists "Customers can read own hand photo files" on storage.objects;
drop policy if exists "Admins can manage hand photo files" on storage.objects;

create policy "Customers can upload own hand photo files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'hand-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Customers can read own hand photo files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'hand-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Admins can manage hand photo files"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'hand-photos'
  and public.is_admin()
)
with check (
  bucket_id = 'hand-photos'
  and public.is_admin()
);