-- Chạy trong Supabase SQL Editor
-- Bỏ tính năng "bộ sưu tập" theo yêu cầu

alter table public.portfolio_posts drop column collection_id;
drop table public.portfolio_collections;
