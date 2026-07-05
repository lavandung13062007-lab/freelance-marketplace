import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getApprovedPortfolioCards } from "@/lib/portfolio";
import PortfolioGrid from "@/components/PortfolioGrid";

export default async function FreelancerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", id)
    .maybeSingle();

  if (!profile) notFound();

  const cards = await getApprovedPortfolioCards(id);

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow text-2xl font-bold text-gray-900">
          {profile.full_name.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="text-lg font-extrabold text-gray-900">{profile.full_name}</p>
          <p className="text-sm text-gray-500">{cards.length} thiết kế</p>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl bg-gray-50 text-center">
          <p className="font-bold text-gray-900">Chưa có thiết kế nào</p>
        </div>
      ) : (
        <PortfolioGrid cards={cards} />
      )}
    </div>
  );
}
