import { getApprovedPortfolioCards } from "@/lib/portfolio";
import PortfolioGrid from "@/components/PortfolioGrid";
import TopSearchBar from "@/components/TopSearchBar";
import { getCurrentUser } from "@/lib/supabase/session";

export default async function DashboardPage() {
  const [cards, currentUser] = await Promise.all([
    getApprovedPortfolioCards(),
    getCurrentUser(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <TopSearchBar />
      </div>

      {cards.length === 0 ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl bg-gray-50 text-center">
          <p className="text-lg font-bold text-gray-900">Chưa có ý tưởng nào</p>
          <p className="mt-1 text-sm text-gray-500">Ghé lại sau khi freelancer đăng bài nhé</p>
        </div>
      ) : (
        <PortfolioGrid cards={cards} linkToFreelancer currentUserId={currentUser?.id} />
      )}
    </div>
  );
}
