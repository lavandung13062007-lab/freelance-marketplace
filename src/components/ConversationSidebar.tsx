"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { startConversation } from "@/lib/actions/messages";
import { timeAgo } from "@/lib/timeAgo";

export type ConversationItem = {
  id: string;
  otherId: string;
  otherName: string;
  lastMessage: string | null;
  lastMessageFromMe: boolean;
  lastMessageAt: string;
};

type AccountHit = { id: string; full_name: string };

function Avatar({ name, size = "h-12 w-12 text-lg" }: { name: string; size?: string }) {
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-brand-yellow font-bold text-gray-900`}
    >
      {name.charAt(0).toUpperCase() || "?"}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-gray-400">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m20 20-3-3" />
    </svg>
  );
}

export default function ConversationSidebar({ items }: { items: ConversationItem[] }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AccountHit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q) return;
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/accounts/search?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { accounts: AccountHit[] };
        setResults(data.accounts);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const searching = query.trim().length > 0;

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-hidden rounded-3xl bg-gray-50">
      <div className="p-3">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 focus-within:ring-2 focus-within:ring-brand/20">
          <SearchIcon />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập email hoặc số điện thoại"
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {searching ? (
          loading && !results ? (
            <p className="px-3 py-6 text-center text-sm text-gray-400">Đang tìm…</p>
          ) : results && results.length > 0 ? (
            <>
              <p className="px-3 py-2 text-xs font-semibold text-gray-400">Kết quả tìm kiếm</p>
              {results.map((a) => (
                <form key={a.id} action={startConversation}>
                  <input type="hidden" name="userId" value={a.id} />
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-white"
                  >
                    <Avatar name={a.full_name} size="h-11 w-11 text-base" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{a.full_name}</p>
                      <p className="truncate text-xs text-brand">Nhắn tin</p>
                    </div>
                  </button>
                </form>
              ))}
            </>
          ) : (
            <p className="px-3 py-6 text-center text-sm text-gray-400">
              Không tìm thấy tài khoản với “{query.trim()}”
            </p>
          )
        ) : items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-gray-400">Chưa có cuộc trò chuyện nào</p>
        ) : (
          items.map((c) => {
            const active = pathname === `/messages/${c.id}`;
            const preview = c.lastMessage
              ? `${c.lastMessageFromMe ? "Bạn: " : ""}${c.lastMessage}`
              : "Bắt đầu trò chuyện";
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${
                  active ? "bg-white shadow-sm" : "hover:bg-white/70"
                }`}
              >
                <Avatar name={c.otherName} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-gray-900">{c.otherName}</p>
                    <span className="shrink-0 text-[11px] text-gray-400">
                      {timeAgo(c.lastMessageAt)}
                    </span>
                  </div>
                  <p className="truncate text-xs text-gray-500">{preview}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}
