-- Chạy trong Supabase SQL Editor, sau khi đã chạy conversation_stage.sql
-- Tính năng: chốt thiết kế + đàm phán giá trong chat, đặt cọc theo % qua QR.

-- % đặt cọc riêng của từng freelancer. NULL = chưa từng đặt (kích hoạt bảng
-- "lần đầu có khách" để họ chỉnh và lưu).
alter table public.profiles
  add column deposit_percent numeric
    check (deposit_percent is null or (deposit_percent > 0 and deposit_percent <= 100));

-- Trạng thái "deal" gắn với hội thoại: thiết kế đang chốt, giá freelancer đang đề nghị,
-- và % cọc được khoá lại tại thời điểm khách bấm Đồng ý (đổi % sau này không ảnh hưởng
-- deal đã chốt).
alter table public.conversations
  add column deal_image_id uuid references public.portfolio_post_images (id) on delete set null,
  add column proposed_price numeric,
  add column deposit_percent numeric;

-- Tin nhắn dạng đặc biệt: chia sẻ thiết kế (tự động khi bắt đầu chat từ 1 thiết kế)
-- và đề nghị giá (freelancer gửi, kèm nút Đồng ý cho khách).
alter table public.messages
  add column message_type text not null default 'text'
    check (message_type in ('text', 'design_share', 'price_offer')),
  add column metadata jsonb;
