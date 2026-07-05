import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/session";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <span className="rounded-full bg-brand-yellow px-4 py-1 text-xs font-bold text-gray-900">
        Thiết kế & Đồ hoạ
      </span>
      <h1 className="max-w-xs text-4xl font-extrabold leading-tight tracking-tight text-gray-900">
        Thuê thiết kế,
        <br />
        nhanh gọn.
      </h1>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/signup"
          className="rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white active:scale-[0.98]"
        >
          Tạo tài khoản
        </Link>
        <Link
          href="/login"
          className="rounded-full px-6 py-3.5 text-sm font-semibold text-gray-900"
        >
          Đăng nhập
        </Link>
      </div>
    </main>
  );
}
