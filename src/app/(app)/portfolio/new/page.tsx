import { getAllTagNames } from "@/lib/portfolio";
import { createPortfolioPost } from "@/lib/actions/portfolio";
import PortfolioForm from "./PortfolioForm";

export default async function NewPortfolioPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const tagSuggestions = await getAllTagNames();
  const { error, mode } = await searchParams;

  return (
    <PortfolioForm
      action={createPortfolioPost}
      error={error}
      tagSuggestions={tagSuggestions}
      imageMode={mode === "single" ? "single" : "album"}
      submitLabel="Đăng"
    />
  );
}
