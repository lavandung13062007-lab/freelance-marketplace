import { getAllTagNames, getCategoryNames } from "@/lib/portfolio";
import { createPortfolioPost } from "@/lib/actions/portfolio";
import PortfolioForm from "./PortfolioForm";

export default async function NewPortfolioPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [tagSuggestions, categoryNames] = await Promise.all([
    getAllTagNames(),
    getCategoryNames(),
  ]);
  const { error } = await searchParams;

  return (
    <PortfolioForm
      action={createPortfolioPost}
      error={error}
      categoryNames={categoryNames}
      tagSuggestions={tagSuggestions}
      submitLabel="Đăng"
    />
  );
}
