"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewDesignButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
      >
        + Thêm thiết kế
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20 bg-black/30" onClick={() => setOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-30 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-xl">
            <p className="mb-4 text-center font-bold text-gray-900">Bạn muốn đăng gì?</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/portfolio/new?mode=single"
                className="rounded-2xl border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-900 hover:border-brand hover:text-brand"
              >
                Một ảnh
              </Link>
              <Link
                href="/portfolio/new?mode=album"
                className="rounded-2xl border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-900 hover:border-brand hover:text-brand"
              >
                Bộ ảnh (nhiều ảnh)
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
