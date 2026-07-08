import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import ChatThread from "./ChatThread";
import ConversationInfoPanel from "@/components/ConversationInfoPanel";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, user_a, user_b")
    .eq("id", id)
    .maybeSingle();

  if (!conversation || (conversation.user_a !== user.id && conversation.user_b !== user.id)) {
    notFound();
  }

  const otherId = conversation.user_a === user.id ? conversation.user_b : conversation.user_a;

  // 4 truy vấn độc lập, chạy song song thay vì nối tiếp để mở hội thoại nhanh hơn.
  // extras tách riêng: nếu status/agreed_price chưa tồn tại (chưa chạy migration mới)
  // thì trang vẫn mở được, chỉ bảng bên phải dùng giá trị mặc định.
  const [{ data: extras }, { data: otherProfile }, { data: read }, { data: messages }] = await Promise.all([
    supabase.from("conversations").select("status, agreed_price").eq("id", id).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", otherId).maybeSingle(),
    supabase
      .from("conversation_reads")
      .select("pinned_at, nickname")
      .eq("conversation_id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("id, sender_id, content, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const realName = otherProfile?.full_name ?? "Người dùng";

  return (
    <div className="flex h-full gap-4">
      <ChatThread
        key={id}
        conversationId={id}
        currentUserId={user.id}
        otherName={read?.nickname || realName}
        realName={realName}
        nickname={read?.nickname ?? null}
        pinned={!!read?.pinned_at}
        initialMessages={messages ?? []}
      />
      <ConversationInfoPanel
        key={`${id}-info`}
        conversationId={id}
        otherId={otherId}
        otherName={read?.nickname || realName}
        status={extras?.status ?? "discussing"}
        agreedPrice={extras?.agreed_price ?? null}
      />
    </div>
  );
}
