-- Chạy trong Supabase SQL Editor (sau portfolio.sql)
-- Hệ thống thông báo dùng chung cho cả sàn Sala và app duyệt (Sala Review).

create type public.notification_type as enum (
  'post_approved',  -- bài được duyệt
  'post_rejected',  -- bài bị từ chối
  'new_post',       -- freelancer mình theo dõi đăng bài mới (Tính năng 2)
  'design_liked'    -- có người tim thiết kế của mình (Tính năng 3)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade, -- người NHẬN
  type public.notification_type not null,
  title text not null,
  body text,
  link text,                                                          -- bấm vào đi đâu
  actor_id uuid references auth.users (id) on delete set null,        -- ai gây ra
  post_id uuid references public.portfolio_posts (id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_unread_idx
  on public.notifications (user_id, is_read, created_at desc);

alter table public.notifications enable row level security;

-- Chỉ chủ nhân xem được thông báo của mình
create policy "Xem thong bao cua minh"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Chủ nhân đánh dấu đã đọc
create policy "Cap nhat thong bao cua minh"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Chủ nhân xóa thông báo của mình
create policy "Xoa thong bao cua minh"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- Trigger: mỗi khi trạng thái bài đổi -> tự tạo thông báo cho freelancer.
-- SECURITY DEFINER để bỏ qua RLS (chạy được dù duyệt từ app duyệt hay từ đâu).
create function public.notify_post_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
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

create trigger on_post_status_change
  after update of status on public.portfolio_posts
  for each row execute function public.notify_post_status_change();
