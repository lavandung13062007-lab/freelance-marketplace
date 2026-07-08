-- Chạy trong Supabase SQL Editor, sau khi đã chạy messages.sql
-- Theo dõi mỗi người dùng đã đọc một cuộc trò chuyện tới thời điểm nào,
-- dùng để hiển thị trạng thái "chưa đọc" ở danh sách chat.

create table public.conversation_reads (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

alter table public.conversation_reads enable row level security;

create policy "Nguoi dung xem trang thai da doc cua chinh minh"
  on public.conversation_reads for select
  using (auth.uid() = user_id);

create policy "Nguoi dung tao trang thai da doc cua chinh minh"
  on public.conversation_reads for insert
  with check (auth.uid() = user_id);

create policy "Nguoi dung cap nhat trang thai da doc cua chinh minh"
  on public.conversation_reads for update
  using (auth.uid() = user_id);
