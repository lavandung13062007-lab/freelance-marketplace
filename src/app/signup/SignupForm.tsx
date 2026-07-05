"use client";

import { useState } from "react";
import Link from "next/link";
import { signup } from "@/lib/actions/auth";

export default function SignupForm({ error }: { error?: string }) {
  const [role, setRole] = useState<"client" | "freelancer">("client");

  return (
    <form action={signup} className="w-full max-w-sm space-y-4">
      <input type="hidden" name="role" value={role} />

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Bạn là
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("client")}
            className={`rounded-md border px-4 py-2 text-sm font-medium ${
              role === "client"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-300 text-gray-600"
            }`}
          >
            Khách hàng
          </button>
          <button
            type="button"
            onClick={() => setRole("freelancer")}
            className={`rounded-md border px-4 py-2 text-sm font-medium ${
              role === "freelancer"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-300 text-gray-600"
            }`}
          >
            Freelancer
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
          Họ và tên
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Nguyễn Văn A"
        />
      </div>

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
          minLength={6}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Ít nhất 6 ký tự"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Tạo tài khoản
      </button>

      <p className="text-center text-sm text-gray-600">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
