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
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const isFreelancer = profile?.role === "freelancer";

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Xin chào, {profile?.full_name ?? user.email}
        </h1>
        <form action={logout}>
          <button className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Đăng xuất
          </button>
        </form>
      </div>

      <p className="mt-4 text-gray-600">
        Bạn đang dùng tài khoản{" "}
        <span className="font-medium text-gray-900">
          {isFreelancer ? "Freelancer" : "Khách hàng"}
        </span>
        .
      </p>

      <div className="mt-8 rounded-lg border border-dashed border-gray-300 p-6 text-gray-500">
        {isFreelancer
          ? "Đây sẽ là nơi bạn xây hồ sơ, đăng dịch vụ và nhận đơn từ khách hàng. (tính năng sắp tới)"
          : "Đây sẽ là nơi bạn đăng yêu cầu thiết kế và tìm freelancer phù hợp. (tính năng sắp tới)"}
      </div>
    </main>
  );
}
