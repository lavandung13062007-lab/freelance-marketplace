import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type PortfolioCard = {
  id: string;
  title: string;
  cover: string;
  freelancerId: string;
  price: number | null;
  description: string | null;
  link: string | null;
  topic: string | null;
};

export async function getApprovedPortfolioCards(freelancerId?: string): Promise<PortfolioCard[]> {
  const supabase = await createClient();

  let postsQuery = supabase.from("portfolio_posts").select("id, freelancer_id").eq("status", "approved");
  if (freelancerId) {
    postsQuery = postsQuery.eq("freelancer_id", freelancerId);
  }
  const { data: posts } = await postsQuery;
  if (!posts || posts.length === 0) return [];

  const freelancerByPost = new Map(posts.map((p) => [p.id, p.freelancer_id]));

  const { data: images } = await supabase
    .from("portfolio_post_images")
    .select("id, post_id, title, description, link, price, topic, image_url")
    .in(
      "post_id",
      posts.map((p) => p.id),
    )
    .order("created_at", { ascending: false });

  return (images ?? []).map((img) => ({
    id: img.id,
    title: img.title,
    cover: img.image_url,
    freelancerId: freelancerByPost.get(img.post_id)!,
    price: img.price,
    description: img.description,
    link: img.link,
    topic: img.topic,
  }));
}

export async function getAllTagNames(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("name").order("name");
  return (data ?? []).map((t) => t.name);
}

export async function getCategoryNames(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tags")
    .select("name")
    .eq("is_category", true)
    .order("name");
  return (data ?? []).map((t) => t.name);
}

export async function syncCardTags(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  imageId: string,
  tagNames: string[],
): Promise<void> {
  await supabase.from("portfolio_post_tags").delete().eq("post_image_id", imageId);

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
      await supabase.from("portfolio_post_tags").insert({ post_image_id: imageId, tag_id: tagId });
    }
  }
}
