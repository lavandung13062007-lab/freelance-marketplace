-- Chạy trong Supabase SQL Editor, sau khi đã chạy portfolio.sql
-- Cho phép ai cũng xem được các bài đã duyệt (để hiển thị ở trang chủ)

create policy "Ai cung xem duoc bai da duyet"
  on public.portfolio_posts for select
  using (status = 'approved');

create policy "Ai cung xem duoc anh cua bai da duyet"
  on public.portfolio_post_images for select
  using (exists (
    select 1 from public.portfolio_posts p
    where p.id = post_id and p.status = 'approved'
  ));

create policy "Ai cung xem duoc the cua bai da duyet"
  on public.portfolio_post_tags for select
  using (exists (
    select 1 from public.portfolio_posts p
    where p.id = post_id and p.status = 'approved'
  ));
