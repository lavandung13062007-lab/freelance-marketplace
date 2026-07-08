"use client";

import { useState } from "react";
import Link from "next/link";

export default function ShareWelcomeBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="flex items-center justify-between gap-3 bg-brand px-4 py-2.5 text-sm text-white">
      <p className="min-w-0 truncate">
        Chào mừng bạn đến với <strong>Sàn Freelance Thiết kế</strong> —{" "}
        <Link href="/login" className="underline underline-offset-2 hover:no-underline">
          khám phá thêm dịch vụ thiết kế tại đây
        </Link>
      </p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Đóng"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-white/20"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}
