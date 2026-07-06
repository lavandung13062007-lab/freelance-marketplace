"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getRecentFreelancers,
  recordFreelancerVisit,
  getSearchHistory,
  recordSearch,
  removeSearch,
  type RecentFreelancer,
} from "@/lib/clientHistory";

type SearchResults = {
  freelancers: { id: string; name: string }[];
  designs: { id: string; title: string; cover: string; freelancerId: string }[];
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-gray-400">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m20 20-3-3" />
    </svg>
  );
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

export default function TopSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<RecentFreelancer[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function refreshLocal() {
    setRecent(getRecentFreelancers());
    setHistory(getSearchHistory());
  }

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q) return;
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        setResults((await res.json()) as SearchResults);
      } catch {
        setResults({ freelancers: [], designs: [] });
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function submit(term: string) {
    const q = term.trim();
    if (!q) return;
    recordSearch(q);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function goFreelancer(f: RecentFreelancer) {
    recordFreelancerVisit(f);
    setOpen(false);
    router.push(`/freelancer/${f.id}`);
  }

  function goDesign(id: string) {
    setOpen(false);
    router.push(`/design/${id}`);
  }

  const showHistoryView = !query.trim();

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 focus-within:ring-2 focus-within:ring-brand/20">
        <SearchIcon />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            refreshLocal();
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit(query);
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Tìm ý tưởng, dịch vụ thiết kế…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[70vh] overflow-y-auto rounded-3xl border border-gray-100 bg-white p-4 shadow-xl">
          {showHistoryView ? (
            <>
              {recent.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 px-1 text-xs font-semibold text-gray-400">Freelancer gần đây</p>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {recent.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => goFreelancer(f)}
                        className="flex w-16 shrink-0 flex-col items-center gap-1"
                      >
                        <Avatar name={f.name} />
                        <span className="w-full truncate text-center text-[11px] text-gray-600">
                          {f.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {history.length > 0 ? (
                <div>
                  <p className="mb-1 px-1 text-xs font-semibold text-gray-400">Tìm kiếm gần đây</p>
                  {history.map((h) => (
                    <div
                      key={h}
                      className="flex items-center justify-between rounded-xl px-1 hover:bg-gray-50"
                    >
                      <button
                        type="button"
                        onClick={() => submit(h)}
                        className="flex flex-1 items-center gap-2 py-2 text-left text-sm text-gray-700"
                      >
                        <SearchIcon />
                        {h}
                      </button>
                      <button
                        type="button"
                        aria-label="Xóa"
                        onClick={() => {
                          removeSearch(h);
                          setHistory(getSearchHistory());
                        }}
                        className="px-2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                recent.length === 0 && (
                  <p className="px-1 py-6 text-center text-sm text-gray-400">
                    Nhập để tìm ý tưởng, freelancer…
                  </p>
                )
              )}
            </>
          ) : loading || !results ? (
            <p className="px-1 py-6 text-center text-sm text-gray-400">Đang tìm…</p>
          ) : results.freelancers.length > 0 || results.designs.length > 0 ? (
            <>
              {results.freelancers.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1 px-1 text-xs font-semibold text-gray-400">Freelancer</p>
                  {results.freelancers.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => goFreelancer(f)}
                      className="flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left hover:bg-gray-50"
                    >
                      <Avatar name={f.name} size="h-9 w-9 text-sm" />
                      <span className="truncate text-sm font-medium text-gray-800">{f.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.designs.length > 0 && (
                <div>
                  <p className="mb-2 px-1 text-xs font-semibold text-gray-400">Thiết kế</p>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {results.designs.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => goDesign(d.id)}
                        title={d.title}
                        className="aspect-square overflow-hidden rounded-xl bg-gray-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={d.cover} alt={d.title} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="px-1 py-6 text-center text-sm text-gray-400">
              Không tìm thấy kết quả cho “{query.trim()}”
            </p>
          )}
        </div>
      )}
    </div>
  );
}
