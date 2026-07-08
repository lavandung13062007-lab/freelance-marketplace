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
  const convIds = convs.map((c) => c.id);

  const [{ data: profiles }, { data: msgs }, { data: reads }] = await Promise.all([
    otherIds.length > 0
      ? supabase.from("profiles").select("id, full_name").in("id", otherIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
    convIds.length > 0
      ? supabase
          .from("messages")
          .select("conversation_id, sender_id, content, created_at")
          .in("conversation_id", convIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as { conversation_id: string; sender_id: string; content: string }[] }),
    convIds.length > 0
      ? supabase
          .from("conversation_reads")
          .select("conversation_id, last_read_at, pinned_at, hidden_at, nickname")
          .eq("user_id", user!.id)
          .in("conversation_id", convIds)
      : Promise.resolve({ data: [] as { conversation_id: string; last_read_at: string; pinned_at: string | null; hidden_at: string | null; nickname: string | null }[] }),
  ]);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const lastByConv = new Map<string, { content: string; sender_id: string }>();
  for (const m of msgs ?? []) {
    if (!lastByConv.has(m.conversation_id)) {
      lastByConv.set(m.conversation_id, { content: m.content, sender_id: m.sender_id });
    }
  }

  const readByConv = new Map((reads ?? []).map((r) => [r.conversation_id, r]));

  const items: ConversationItem[] = convs
    .map((c) => {
      const otherId = c.user_a === user!.id ? c.user_b : c.user_a;
      const last = lastByConv.get(c.id);
      const read = readByConv.get(c.id);
      const hiddenAt = read?.hidden_at;
      const hidden = !!hiddenAt && new Date(hiddenAt) >= new Date(c.last_message_at);
      if (hidden) return null;

      const unread =
        !!last &&
        last.sender_id !== user!.id &&
        (!read?.last_read_at || new Date(c.last_message_at) > new Date(read.last_read_at));
      const realName = nameById.get(otherId) ?? "Người dùng";
      return {
        id: c.id,
        otherId,
        realName,
        nickname: read?.nickname ?? null,
        otherName: read?.nickname || realName,
        lastMessage: last?.content ?? null,
        lastMessageFromMe: last ? last.sender_id === user!.id : false,
        lastMessageAt: c.last_message_at,
        unread,
        pinned: !!read?.pinned_at,
      } satisfies ConversationItem;
    })
    .filter((item): item is ConversationItem => item !== null)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className="-ml-8 -mt-6 flex h-[calc(100vh-2rem)] min-w-[640px] gap-4 pl-2 pt-2">
      <ConversationSidebar items={items} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
