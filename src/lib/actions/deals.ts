"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";

/** Đổi thiết kế đang chốt trong deal — giá đề nghị tự cập nhật theo thiết kế mới. */
export async function setDealDesign(conversationId: string, imageId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  const { data: img } = await supabase
    .from("portfolio_post_images")
    .select("price")
    .eq("id", imageId)
    .maybeSingle();
  if (!img) return;

  await supabase
    .from("conversations")
    .update({ deal_image_id: imageId, proposed_price: img.price })
    .eq("id", conversationId);

  revalidatePath(`/messages/${conversationId}`);
}

/** Freelancer chỉnh giá đề nghị (chưa gửi cho khách — chỉ "Gửi yêu cầu" mới gửi). */
export async function setProposedPrice(conversationId: string, price: number) {
  const user = await getCurrentUser();
  if (!user) return;
  if (!(price >= 0)) return;

  const supabase = await createClient();
  await supabase.from("conversations").update({ proposed_price: price }).eq("id", conversationId);

  revalidatePath(`/messages/${conversationId}`);
}

export type SendOfferResult =
  | { ok: true }
  | { ok: false; error: "missing_deal" | "needs_deposit_percent" | "unauthenticated" };

/** Freelancer gửi đề nghị giá cho khách: gửi tin nhắn ảnh+giá kèm nút Đồng ý. */
export async function sendPriceOffer(conversationId: string): Promise<SendOfferResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthenticated" };

  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("conversations")
    .select("deal_image_id, proposed_price")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conv?.deal_image_id || conv.proposed_price == null) {
    return { ok: false, error: "missing_deal" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("deposit_percent")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.deposit_percent == null) {
    return { ok: false, error: "needs_deposit_percent" };
  }

  const { data: img } = await supabase
    .from("portfolio_post_images")
    .select("title, image_url")
    .eq("id", conv.deal_image_id)
    .maybeSingle();

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    message_type: "price_offer",
    content: `Đề nghị giá: ${conv.proposed_price.toLocaleString("vi-VN")} ₫`,
    metadata: {
      post_image_id: conv.deal_image_id,
      title: img?.title ?? "",
      cover: img?.image_url ?? "",
      price: conv.proposed_price,
    },
  });

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath(`/messages/${conversationId}`);
  return { ok: true };
}

/** Khách đồng ý đề nghị -> sang bước 2 (hired), khoá giá + % cọc tại thời điểm này. */
export async function agreeToOffer(conversationId: string, freelancerId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("conversations")
    .select("proposed_price")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conv || conv.proposed_price == null) return;

  const { data: freelancerProfile } = await supabase
    .from("profiles")
    .select("deposit_percent")
    .eq("id", freelancerId)
    .maybeSingle();

  await supabase
    .from("conversations")
    .update({
      status: "hired",
      agreed_price: conv.proposed_price,
      deposit_percent: freelancerProfile?.deposit_percent ?? null,
    })
    .eq("id", conversationId);

  revalidatePath(`/messages/${conversationId}`);
}

/** Freelancer lưu % đặt cọc vào hồ sơ (dùng cho cả trang hồ sơ và bảng "lần đầu"). */
export async function setDepositPercent(percent: number) {
  const user = await getCurrentUser();
  if (!user) return;
  if (!(percent > 0 && percent <= 100)) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ deposit_percent: percent }).eq("id", user.id);

  revalidatePath("/profile");
  revalidatePath("/messages");
}
