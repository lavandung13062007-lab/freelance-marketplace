import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { getAllTagNames } from "@/lib/portfolio";
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
      "id, title, description, link, price, freelancer_id, portfolio_collections(name), portfolio_post_images(id, image_url, position), portfolio_post_tags(tags(name))",
    )
    .eq("id", id)
    .maybeSingle();

  if (!post || post.freelancer_id !== user!.id) notFound();

  const { data: collections } = await supabase
    .from("portfolio_collections")
    .select("name")
    .eq("freelancer_id", user!.id)
    .order("name");

  const tagSuggestions = await getAllTagNames();

  const images = [...post.portfolio_post_images]
    .sort((a, b) => a.position - b.position)
    .map((img) => ({ id: img.id, url: img.image_url }));

  const tags = post.portfolio_post_tags
    .map((t) => (Array.isArray(t.tags) ? t.tags[0]?.name : (t.tags as { name: string })?.name))
    .filter((n): n is string => Boolean(n));

  const collectionName = Array.isArray(post.portfolio_collections)
    ? post.portfolio_collections[0]?.name
    : (post.portfolio_collections as { name: string } | null)?.name;

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold tracking-tight text-gray-900">
        Chỉnh sửa portfolio
      </h1>
      <PortfolioForm
        action={updatePortfolioPost.bind(null, id)}
        error={error}
        collectionNames={(collections ?? []).map((c) => c.name)}
        tagSuggestions={tagSuggestions}
        initialValues={{
          title: post.title,
          description: post.description ?? "",
          link: post.link ?? "",
          price: post.price != null ? String(post.price) : "",
          collection: collectionName ?? "",
          tags,
        }}
        existingImages={images}
        submitLabel="Lưu thay đổi"
      />
    </div>
  );
}
