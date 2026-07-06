import type { SupabaseClient } from "@supabase/supabase-js";
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

export async function getAllTagNames(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("name").order("name");
  return (data ?? []).map((t) => t.name);
}

export async function findOrCreateCollection(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  freelancerId: string,
  name: string,
): Promise<string> {
  const { data: existing } = await supabase
    .from("portfolio_collections")
    .select("id")
    .eq("freelancer_id", freelancerId)
    .eq("name", name)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created } = await supabase
    .from("portfolio_collections")
    .insert({ freelancer_id: freelancerId, name })
    .select("id")
    .single();

  return created!.id;
}

export async function syncPostTags(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  postId: string,
  tagNames: string[],
): Promise<void> {
  await supabase.from("portfolio_post_tags").delete().eq("post_id", postId);

  for (const name of tagNames) {
    const { data: existingTag } = await supabase
      .from("tags")
      .select("id")
      .eq("name", name)
      .maybeSingle();

    let tagId = existingTag?.id as string | undefined;
    if (!tagId) {
      const { data: createdTag } = await supabase
        .from("tags")
        .insert({ name })
        .select("id")
        .single();
      tagId = createdTag?.id;
    }
    if (tagId) {
      await supabase.from("portfolio_post_tags").insert({ post_id: postId, tag_id: tagId });
    }
  }
}
