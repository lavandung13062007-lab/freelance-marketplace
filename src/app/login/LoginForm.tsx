"use client";

import Link from "next/link";
import { login } from "@/lib/actions/auth";

export default function LoginForm({ error }: { error?: string }) {
  return (
    <form action={login} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="ban@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
          Mật khẩu
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Mật khẩu"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Đăng nhập
      </button>

      <p className="text-center text-sm text-gray-600">
        Chưa có tài khoản?{" "}
        <Link href="/signup" className="font-medium text-blue-600 hover:underline">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
