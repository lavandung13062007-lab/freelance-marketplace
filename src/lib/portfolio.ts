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

export type RankableCard = PortfolioCard & { tags: string[] };

export type CardDetail = {
  id: string;
  postId: string;
  title: string;
  cover: string;
  description: string | null;
  link: string | null;
  price: number | null;
  topic: string | null;
  tags: string[];
  freelancer: { id: string; name: string };
  siblings: { id: string; cover: string }[];
};

export type SearchResults = {
  freelancers: { id: string; name: string }[];
  designs: { id: string; title: string; cover: string; freelancerId: string }[];
};

type TagJoin = { tags: { name: string } | { name: string }[] | null };

function extractTagNames(rows: TagJoin[] | null | undefined): string[] {
  return (rows ?? [])
    .map((t) => (Array.isArray(t.tags) ? t.tags[0]?.name : t.tags?.name))
    .filter((n): n is string => Boolean(n));
}

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

// Toàn bộ thẻ (ảnh) đã duyệt, kèm tag — dùng để xếp hạng đề xuất.
export async function getApprovedCandidateCards(): Promise<RankableCard[]> {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("portfolio_posts")
    .select("id, freelancer_id")
    .eq("status", "approved");
  if (!posts || posts.length === 0) return [];

  const freelancerByPost = new Map(posts.map((p) => [p.id, p.freelancer_id]));
  const { data: images } = await supabase
    .from("portfolio_post_images")
    .select(
      "id, post_id, title, description, link, price, topic, image_url, portfolio_post_tags(tags(name))",
    )
    .in(
      "post_id",
      posts.map((p) => p.id),
    )
    .order("created_at", { ascending: false })
    .limit(500);

  return (images ?? []).map((img) => ({
    id: img.id,
    title: img.title,
    cover: img.image_url,
    freelancerId: freelancerByPost.get(img.post_id)!,
    price: img.price,
    description: img.description,
    link: img.link,
    topic: img.topic,
    tags: extractTagNames(img.portfolio_post_tags),
  }));
}

// 1 thẻ (ảnh) cụ thể + tag + tên freelancer + các ảnh cùng bộ (để tiến/lùi).
export async function getCardDetail(imageId: string): Promise<CardDetail | null> {
  const supabase = await createClient();

  const { data: img } = await supabase
    .from("portfolio_post_images")
    .select(
      "id, post_id, title, description, link, price, topic, image_url, portfolio_post_tags(tags(name))",
    )
    .eq("id", imageId)
    .maybeSingle();
  if (!img) return null;

  const { data: post } = await supabase
    .from("portfolio_posts")
    .select("id, freelancer_id")
    .eq("id", img.post_id)
    .maybeSingle();
  if (!post) return null;

  const [{ data: profile }, { data: siblingRows }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", post.freelancer_id).maybeSingle(),
    supabase
      .from("portfolio_post_images")
      .select("id, image_url, position")
      .eq("post_id", img.post_id)
      .order("position", { ascending: true }),
  ]);

  return {
    id: img.id,
    postId: img.post_id,
    title: img.title,
    cover: img.image_url,
    description: img.description,
    link: img.link,
    price: img.price,
    topic: img.topic,
    tags: extractTagNames(img.portfolio_post_tags),
    freelancer: { id: post.freelancer_id, name: profile?.full_name ?? "Freelancer" },
    siblings: (siblingRows ?? []).map((s) => ({ id: s.id, cover: s.image_url })),
  };
}

// Tìm kiếm freelancer (theo tên) + thiết kế (theo tiêu đề / chủ đề / thẻ).
export async function searchApproved(rawQuery: string): Promise<SearchResults> {
  const q = rawQuery.trim();
  if (!q) return { freelancers: [], designs: [] };
  const like = `%${q.replace(/[%,()]/g, " ")}%`;
  const supabase = await createClient();

  const { data: approvedPosts } = await supabase
    .from("portfolio_posts")
    .select("id, freelancer_id")
    .eq("status", "approved");
  const approvedIds = (approvedPosts ?? []).map((p) => p.id);
  if (approvedIds.length === 0) return { freelancers: [], designs: [] };
  const freelancerByPost = new Map((approvedPosts ?? []).map((p) => [p.id, p.freelancer_id]));

  const { data: byText } = await supabase
    .from("portfolio_post_images")
    .select("id, title, image_url, post_id")
    .in("post_id", approvedIds)
    .or(`title.ilike.${like},topic.ilike.${like}`)
    .limit(20);

  let byTag: NonNullable<typeof byText> = [];
  const { data: matchTags } = await supabase.from("tags").select("id").ilike("name", like).limit(20);
  const tagIds = (matchTags ?? []).map((t) => t.id);
  if (tagIds.length > 0) {
    const { data: tagLinks } = await supabase
      .from("portfolio_post_tags")
      .select("post_image_id")
      .in("tag_id", tagIds)
      .limit(50);
    const imageIds = (tagLinks ?? []).map((l) => l.post_image_id);
    if (imageIds.length > 0) {
      const { data } = await supabase
        .from("portfolio_post_images")
        .select("id, title, image_url, post_id")
        .in("id", imageIds)
        .in("post_id", approvedIds)
        .limit(20);
      byTag = data ?? [];
    }
  }

  const seen = new Set<string>();
  const designs = [...(byText ?? []), ...byTag]
    .filter((d) => (seen.has(d.id) ? false : (seen.add(d.id), true)))
    .slice(0, 8)
    .map((d) => ({
      id: d.id,
      title: d.title,
      cover: d.image_url,
      freelancerId: freelancerByPost.get(d.post_id)!,
    }));

  const freelancerIds = Array.from(new Set((approvedPosts ?? []).map((p) => p.freelancer_id)));
  const { data: profs } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", freelancerIds)
    .ilike("full_name", like)
    .limit(6);
  const freelancers = (profs ?? []).map((p) => ({ id: p.id, name: p.full_name }));

  return { freelancers, designs };
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
