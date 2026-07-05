import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, user_a, user_b")
    .or(`user_a.eq.${user!.id},user_b.eq.${user!.id}`)
    .order("last_message_at", { ascending: false });

  const otherIds = (conversations ?? []).map((c) => (c.user_a === user!.id ? c.user_b : c.user_a));

  const { data: profiles } =
    otherIds.length > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", otherIds)
      : { data: [] };

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return (
    <div className="flex h-[calc(100vh-7rem)] min-w-[560px] gap-4">
      <aside className="w-48 shrink-0 space-y-1 overflow-y-auto">
        {(conversations ?? []).length === 0 && (
          <p className="px-3 py-2 text-sm text-gray-400">Chưa có cuộc trò chuyện nào</p>
        )}
        {(conversations ?? []).map((c) => {
          const otherId = c.user_a === user!.id ? c.user_b : c.user_a;
          return (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="block truncate rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {nameById.get(otherId) ?? "Người dùng"}
            </Link>
          );
        })}
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
