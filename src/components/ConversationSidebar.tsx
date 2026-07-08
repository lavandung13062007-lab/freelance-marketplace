"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { startConversation } from "@/lib/actions/messages";
import { timeAgo } from "@/lib/timeAgo";
import ConversationMenu from "@/components/ConversationMenu";

export type ConversationItem = {
  id: string;
  otherId: string;
  otherName: string;
  realName: string;
  nickname: string | null;
  lastMessage: string | null;
  lastMessageFromMe: boolean;
  lastMessageAt: string;
  unread: boolean;
  pinned: boolean;
};

type AccountHit = { id: string; full_name: string };

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

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

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
      <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function PinnedGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 shrink-0 text-gray-400">
      <path d="M9 4h6l-.5 6 3 3v2H6.5v-2l3-3L9 4Z" />
      <rect x="11" y="15" width="2" height="6" rx="1" />
    </svg>
  );
}

function ConversationRow({ item, active }: { item: ConversationItem; active: boolean }) {
  const preview = item.lastMessage
    ? `${item.lastMessageFromMe ? "Bạn: " : ""}${item.lastMessage}`
    : "Bắt đầu trò chuyện";

  return (
    <Link
      href={`/messages/${item.id}`}
      className={`group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 ${
        active ? "bg-white shadow-sm" : "hover:bg-white/70"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-brand" />
      )}
      <Avatar name={item.otherName} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-0 items-baseline gap-1">
            {item.pinned && <PinnedGlyph />}
            <p className={`truncate text-sm text-gray-900 ${item.unread ? "font-bold" : "font-semibold"}`}>
              {item.otherName}
            </p>
          </div>
          <div className="flex shrink-0 items-center">
            <span className="text-[11px] text-gray-400">{timeAgo(item.lastMessageAt)}</span>
            <ConversationMenu
              conversationId={item.id}
              pinned={item.pinned}
              nickname={item.nickname}
              realName={item.realName}
              triggerClassName="opacity-0 group-hover:opacity-100 -mr-1"
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={`truncate text-xs ${item.unread ? "font-semibold text-gray-800" : "text-gray-500"}`}>
            {preview}
          </p>
          {item.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />}
        </div>
      </div>
    </Link>
  );
}

export default function ConversationSidebar({ items }: { items: ConversationItem[] }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AccountHit[] | null>(null);
  const [loading, setLoading] = useState(false);

  function handleQueryChange(value: string) {
    setQuery(value);
    setResults(null);
    setLoading(false);
  }

  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/accounts/search?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { accounts: AccountHit[] };
        if (!cancelled) setResults(data.accounts);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const searching = query.trim().length > 0;

  const filteredConversations = useMemo(() => {
    if (!searching) return items;
    const q = normalize(query.trim());
    return items.filter((c) => normalize(c.otherName).includes(q) || normalize(c.realName).includes(q));
  }, [items, query, searching]);

  const existingIds = useMemo(() => new Set(items.map((c) => c.otherId)), [items]);
  const newAccountResults = (results ?? []).filter((a) => !existingIds.has(a.id));

  const nothingFound =
    searching &&
    !loading &&
    results !== null &&
    filteredConversations.length === 0 &&
    newAccountResults.length === 0;

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-hidden rounded-3xl bg-gray-50">
      <div className="p-3">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 focus-within:ring-2 focus-within:ring-brand/20">
          <SearchIcon />
          <input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Tìm kiếm"
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => handleQueryChange("")}
              aria-label="Xóa tìm kiếm"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <ClearIcon />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {searching ? (
          <>
            {filteredConversations.length > 0 && (
              <>
                <p className="px-3 py-2 text-xs font-semibold text-gray-400">Trò chuyện</p>
                {filteredConversations.map((c) => (
                  <ConversationRow key={c.id} item={c} active={pathname === `/messages/${c.id}`} />
                ))}
              </>
            )}

            {loading && newAccountResults.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-gray-400">Đang tìm…</p>
            )}

            {newAccountResults.length > 0 && (
              <>
                <p className="px-3 py-2 text-xs font-semibold text-gray-400">Tài khoản</p>
                {newAccountResults.map((a) => (
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
            )}

            {nothingFound && (
              <p className="px-3 py-6 text-center text-sm text-gray-400">
                Không tìm thấy kết quả cho “{query.trim()}”
              </p>
            )}
          </>
        ) : items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-gray-400">Chưa có cuộc trò chuyện nào</p>
        ) : (
          items.map((c) => (
            <ConversationRow key={c.id} item={c} active={pathname === `/messages/${c.id}`} />
          ))
        )}
      </div>
    </aside>
  );
}
