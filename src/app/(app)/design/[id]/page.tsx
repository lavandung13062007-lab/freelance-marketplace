import { notFound } from "next/navigation";
import { getCardDetail, getApprovedPortfolioCards } from "@/lib/portfolio";
import { getCurrentUser } from "@/lib/supabase/session";
import DesignDetail from "@/components/DesignDetail";

export default async function DesignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [detail, currentUser] = await Promise.all([getCardDetail(id), getCurrentUser()]);
  if (!detail) notFound();

  const freelancerCards = await getApprovedPortfolioCards(detail.freelancer.id);

  return (
    <DesignDetail
      detail={detail}
      currentUserId={currentUser?.id ?? null}
      freelancerCards={freelancerCards.filter((c) => c.id !== detail.id)}
    />
  );
}
