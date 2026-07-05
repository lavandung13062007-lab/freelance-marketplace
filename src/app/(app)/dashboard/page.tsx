import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("portfolio_posts")
    .select("id, title, portfolio_post_images(image_url, position)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const cards = (posts ?? [])
    .map((post) => {
      const cover = [...post.portfolio_post_images].sort(
        (a, b) => a.position - b.position,
      )[0]?.image_url;
      return cover ? { id: post.id, title: post.title, cover } : null;
    })
    .filter((c): c is { id: string; title: string; cover: string } => c !== null);

  if (cards.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl bg-gray-50 text-center">
        <p className="text-lg font-bold text-gray-900">Chưa có ý tưởng nào</p>
        <p className="mt-1 text-sm text-gray-500">Ghé lại sau khi freelancer đăng bài nhé</p>
      </div>
    );
  }

  return (
    <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>div]:mb-4">
      {cards.map((card) => (
        <div key={card.id} className="break-inside-avoid overflow-hidden rounded-2xl bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.cover} alt={card.title} loading="lazy" className="w-full rounded-2xl" />
          <p className="truncate px-1 py-2 text-xs font-medium text-gray-600">{card.title}</p>
        </div>
      ))}
    </div>
  );
}
