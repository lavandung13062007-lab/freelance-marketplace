-- Chạy trong Supabase SQL Editor, sau khi đã chạy setup.sql
-- Thêm ảnh đại diện + thông tin nhận thanh toán (chỉ freelancer dùng) cho hồ sơ.

alter table public.profiles
  add column avatar_url text,
  add column bank_name text,
  add column bank_account_number text,
  add column bank_account_holder text;

-- Storage bucket luu anh dai dien
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Ai cung xem duoc anh dai dien"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Nguoi dung tai anh dai dien cua minh"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Nguoi dung xoa anh dai dien cua minh"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
