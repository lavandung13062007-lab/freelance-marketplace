-- Chạy trong Supabase SQL Editor, sau khi đã chạy setup.sql

create type public.portfolio_status as enum ('pending', 'approved', 'rejected');

create table public.portfolio_collections (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (freelancer_id, name)
);

create table public.portfolio_posts (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references auth.users (id) on delete cascade,
  collection_id uuid references public.portfolio_collections (id) on delete set null,
  title text not null,
  description text,
  link text,
  status public.portfolio_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.portfolio_post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.portfolio_posts (id) on delete cascade,
  image_url text not null,
  position int not null default 0
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table public.portfolio_post_tags (
  post_id uuid not null references public.portfolio_posts (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

-- Row Level Security

alter table public.portfolio_collections enable row level security;
alter table public.portfolio_posts enable row level security;
alter table public.portfolio_post_images enable row level security;
alter table public.tags enable row level security;
alter table public.portfolio_post_tags enable row level security;

create policy "Freelancer quan ly bo suu tap cua minh"
  on public.portfolio_collections for all
  using (auth.uid() = freelancer_id)
  with check (auth.uid() = freelancer_id);

create policy "Freelancer quan ly bai dang cua minh"
  on public.portfolio_posts for all
  using (auth.uid() = freelancer_id)
  with check (auth.uid() = freelancer_id);

create policy "Freelancer quan ly anh trong bai dang cua minh"
  on public.portfolio_post_images for all
  using (exists (
    select 1 from public.portfolio_posts p
    where p.id = post_id and p.freelancer_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.portfolio_posts p
    where p.id = post_id and p.freelancer_id = auth.uid()
  ));

create policy "Ai cung xem duoc danh sach the"
  on public.tags for select
  using (true);

create policy "Nguoi dang nhap tao the moi"
  on public.tags for insert
  with check (auth.uid() is not null);

create policy "Freelancer gan the cho bai dang cua minh"
  on public.portfolio_post_tags for all
  using (exists (
    select 1 from public.portfolio_posts p
    where p.id = post_id and p.freelancer_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.portfolio_posts p
    where p.id = post_id and p.freelancer_id = auth.uid()
  ));

-- Storage bucket luu anh portfolio

insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

create policy "Ai cung xem duoc anh portfolio"
  on storage.objects for select
  using (bucket_id = 'portfolio');

create policy "Freelancer tai anh vao thu muc cua minh"
  on storage.objects for insert
  with check (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Freelancer xoa anh cua minh"
  on storage.objects for delete
  using (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
