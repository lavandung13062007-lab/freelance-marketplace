-- Chạy trong Supabase SQL Editor
-- Mỗi ảnh trong 1 bài đăng giờ là 1 "thẻ" độc lập: có tiêu đề, mô tả, liên kết,
-- giá, chủ đề và thẻ (tags) riêng — thay vì cả bộ ảnh dùng chung 1 bộ thông tin.

alter table public.portfolio_post_images
  add column title text,
  add column description text,
  add column link text,
  add column price bigint,
  add column topic text,
  add column created_at timestamptz not null default now();

update public.portfolio_post_images pi
set
  title = p.title,
  description = p.description,
  link = p.link,
  price = p.price,
  topic = p.topic,
  created_at = p.created_at
from public.portfolio_posts p
where pi.post_id = p.id;

alter table public.portfolio_post_images alter column title set not null;

-- Chuyển thẻ (tags) từ gắn theo cả bài đăng sang gắn theo từng ảnh
alter table public.portfolio_post_tags
  add column post_image_id uuid references public.portfolio_post_images (id) on delete cascade;

alter table public.portfolio_post_tags drop constraint portfolio_post_tags_pkey;

insert into public.portfolio_post_tags (post_id, tag_id, post_image_id)
select t.post_id, t.tag_id, pi.id
from public.portfolio_post_tags t
join public.portfolio_post_images pi on pi.post_id = t.post_id
where t.post_image_id is null;

delete from public.portfolio_post_tags where post_image_id is null;

alter table public.portfolio_post_tags alter column post_image_id set not null;

-- Phải gỡ 2 policy cũ (đang phụ thuộc cột post_id) trước khi xóa được cột post_id
drop policy "Freelancer gan the cho bai dang cua minh" on public.portfolio_post_tags;
create policy "Freelancer quan ly the cho anh cua minh"
  on public.portfolio_post_tags for all
  using (exists (
    select 1 from public.portfolio_post_images pi
    join public.portfolio_posts p on p.id = pi.post_id
    where pi.id = post_image_id and p.freelancer_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.portfolio_post_images pi
    join public.portfolio_posts p on p.id = pi.post_id
    where pi.id = post_image_id and p.freelancer_id = auth.uid()
  ));

drop policy "Ai cung xem duoc the cua bai da duyet" on public.portfolio_post_tags;
create policy "Ai cung xem duoc the cua bai da duyet"
  on public.portfolio_post_tags for select
  using (exists (
    select 1 from public.portfolio_post_images pi
    join public.portfolio_posts p on p.id = pi.post_id
    where pi.id = post_image_id and p.status = 'approved'
  ));

alter table public.portfolio_post_tags drop column post_id;
alter table public.portfolio_post_tags add primary key (post_image_id, tag_id);

-- Bài đăng giờ chỉ còn là "bộ" chứa các thẻ, không còn giữ thông tin riêng
alter table public.portfolio_posts
  drop column title,
  drop column description,
  drop column link,
  drop column price,
  drop column topic;
