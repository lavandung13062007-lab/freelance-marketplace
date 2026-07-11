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
  depositPercent: number | null;
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
  depositPercent: number | null;
};

export type SearchResults = {
  freelancers: { id: string; name: string }[];
  designs: PortfolioCard[];
};

type TagJoin = { tags: { name: string } | { name: string }[] | null };

function extractTagNames(rows: TagJoin[] | null | undefined): string[] {
  return (rows ?? [])
    .map((t) => (Array.isArray(t.tags) ? t.tags[0]?.name : t.tags?.name))
    .filter((n): n is string => Boolean(n));
}

type PostJoin = { freelancer_id: string } | { freelancer_id: string }[] | null;

function extractFreelancerId(join: PostJoin): string {
  return (Array.isArray(join) ? join[0]?.freelancer_id : join?.freelancer_id) ?? "";
}

// profiles không có FK trực tiếp tới portfolio_posts (cả 2 chỉ tham chiếu
// auth.users) nên không JOIN được — nhưng số freelancer luôn nhỏ hơn nhiều
// số bài nên gom id rồi .in() một lần ở đây là an toàn.
async function attachDepositPercent<T extends { freelancerId: string }>(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cards: T[],
): Promise<(T & { depositPercent: number | null })[]> {
  const freelancerIds = Array.from(new Set(cards.map((c) => c.freelancerId).filter(Boolean)));
  if (freelancerIds.length === 0) return cards.map((c) => ({ ...c, depositPercent: null }));

  const { data } = await supabase.from("profiles").select("id, deposit_percent").in("id", freelancerIds);
  const percentById = new Map((data ?? []).map((p) => [p.id, p.deposit_percent as number | null]));

  return cards.map((c) => ({ ...c, depositPercent: percentById.get(c.freelancerId) ?? null }));
}

export async function getApprovedPortfolioCards(freelancerId?: string): Promise<PortfolioCard[]> {
  const supabase = await createClient();

  // Lọc bằng JOIN (portfolio_posts!inner) thay vì thu thập id rồi .in() —
  // với hàng nghìn bài đã duyệt, chuỗi id trong .in() vượt giới hạn độ dài URL
  // và Postgrest báo lỗi (bị nuốt âm thầm, trả về mảng rỗng).
  let query = supabase
    .from("portfolio_post_images")
    .select(
      "id, title, description, link, price, topic, image_url, created_at, portfolio_posts!inner(freelancer_id, status)",
    )
    .eq("portfolio_posts.status", "approved")
    .order("created_at", { ascending: false });

  if (freelancerId) {
    query = query.eq("portfolio_posts.freelancer_id", freelancerId);
  }

  const { data: images, error } = await query;
  if (error) throw new Error(error.message);

  const cards = (images ?? []).map((img) => ({
    id: img.id,
    title: img.title,
    cover: img.image_url,
    freelancerId: extractFreelancerId(img.portfolio_posts as PostJoin),
    price: img.price,
    description: img.description,
    link: img.link,
    topic: img.topic,
  }));
  return attachDepositPercent(supabase, cards);
}

// Toàn bộ thẻ (ảnh) đã duyệt, kèm tag — dùng để xếp hạng đề xuất.
export async function getApprovedCandidateCards(): Promise<RankableCard[]> {
  const supabase = await createClient();
  const { data: images, error } = await supabase
    .from("portfolio_post_images")
    .select(
      "id, title, description, link, price, topic, image_url, portfolio_posts!inner(freelancer_id, status), portfolio_post_tags(tags(name))",
    )
    .eq("portfolio_posts.status", "approved")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);

  const cards = (images ?? []).map((img) => ({
    id: img.id,
    title: img.title,
    cover: img.image_url,
    freelancerId: extractFreelancerId(img.portfolio_posts as PostJoin),
    price: img.price,
    description: img.description,
    link: img.link,
    topic: img.topic,
    tags: extractTagNames(img.portfolio_post_tags),
  }));
  return attachDepositPercent(supabase, cards);
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
    supabase
      .from("profiles")
      .select("full_name, deposit_percent")
      .eq("id", post.freelancer_id)
      .maybeSingle(),
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
    depositPercent: profile?.deposit_percent ?? null,
  };
}

// Tìm kiếm freelancer (theo tên) + thiết kế (theo tiêu đề / chủ đề / thẻ).
export async function searchApproved(rawQuery: string): Promise<SearchResults> {
  const q = rawQuery.trim();
  if (!q) return { freelancers: [], designs: [] };
  const like = `%${q.replace(/[%,()]/g, " ")}%`;
  const supabase = await createClient();

  // JOIN qua portfolio_posts!inner thay vì thu thập id rồi .in() — với hàng
  // nghìn bài đã duyệt, .in() với danh sách id khổng lồ vượt giới hạn độ dài
  // URL và Postgrest báo lỗi (bị nuốt âm thầm, trả về mảng rỗng).
  type SearchRow = {
    id: string;
    title: string;
    image_url: string;
    description: string | null;
    link: string | null;
    price: number | null;
    topic: string | null;
    portfolio_posts: PostJoin;
  };
  const SEARCH_FIELDS =
    "id, title, image_url, description, link, price, topic, portfolio_posts!inner(freelancer_id, status)";

  const { data: byText } = await supabase
    .from("portfolio_post_images")
    .select(SEARCH_FIELDS)
    .eq("portfolio_posts.status", "approved")
    .or(`title.ilike.${like},topic.ilike.${like}`)
    .limit(20)
    .overrideTypes<SearchRow[]>();

  let byTag: SearchRow[] = [];
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
        .select(SEARCH_FIELDS)
        .in("id", imageIds)
        .eq("portfolio_posts.status", "approved")
        .limit(20)
        .overrideTypes<SearchRow[]>();
      byTag = data ?? [];
    }
  }

  const seen = new Set<string>();
  const rawDesigns = [...(byText ?? []), ...byTag]
    .filter((d) => (seen.has(d.id) ? false : (seen.add(d.id), true)))
    .slice(0, 8)
    .map((d) => ({
      id: d.id,
      title: d.title,
      cover: d.image_url,
      freelancerId: extractFreelancerId(d.portfolio_posts),
      price: d.price,
      description: d.description,
      link: d.link,
      topic: d.topic,
    }));
  const designs = await attachDepositPercent(supabase, rawDesigns);

  // profiles không có FK trực tiếp tới portfolio_posts (cả 2 chỉ tham chiếu
  // auth.users) nên không JOIN được — nhưng freelancer_id chỉ cần .distinct(),
  // số freelancer thực tế luôn nhỏ hơn nhiều số bài nên .in() ở đây an toàn.
  const { data: approvedFreelancers } = await supabase
    .from("portfolio_posts")
    .select("freelancer_id")
    .eq("status", "approved");
  const freelancerIds = Array.from(new Set((approvedFreelancers ?? []).map((p) => p.freelancer_id)));

  const { data: profs } =
    freelancerIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", freelancerIds)
          .ilike("full_name", like)
          .limit(6)
      : { data: [] };
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
