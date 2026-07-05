import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/session";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-gray-900">
        Đăng nhập
      </h1>
      <LoginForm error={error} />
    </main>
  );
}
