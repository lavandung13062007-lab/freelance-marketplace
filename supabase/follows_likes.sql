-- Chạy trong Supabase SQL Editor, SAU notifications.sql
-- Theo dõi freelancer + tim thiết kế + mở rộng thông báo.

-- ============ 1. THEO DÕI FREELANCER ============

create table public.follows (
  follower_id uuid not null references auth.users (id) on delete cascade,
  freelancer_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, freelancer_id),
  check (follower_id <> freelancer_id)
);

create index follows_freelancer_idx on public.follows (freelancer_id);

alter table public.follows enable row level security;

-- Ai cũng đếm được lượt theo dõi (hiển thị số follower công khai)
create policy "Ai cung xem duoc luot theo doi"
  on public.follows for select
  using (true);

-- Chỉ tự mình theo dõi / bỏ theo dõi
create policy "Tu quan ly theo doi cua minh"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Tu bo theo doi cua minh"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- ============ 2. TIM THIẾT KẾ ============

create table public.design_likes (
  user_id uuid not null references auth.users (id) on delete cascade,
  post_image_id uuid not null references public.portfolio_post_images (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_image_id)
);

create index design_likes_image_idx on public.design_likes (post_image_id);

alter table public.design_likes enable row level security;

-- Ai cũng đếm được lượt tim (hiển thị công khai + dùng cho đề xuất)
create policy "Ai cung xem duoc luot tim"
  on public.design_likes for select
  using (true);

create policy "Tu tim thiet ke"
  on public.design_likes for insert
  with check (auth.uid() = user_id);

create policy "Tu bo tim"
  on public.design_likes for delete
  using (auth.uid() = user_id);

-- ============ 3. MỞ RỘNG TRIGGER THÔNG BÁO ============
-- Khi bài được duyệt: ngoài báo cho chủ bài, báo thêm cho NGƯỜI THEO DÕI.

create or replace function public.notify_post_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  freelancer_name text;
begin
  if new.status = old.status then
    return new;
  end if;

  if new.status = 'approved' then
    insert into public.notifications (user_id, type, title, body, link, post_id)
    values (
      new.freelancer_id, 'post_approved',
      'Bài đăng đã được duyệt ✅',
      'Thiết kế của bạn đã được duyệt và hiển thị trên sàn.',
      '/portfolio/' || new.id, new.id
    );

    -- Báo người theo dõi: "X vừa đăng thiết kế mới"
    select full_name into freelancer_name from public.profiles where id = new.freelancer_id;

    insert into public.notifications (user_id, type, title, body, link, actor_id, post_id)
    select
      f.follower_id, 'new_post',
      coalesce(freelancer_name, 'Freelancer bạn theo dõi') || ' vừa đăng thiết kế mới 🎨',
      'Vào xem ngay kẻo lỡ ý tưởng đẹp!',
      '/freelancer/' || new.freelancer_id,
      new.freelancer_id, new.id
    from public.follows f
    where f.freelancer_id = new.freelancer_id;

  elsif new.status = 'rejected' then
    insert into public.notifications (user_id, type, title, body, link, post_id)
    values (
      new.freelancer_id, 'post_rejected',
      'Bài đăng bị từ chối ❌',
      'Thiết kế chưa đạt yêu cầu chất lượng. Vui lòng chỉnh sửa và đăng lại.',
      '/portfolio/' || new.id, new.id
    );
  end if;

  return new;
end;
$$;

-- Khi có người TIM thiết kế -> báo chủ thiết kế (trừ tự tim của mình)
create function public.notify_design_liked()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  owner_id uuid;
  design_title text;
  liker_name text;
begin
  select p.freelancer_id, pi.title into owner_id, design_title
  from public.portfolio_post_images pi
  join public.portfolio_posts p on p.id = pi.post_id
  where pi.id = new.post_image_id;

  if owner_id is null or owner_id = new.user_id then
    return new;
  end if;

  select full_name into liker_name from public.profiles where id = new.user_id;

  insert into public.notifications (user_id, type, title, body, link, actor_id)
  values (
    owner_id, 'design_liked',
    coalesce(liker_name, 'Ai đó') || ' đã tim thiết kế của bạn ❤️',
    coalesce(design_title, 'Thiết kế của bạn') || ' vừa nhận được một lượt tim.',
    '/design/' || new.post_image_id,
    new.user_id
  );

  return new;
end;
$$;

create trigger on_design_liked
  after insert on public.design_likes
  for each row execute function public.notify_design_liked();
