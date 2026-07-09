import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/session";
import { getApprovedPortfolioCards } from "@/lib/portfolio";
import AuthShell from "@/components/AuthShell";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const { error } = await searchParams;
  const cards = await getApprovedPortfolioCards();
  const covers = cards.map((c) => c.cover).filter(Boolean).slice(0, 3);

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Chào mừng trở lại! Đăng nhập để tiếp tục với Sala."
      brandTitle="Chào mừng trở lại 👋"
      brandSubtitle="Tiếp tục khám phá kho thiết kế và trò chuyện với freelancer của bạn."
      covers={covers}
    >
      <LoginForm error={error} />
    </AuthShell>
  );
}
