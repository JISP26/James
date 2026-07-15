-- ============================================================================
-- Storage bucket for product/collection/hero images
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('jisp-media', 'jisp-media', true)
on conflict (id) do nothing;

-- Public can view images (product photos must be visible on the storefront)
create policy "Public can view jisp-media"
on storage.objects for select
using (bucket_id = 'jisp-media');

-- Only logged-in admins can upload/update/delete files in this bucket
create policy "Admins can upload jisp-media"
on storage.objects for insert
with check (bucket_id = 'jisp-media' and is_admin());

create policy "Admins can update jisp-media"
on storage.objects for update
using (bucket_id = 'jisp-media' and is_admin())
with check (bucket_id = 'jisp-media' and is_admin());

create policy "Admins can delete jisp-media"
on storage.objects for delete
using (bucket_id = 'jisp-media' and is_admin());
