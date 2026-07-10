"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/timeAgo";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

type Tab = "notifications" | "news";

function iconFor(type: string) {
  if (type === "post_approved") return "✅";
  if (type === "post_rejected") return "❌";
  if (type === "new_post") return "🎨";
  if (type === "design_liked") return "❤️";
  return "🔔";
}

// Gom nhóm theo ngày cho dễ đọc: Hôm nay / Hôm qua / Trước đó
function groupLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Hôm nay";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Hôm qua";
  return "Trước đó";
}

export default function NotificationCenter() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("notifications");
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, title, body, link, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!error && data) setItems(data as Notification[]);
    } catch {
      // bảng chưa tạo — coi như rỗng
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unread = items.filter((n) => !n.is_read).length;

  async function markAllRead() {
    const unreadIds = items.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await createClient().from("notifications").update({ is_read: true }).in("id", unreadIds);
    } catch {
      /* bỏ qua */
    }
  }

  async function openItem(n: Notification) {
    if (!n.is_read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      try {
        await createClient().from("notifications").update({ is_read: true }).eq("id", n.id);
      } catch {
        /* bỏ qua */
      }
    }
    if (n.link) router.push(n.link);
  }

  async function removeItem(e: React.MouseEvent, n: Notification) {
    e.stopPropagation();
    setItems((prev) => prev.filter((x) => x.id !== n.id));
    try {
      await createClient().from("notifications").delete().eq("id", n.id);
    } catch {
      /* bỏ qua */
    }
  }

  const groups = useMemo(() => {
    const map = new Map<string, Notification[]>();
    for (const n of items) {
      const label = groupLabel(n.created_at);
      const list = map.get(label) ?? [];
      list.push(n);
      map.set(label, list);
    }
    return ["Hôm nay", "Hôm qua", "Trước đó"]
      .filter((l) => map.has(l))
      .map((l) => ({ label: l, list: map.get(l)! }));
  }, [items]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Thông báo</h1>

      {/* 2 màn hình: Thông báo / Tin tức */}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("notifications")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === "notifications"
              ? "bg-brand text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Thông báo
          {unread > 0 && (
            <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("news")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === "news" ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Tin tức nổi bật
        </button>
      </div>

      {tab === "notifications" ? (
        <section className="mt-5">
          {unread > 0 && (
            <div className="mb-3 flex justify-end">
              <button
                onClick={markAllRead}
                className="text-sm font-semibold text-brand hover:underline"
              >
                Đánh dấu tất cả đã đọc
              </button>
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl bg-gray-50 p-10 text-center text-sm text-gray-500">
              Đang tải…
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl bg-gray-50 text-center">
              <span className="text-3xl">🔔</span>
              <p className="mt-3 font-bold text-gray-900">Chưa có thông báo</p>
              <p className="mt-1 text-sm text-gray-500">
                Khi bài được duyệt, có người theo dõi hay tim thiết kế, bạn sẽ thấy ở đây.
              </p>
            </div>
          ) : (
            groups.map(({ label, list }) => (
              <div key={label} className="mb-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                  {label}
                </p>
                <ul className="overflow-hidden rounded-2xl border border-gray-100">
                  {list.map((n) => (
                    <li key={n.id} className="border-b border-gray-100 last:border-b-0">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => openItem(n)}
                        onKeyDown={(e) => e.key === "Enter" && openItem(n)}
                        className={`group flex w-full cursor-pointer gap-3 px-4 py-3.5 text-left transition hover:bg-gray-50 ${
                          n.is_read ? "bg-white" : "bg-brand/5"
                        }`}
                      >
                        <span className="text-xl leading-none">{iconFor(n.type)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-gray-900">
                              {n.title}
                            </span>
                            {!n.is_read && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                            )}
                          </span>
                          {n.body && (
                            <span className="mt-0.5 line-clamp-2 block text-sm text-gray-500">
                              {n.body}
                            </span>
                          )}
                          <span className="mt-1 block text-xs text-gray-400">
                            {timeAgo(n.created_at)}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => removeItem(e, n)}
                          title="Xóa thông báo"
                          className="self-center rounded-full p-1.5 text-gray-300 opacity-0 transition hover:bg-gray-100 hover:text-gray-500 group-hover:opacity-100"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-4 w-4"
                          >
                            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>
      ) : (
        <section className="mt-5">
          {/* Màn hình Tin tức — chỗ dành cho sự kiện hệ thống & hợp tác quảng cáo
              thương hiệu (nguồn thu tương lai). Hiện để khung chờ nội dung. */}
          <div className="overflow-hidden rounded-3xl border border-gray-100">
            <div className="bg-gradient-to-r from-brand/90 to-brand p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-wide text-white/70">Sala News</p>
              <h2 className="mt-1 text-lg font-extrabold">Tin tức nổi bật của hệ thống</h2>
              <p className="mt-1 text-sm text-white/80">
                Sự kiện, chương trình khuyến mãi và cơ hội hợp tác quảng cáo thương hiệu sẽ xuất
                hiện tại đây.
              </p>
            </div>
            <div className="flex min-h-[30vh] flex-col items-center justify-center p-8 text-center">
              <span className="text-3xl">📰</span>
              <p className="mt-3 font-bold text-gray-900">Chưa có tin tức nào</p>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Khu vực này đang được chuẩn bị. Các sự kiện của Sala và tin hợp tác quảng cáo từ
                các thương hiệu sẽ được đăng tại đây.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
