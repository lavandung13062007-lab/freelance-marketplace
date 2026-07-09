import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getApprovedPortfolioCards } from "@/lib/portfolio";
import PortfolioGrid from "@/components/PortfolioGrid";
import ShareWelcomeBanner from "@/components/ShareWelcomeBanner";

export default async function PublicPortfolioPage({
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
    <div className="min-h-screen bg-white">
      <ShareWelcomeBanner />

      <header className="flex items-center gap-2 border-b border-gray-100 px-6 py-3">
        <span className="relative flex h-6 w-8 shrink-0 items-center">
          <span className="h-6 w-6 rounded-full bg-brand" />
          <span className="-ml-2 h-6 w-2 rounded-full bg-brand-yellow" />
        </span>
        <span className="text-sm font-bold text-gray-900">Sala</span>
        <Link
          href="/login"
          className="ml-auto rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
        >
          Đăng nhập / Đăng ký
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow text-2xl font-bold text-gray-900">
            {profile.full_name.charAt(0).toUpperCase()}
          </span>
          <div className="flex-1">
            <p className="text-lg font-extrabold text-gray-900">{profile.full_name}</p>
            <p className="text-sm text-gray-500">{cards.length} thiết kế</p>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl bg-gray-50 text-center">
            <p className="font-bold text-gray-900">Chưa có thiết kế nào</p>
          </div>
        ) : (
          <PortfolioGrid cards={cards} currentUserId={null} basePath="/share" />
        )}
      </main>
    </div>
  );
}
