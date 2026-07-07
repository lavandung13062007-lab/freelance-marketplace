import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import ConversationSidebar, { type ConversationItem } from "@/components/ConversationSidebar";

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, user_a, user_b, last_message_at")
    .or(`user_a.eq.${user!.id},user_b.eq.${user!.id}`)
    .order("last_message_at", { ascending: false });

  const convs = conversations ?? [];
  const otherIds = convs.map((c) => (c.user_a === user!.id ? c.user_b : c.user_a));

  const { data: profiles } =
    otherIds.length > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", otherIds)
      : { data: [] };
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const convIds = convs.map((c) => c.id);
  const { data: msgs } =
    convIds.length > 0
      ? await supabase
          .from("messages")
          .select("conversation_id, sender_id, content, created_at")
          .in("conversation_id", convIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  const lastByConv = new Map<string, { content: string; sender_id: string }>();
  for (const m of msgs ?? []) {
    if (!lastByConv.has(m.conversation_id)) {
      lastByConv.set(m.conversation_id, { content: m.content, sender_id: m.sender_id });
    }
  }

  const items: ConversationItem[] = convs.map((c) => {
    const otherId = c.user_a === user!.id ? c.user_b : c.user_a;
    const last = lastByConv.get(c.id);
    return {
      id: c.id,
      otherId,
      otherName: nameById.get(otherId) ?? "Người dùng",
      lastMessage: last?.content ?? null,
      lastMessageFromMe: last ? last.sender_id === user!.id : false,
      lastMessageAt: c.last_message_at,
    };
  });

  return (
    <div className="flex h-[calc(100vh-3rem)] min-w-[640px] gap-4">
      <ConversationSidebar items={items} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
