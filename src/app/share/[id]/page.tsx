import { notFound } from "next/navigation";
import Link from "next/link";
import { getCardDetail, getApprovedPortfolioCards } from "@/lib/portfolio";
import DesignDetail from "@/components/DesignDetail";
import ShareWelcomeBanner from "@/components/ShareWelcomeBanner";

export default async function PublicDesignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getCardDetail(id);
  if (!detail) notFound();

  const freelancerCards = await getApprovedPortfolioCards(detail.freelancer.id);

  return (
    <div className="min-h-screen bg-white">
      <ShareWelcomeBanner />

      <header className="flex items-center gap-2 border-b border-gray-100 px-6 py-3">
        <span className="relative flex h-6 w-8 shrink-0 items-center">
          <span className="h-6 w-6 rounded-full bg-brand" />
          <span className="-ml-2 h-6 w-2 rounded-full bg-brand-yellow" />
        </span>
        <span className="text-sm font-bold text-gray-900">Sàn Freelance Thiết kế</span>
        <Link
          href="/login"
          className="ml-auto rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
        >
          Đăng nhập / Đăng ký
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <DesignDetail
          detail={detail}
          currentUserId={null}
          freelancerCards={freelancerCards.filter((c) => c.id !== detail.id)}
          basePath="/share"
        />
      </main>
    </div>
  );
}
