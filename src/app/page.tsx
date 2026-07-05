import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-bold text-gray-900">
        Sàn Freelance Thiết kế / Đồ hoạ
      </h1>
      <p className="max-w-md text-gray-600">
        Kết nối khách hàng cần thiết kế với freelancer đồ hoạ. Đăng ký làm
        khách hàng để đăng yêu cầu, hoặc làm freelancer để nhận việc.
      </p>
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Tạo tài khoản
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Đăng nhập
        </Link>
      </div>
    </main>
  );
}
