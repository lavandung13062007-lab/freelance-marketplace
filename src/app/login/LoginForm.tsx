"use client";

import Link from "next/link";
import { login } from "@/lib/actions/auth";
import PasswordField from "@/components/PasswordField";
import SubmitButton from "@/components/SubmitButton";

export default function LoginForm({ error }: { error?: string }) {
  return (
    <form action={login} className="w-full max-w-sm space-y-3">
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
      />
      <PasswordField id="password" name="password" placeholder="Mật khẩu" />

      {error && <p className="text-sm font-medium text-brand">{error}</p>}

      <div className="pt-2">
        <SubmitButton>Đăng nhập</SubmitButton>
      </div>

      <p className="pt-1 text-center text-sm text-gray-500">
        Chưa có tài khoản?{" "}
        <Link href="/signup" className="font-semibold text-gray-900">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
