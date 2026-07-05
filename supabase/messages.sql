-- Chạy trong Supabase SQL Editor, sau khi đã chạy các file trước đó

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users (id) on delete cascade,
  user_b uuid not null references auth.users (id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint conversations_ordered check (user_a < user_b),
  unique (user_a, user_b)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Nguoi tham gia xem duoc cuoc tro chuyen"
  on public.conversations for select
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Nguoi dung tao cuoc tro chuyen cho chinh minh"
  on public.conversations for insert
  with check (auth.uid() = user_a or auth.uid() = user_b);

create policy "Nguoi tham gia cap nhat cuoc tro chuyen"
  on public.conversations for update
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Nguoi tham gia xem duoc tin nhan"
  on public.messages for select
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (c.user_a = auth.uid() or c.user_b = auth.uid())
  ));

create policy "Nguoi tham gia gui duoc tin nhan"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

-- Bật realtime để tin nhắn tự cập nhật, không cần tải lại trang
alter publication supabase_realtime add table public.messages;
