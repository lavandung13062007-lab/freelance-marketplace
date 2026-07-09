import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/session";
import { getApprovedPortfolioCards } from "@/lib/portfolio";
import AuthShell from "@/components/AuthShell";
import SignupForm from "./SignupForm";

export default async function SignupPage({
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
      title="Tạo tài khoản"
      subtitle="Miễn phí trong 30 giây — bắt đầu thuê hoặc nhận việc thiết kế ngay."
      brandTitle="Tham gia Sala ngay hôm nay"
      brandSubtitle="Duyệt kho thiết kế thật, nhắn tin trực tiếp và nhận sản phẩm ưng ý."
      covers={covers}
    >
      <SignupForm error={error} />
    </AuthShell>
  );
}
