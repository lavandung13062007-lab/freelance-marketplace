import { getApprovedPortfolioCards } from "@/lib/portfolio";
import PortfolioGrid from "@/components/PortfolioGrid";

export default async function DashboardPage() {
  const cards = await getApprovedPortfolioCards();

  if (cards.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl bg-gray-50 text-center">
        <p className="text-lg font-bold text-gray-900">Chưa có ý tưởng nào</p>
        <p className="mt-1 text-sm text-gray-500">Ghé lại sau khi freelancer đăng bài nhé</p>
      </div>
    );
  }

  return <PortfolioGrid cards={cards} linkToFreelancer />;
}
