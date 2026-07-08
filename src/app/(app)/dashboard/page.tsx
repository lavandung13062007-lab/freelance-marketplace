import TopSearchBar from "@/components/TopSearchBar";
import RecommendedFeed from "@/components/RecommendedFeed";
import { getCurrentUser } from "@/lib/supabase/session";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-8 -mt-6 mb-2 border-b border-gray-100 bg-white px-8 pb-3 pt-0">
        <TopSearchBar />
      </div>

      <RecommendedFeed currentUserId={currentUser?.id} />
    </div>
  );
}
