import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { getAllTagNames } from "@/lib/portfolio";
import { createPortfolioPost } from "@/lib/actions/portfolio";
import PortfolioForm from "./PortfolioForm";

export default async function NewPortfolioPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: collections } = await supabase
    .from("portfolio_collections")
    .select("name")
    .eq("freelancer_id", user!.id)
    .order("name");

  const tagSuggestions = await getAllTagNames();
  const { error } = await searchParams;

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold tracking-tight text-gray-900">
        Đăng portfolio
      </h1>
      <PortfolioForm
        action={createPortfolioPost}
        error={error}
        collectionNames={(collections ?? []).map((c) => c.name)}
        tagSuggestions={tagSuggestions}
        submitLabel="Đăng"
      />
    </div>
  );
}
