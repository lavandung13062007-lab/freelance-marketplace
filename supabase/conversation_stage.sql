-- Chạy trong Supabase SQL Editor, sau khi đã chạy conversation_extras.sql
-- Thêm giai đoạn "Đang thực hiện" (giữa lúc đã thanh toán và lúc hoàn thành)
-- để khớp với bảng điều khiển 4 giai đoạn ở bảng bên phải.

alter table public.conversations
  drop constraint conversations_status_check;

alter table public.conversations
  add constraint conversations_status_check
    check (status in ('discussing', 'hired', 'in_progress', 'completed', 'cancelled'));
