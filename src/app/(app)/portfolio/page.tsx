import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";

const STATUS_LABEL: Record<string, string> = {
  pending: "Đang chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Bị từ chối",
};

export default async function PortfolioPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("portfolio_posts")
    .select("id, title, status, portfolio_post_images(image_url, position)")
    .eq("freelancer_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Portfolio của bạn</h1>
        <Link
          href="/portfolio/new"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
        >
          + Đăng portfolio
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl bg-gray-50 text-center">
          <p className="font-bold text-gray-900">Chưa có bài đăng nào</p>
          <p className="mt-1 text-sm text-gray-500">Đăng bộ ảnh đầu tiên của bạn</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {posts.map((post) => {
            const images = [...post.portfolio_post_images].sort(
              (a, b) => a.position - b.position,
            );
            const cover = images[0]?.image_url;
            return (
              <div key={post.id} className="overflow-hidden rounded-2xl bg-gray-50">
                <div className="relative aspect-square bg-gray-200">
                  {cover && (
                    <Image src={cover} alt={post.title} fill className="object-cover" />
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-gray-900">{post.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{STATUS_LABEL[post.status]}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
