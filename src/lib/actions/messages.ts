"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";

function orderPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function startConversation(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const otherId = formData.get("userId") as string;
  if (!otherId || otherId === user.id) return;

  const [userA, userB] = orderPair(user.id, otherId);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_a", userA)
    .eq("user_b", userB)
    .maybeSingle();

  let conversationId = existing?.id as string | undefined;

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
    .select("id, sender_id, content, created_at")
    .single();

  if (error) return null;

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath("/messages");
  return data;
}
