"use client";

import { useState } from "react";

// Nút sao chép liên kết chia sẻ (dùng lại ở trang portfolio, hồ sơ freelancer…).
export default function ShareButton({
  path,
  label = "Chia sẻ",
  className,
}: {
  path: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // trình duyệt không hỗ trợ clipboard — bỏ qua
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={
        className ??
        "rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
      }
    >
      {copied ? "Đã sao chép ✓" : label}
    </button>
  );
}
