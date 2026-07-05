import { createClient } from "@/lib/supabase/server";

export type PortfolioCard = {
  id: string;
  title: string;
  cover: string;
  freelancerId: string;
};

export async function getApprovedPortfolioCards(freelancerId?: string): Promise<PortfolioCard[]> {
  const supabase = await createClient();

  let query = supabase
    .from("portfolio_posts")
    .select("id, title, freelancer_id, portfolio_post_images(image_url, position)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (freelancerId) {
    query = query.eq("freelancer_id", freelancerId);
  }

  const { data } = await query;

  return (data ?? [])
    .map((post) => {
      const cover = [...post.portfolio_post_images].sort(
        (a, b) => a.position - b.position,
      )[0]?.image_url;
      return cover
        ? { id: post.id, title: post.title, cover, freelancerId: post.freelancer_id }
        : null;
    })
    .filter((c): c is PortfolioCard => c !== null);
}
