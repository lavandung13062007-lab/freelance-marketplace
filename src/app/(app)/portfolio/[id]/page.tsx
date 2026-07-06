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
      "id, title, description, link, price, topic, freelancer_id, portfolio_post_images(id, image_url, position), portfolio_post_tags(tags(name))",
    )
    .eq("id", id)
    .maybeSingle();

  if (!post || post.freelancer_id !== user!.id) notFound();

  const [tagSuggestions, categoryNames] = await Promise.all([
    getAllTagNames(),
    getCategoryNames(),
  ]);

  const images = [...post.portfolio_post_images]
    .sort((a, b) => a.position - b.position)
    .map((img) => ({ id: img.id, url: img.image_url }));

  const tags = post.portfolio_post_tags
    .map((t) => (Array.isArray(t.tags) ? t.tags[0]?.name : (t.tags as { name: string })?.name))
    .filter((n): n is string => Boolean(n));

  return (
    <PortfolioForm
      action={updatePortfolioPost.bind(null, id)}
      error={error}
      categoryNames={categoryNames}
      tagSuggestions={tagSuggestions}
      postId={id}
      initialValues={{
        title: post.title,
        description: post.description ?? "",
        link: post.link ?? "",
        price: post.price != null ? String(post.price) : "",
        topic: post.topic ?? "",
        tags,
      }}
      existingImages={images}
      submitLabel="Lưu thay đổi"
    />
  );
}
