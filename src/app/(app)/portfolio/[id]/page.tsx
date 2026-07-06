import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { getAllTagNames, getCategoryNames } from "@/lib/portfolio";
import { updatePortfolioPost } from "@/lib/actions/portfolio";
import PortfolioForm from "../new/PortfolioForm";

export default async function EditPortfolioPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("portfolio_posts")
    .select(
      "id, freelancer_id, portfolio_post_images(id, image_url, position, title, description, link, price, topic, portfolio_post_tags(tags(name)))",
    )
    .eq("id", id)
    .maybeSingle();

  if (!post || post.freelancer_id !== user!.id) notFound();

  const [tagSuggestions, categoryNames] = await Promise.all([
    getAllTagNames(),
    getCategoryNames(),
  ]);

  const initialCards = [...post.portfolio_post_images]
    .sort((a, b) => a.position - b.position)
    .map((img) => ({
      existingId: img.id,
      url: img.image_url,
      title: img.title,
      description: img.description ?? "",
      link: img.link ?? "",
      price: img.price != null ? String(img.price) : "",
      topic: img.topic ?? "",
      tags: img.portfolio_post_tags
        .map((t) => (Array.isArray(t.tags) ? t.tags[0]?.name : (t.tags as { name: string })?.name))
        .filter((n): n is string => Boolean(n)),
    }));

  return (
    <PortfolioForm
      action={updatePortfolioPost.bind(null, id)}
      error={error}
      categoryNames={categoryNames}
      tagSuggestions={tagSuggestions}
      initialCards={initialCards}
      submitLabel="Lưu thay đổi"
    />
  );
}
