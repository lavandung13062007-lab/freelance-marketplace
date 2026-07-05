-- Chạy toàn bộ file này trong Supabase SQL Editor (project mới của bạn)

create type public.user_role as enum ('client', 'freelancer');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'client',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Người dùng xem được hồ sơ của chính mình"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Người dùng sửa được hồ sơ của chính mình"
  on public.profiles for update
  using (auth.uid() = id);

-- Tự động tạo dòng profile mỗi khi có người đăng ký tài khoản mới
create function public.handle_new_user()
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
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
