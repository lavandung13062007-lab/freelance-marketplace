import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const firstName = (profile?.full_name ?? user.email ?? "").split(" ")[0];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <span className="text-xl font-extrabold tracking-tight text-gray-900">
          Chào, {firstName} 👋
        </span>
        <form action={logout}>
          <button className="text-sm font-medium text-gray-400">Thoát</button>
        </form>
      </div>

      <div className="mt-10 rounded-3xl bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">Đang xây dựng</p>
        <p className="mt-1 text-lg font-bold text-gray-900">Sắp ra mắt ✨</p>
      </div>
    </main>
  );
}
