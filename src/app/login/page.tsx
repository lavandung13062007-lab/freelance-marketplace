import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">Đăng nhập</h1>
      <LoginForm error={error} />
    </main>
  );
}
