"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function BellIcon({ filled }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
        <path d="M9.5 18.5a2.5 2.5 0 0 0 5 0h-5Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
      <path strokeLinecap="round" d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  );
}

// Thông báo giờ là tính năng chính: chuông dẫn tới trang /notifications
// (2 màn hình: Thông báo + Tin tức). Badge đỏ = số chưa đọc, tự cập nhật.
export default function NotificationBell() {
  const pathname = usePathname();
  const active = pathname === "/notifications";
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    try {
      const supabase = createClient();
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false);
      if (!error) setUnread(count ?? 0);
    } catch {
      // bảng notifications chưa tạo — coi như 0
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 25000);
    return () => clearInterval(timer);
  }, [load, pathname]); // đổi trang thì load lại (vd sau khi đọc hết ở /notifications)

  return (
    <Link
      href="/notifications"
      title="Thông báo"
      className={`flex h-10 items-center rounded-xl ${
        active ? "bg-brand/10 text-brand" : "text-gray-500 hover:bg-gray-50"
      }`}
    >
      <span className="relative flex w-10 shrink-0 items-center justify-center">
        <BellIcon filled={active} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </span>
    </Link>
  );
}
