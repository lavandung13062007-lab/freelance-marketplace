-- Chạy trong Supabase SQL Editor, sau khi đã chạy setup.sql
-- Lưu email + số điện thoại riêng để có thể tìm tài khoản (giống "tìm bạn" của Zalo).
-- Bảng này KHÔNG cho đọc công khai — tránh lộ/dò quét toàn bộ email & số điện thoại.

create table public.account_contacts (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  phone text
);

alter table public.account_contacts enable row level security;

create policy "Chu tai khoan xem lien he cua minh"
  on public.account_contacts for select
  using (auth.uid() = id);

create policy "Chu tai khoan them lien he cua minh"
  on public.account_contacts for insert
  with check (auth.uid() = id);

create policy "Chu tai khoan cap nhat lien he cua minh"
  on public.account_contacts for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Điền email cho các tài khoản đã có sẵn
insert into public.account_contacts (id, email)
select id, email from auth.users
on conflict (id) do update set email = excluded.email;

-- Từ giờ mỗi tài khoản mới cũng tự lưu email vào account_contacts
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'role', 'client')::public.user_role
  );
  insert into public.account_contacts (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

-- Tìm tài khoản theo email hoặc số điện thoại (khớp CHÍNH XÁC).
-- security definer để đọc được bảng riêng, nhưng chỉ trả về id + tên
-- (không trả email/phone) và chỉ khi khớp đúng → không thể dò quét danh bạ.
create or replace function public.search_accounts(term text)
returns table (id uuid, full_name text)
language sql
security definer set search_path = public
as $$
  select p.id, p.full_name
  from public.account_contacts c
  join public.profiles p on p.id = c.id
  where c.id <> auth.uid()
    and (
      lower(c.email) = lower(trim(term))
      or (c.phone is not null and c.phone = regexp_replace(trim(term), '\s', '', 'g'))
    )
  limit 10;
$$;

grant execute on function public.search_accounts(text) to authenticated;
