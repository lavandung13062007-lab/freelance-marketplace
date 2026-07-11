"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";

function orderPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

type DesignJoin = { freelancer_id: string } | { freelancer_id: string }[] | null;

function extractFreelancerId(join: DesignJoin): string | null {
  return (Array.isArray(join) ? join[0]?.freelancer_id : join?.freelancer_id) ?? null;
}

export async function startConversation(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // Nếu bấm "Nhắn tin" từ 1 thiết kế cụ thể: xác định freelancer qua chính
  // thiết kế đó (đáng tin hơn userId gửi kèm) để chốt luôn deal ban đầu.
  const designId = (formData.get("designId") as string) || null;
  let otherId = formData.get("userId") as string;
  let design: { title: string; image_url: string; price: number | null } | null = null;

  if (designId) {
    const { data: img } = await supabase
      .from("portfolio_post_images")
      .select("title, image_url, price, portfolio_posts!inner(freelancer_id)")
      .eq("id", designId)
      .maybeSingle();
    if (img) {
      const freelancerId = extractFreelancerId(img.portfolio_posts as DesignJoin);
      if (freelancerId) {
        otherId = freelancerId;
        design = { title: img.title, image_url: img.image_url, price: img.price };
      }
    }
  }

  if (!otherId || otherId === user.id) return;

  const [userA, userB] = orderPair(user.id, otherId);

  const { data: existing } = await supabase
    .from("conversations")
    .select("id, deal_image_id")
    .eq("user_a", userA)
    .eq("user_b", userB)
    .maybeSingle();

  let conversationId = existing?.id as string | undefined;
  let hasDeal = Boolean(existing?.deal_image_id);

  if (!conversationId) {
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ user_a: userA, user_b: userB })
      .select("id")
      .single();
    if (error) {
      redirect(`/freelancer/${otherId}?error=${encodeURIComponent(error.message)}`);
    }
    conversationId = created!.id;
    hasDeal = false;
  }

  // Chỉ chốt deal + tự gửi ảnh cho LẦN ĐẦU thiết kế được chia sẻ trong hội thoại
  // này — tránh spam nếu khách bấm "Nhắn tin" nhiều lần hoặc từ thiết kế khác.
  if (design && designId && !hasDeal) {
    await supabase
      .from("conversations")
      .update({ deal_image_id: designId, proposed_price: design.price })
      .eq("id", conversationId);

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      message_type: "design_share",
      content: `Mình quan tâm thiết kế "${design.title}"`,
      metadata: {
        post_image_id: designId,
        title: design.title,
        cover: design.image_url,
        price: design.price,
      },
    });

    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);
  }

  redirect(`/messages/${conversationId}`);
}

export async function sendMessage(conversationId: string, content: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const trimmed = content.trim();
  if (!trimmed) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, content: trimmed })
    .select("id, sender_id, content, created_at, message_type, metadata")
    .single();

  if (error) return null;

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath("/messages");
  return data;
}

export async function markConversationRead(conversationId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from("conversation_reads").upsert(
    {
      conversation_id: conversationId,
      user_id: user.id,
      last_read_at: new Date().toISOString(),
      hidden_at: null,
    },
    { onConflict: "conversation_id,user_id" },
  );

  revalidatePath("/messages");
}

export async function setConversationPinned(conversationId: string, pinned: boolean) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from("conversation_reads").upsert(
    {
      conversation_id: conversationId,
      user_id: user.id,
      pinned_at: pinned ? new Date().toISOString() : null,
    },
    { onConflict: "conversation_id,user_id" },
  );

  revalidatePath("/messages");
}

export async function hideConversation(conversationId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from("conversation_reads").upsert(
    {
      conversation_id: conversationId,
      user_id: user.id,
      hidden_at: new Date().toISOString(),
    },
    { onConflict: "conversation_id,user_id" },
  );

  revalidatePath("/messages");
}

export async function setNickname(conversationId: string, nickname: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const trimmed = nickname.trim();
  const supabase = await createClient();
  await supabase.from("conversation_reads").upsert(
    {
      conversation_id: conversationId,
      user_id: user.id,
      nickname: trimmed || null,
    },
    { onConflict: "conversation_id,user_id" },
  );

  revalidatePath("/messages");
}

const REPORT_REASONS = ["spam", "harassment", "scam", "other"] as const;

export async function reportConversation(conversationId: string, reason: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  const { data: conversation } = await supabase
    .from("conversations")
    .select("user_a, user_b")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conversation) return;

  const reportedUserId = conversation.user_a === user.id ? conversation.user_b : conversation.user_a;
  const safeReason = (REPORT_REASONS as readonly string[]).includes(reason) ? reason : "other";

  await supabase.from("conversation_reports").insert({
    conversation_id: conversationId,
    reporter_id: user.id,
    reported_user_id: reportedUserId,
    reason: safeReason,
  });
}

const CONVERSATION_STATUSES = ["discussing", "hired", "completed", "cancelled"] as const;

export async function setConversationStatus(conversationId: string, status: string) {
  const user = await getCurrentUser();
  if (!user) return;
  if (!(CONVERSATION_STATUSES as readonly string[]).includes(status)) return;

  const supabase = await createClient();
  await supabase.from("conversations").update({ status }).eq("id", conversationId);

  revalidatePath("/messages");
}

export async function setAgreedPrice(conversationId: string, price: number | null) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from("conversations").update({ agreed_price: price }).eq("id", conversationId);

  revalidatePath("/messages");
}
