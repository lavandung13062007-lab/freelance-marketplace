-- Chạy trong Supabase SQL Editor, sau khi đã chạy setup.sql
-- Cho phép ai cũng xem được tên freelancer (để hiển thị trang hồ sơ công khai)

create policy "Ai cung xem duoc ten nguoi dung"
  on public.profiles for select
  using (true);
