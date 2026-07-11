import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { getApprovedPortfolioCards } from "@/lib/portfolio";
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

  // 5 truy vấn độc lập, chạy song song thay vì nối tiếp để mở hội thoại nhanh hơn.
  // extras tách riêng: nếu các cột deal/status chưa tồn tại (chưa chạy migration mới)
  // thì trang vẫn mở được, chỉ bảng bên phải dùng giá trị mặc định.
  const [{ data: extras }, { data: profiles }, { data: read }, { data: messages }] = await Promise.all([
    supabase
      .from("conversations")
      .select("status, agreed_price, deal_image_id, proposed_price, deposit_percent")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("profiles").select("id, full_name, role").in("id", [user.id, otherId]),
    supabase
      .from("conversation_reads")
      .select("pinned_at, nickname")
      .eq("conversation_id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("id, sender_id, content, created_at, message_type, metadata")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const otherProfile = profiles?.find((p) => p.id === otherId);
  const ownProfile = profiles?.find((p) => p.id === user.id);
  const realName = otherProfile?.full_name ?? "Người dùng";

  // Freelancer của deal này = bên nào có role 'freelancer'; nếu cả 2/không ai có
  // (dữ liệu cũ, hoặc chat ngoài luồng thiết kế) thì mặc định coi "otherId" là
  // freelancer để giao diện vẫn hoạt động như trước.
  const freelancerId =
    ownProfile?.role === "freelancer" ? user.id : otherProfile?.role === "freelancer" ? otherId : otherId;
  const viewerIsFreelancer = freelancerId === user.id;

  const [{ data: dealImageRow }, { data: freelancerProfile }, freelancerPortfolio] = await Promise.all([
    extras?.deal_image_id
      ? supabase
          .from("portfolio_post_images")
          .select("id, title, image_url, price")
          .eq("id", extras.deal_image_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("profiles")
      .select("deposit_percent, bank_name, bank_account_number, bank_account_holder")
      .eq("id", freelancerId)
      .maybeSingle(),
    getApprovedPortfolioCards(freelancerId).catch(() => []),
  ]);

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
        freelancerId={freelancerId}
        dealStatus={extras?.status ?? "discussing"}
      />
      <ConversationInfoPanel
        // key đổi theo status/giá -> remount sạch khi khách bấm "Đồng ý" trong
        // ChatThread (router.refresh() kéo props mới), thay vì đồng bộ qua useEffect.
        key={`${id}-info-${extras?.status ?? "discussing"}-${extras?.agreed_price ?? ""}`}
        conversationId={id}
        otherId={otherId}
        otherName={read?.nickname || realName}
        status={extras?.status ?? "discussing"}
        agreedPrice={extras?.agreed_price ?? null}
        viewerIsFreelancer={viewerIsFreelancer}
        freelancerPortfolio={freelancerPortfolio.map((c) => ({
          id: c.id,
          title: c.title,
          cover: c.cover,
          price: c.price,
        }))}
        dealImage={
          dealImageRow
            ? { id: dealImageRow.id, title: dealImageRow.title, cover: dealImageRow.image_url, price: dealImageRow.price }
            : null
        }
        proposedPrice={extras?.proposed_price ?? null}
        freelancerDepositPercent={freelancerProfile?.deposit_percent ?? null}
        dealDepositPercent={extras?.deposit_percent ?? null}
        bank={{
          code: freelancerProfile?.bank_name ?? null,
          accountNumber: freelancerProfile?.bank_account_number ?? null,
          accountHolder: freelancerProfile?.bank_account_holder ?? null,
        }}
      />
    </div>
  );
}
