import TopSearchBar from "@/components/TopSearchBar";
import RecommendedFeed from "@/components/RecommendedFeed";
import { getCurrentUser } from "@/lib/supabase/session";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  return (
    <div>
      <div className="mb-6">
        <TopSearchBar />
      </div>

      <RecommendedFeed currentUserId={currentUser?.id} />
    </div>
  );
}
