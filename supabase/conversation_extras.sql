-- Chạy trong Supabase SQL Editor, sau khi đã chạy conversation_reads.sql
-- Thêm: ghim / ẩn (xóa) / biệt danh cho hội thoại, trạng thái + giá thoả thuận,
-- và bảng lưu báo cáo hội thoại xấu.

alter table public.conversation_reads
  add column pinned_at timestamptz,
  add column hidden_at timestamptz,
  add column nickname text;

alter table public.conversations
  add column status text not null default 'discussing',
  add column agreed_price numeric,
  add constraint conversations_status_check
    check (status in ('discussing', 'hired', 'completed', 'cancelled'));

create table public.conversation_reports (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reported_user_id uuid not null references auth.users (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.conversation_reports enable row level security;

create policy "Nguoi dung tao bao cao cua chinh minh"
  on public.conversation_reports for insert
  with check (auth.uid() = reporter_id);

create policy "Nguoi dung xem bao cao minh da gui"
  on public.conversation_reports for select
  using (auth.uid() = reporter_id);
