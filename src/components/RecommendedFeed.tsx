"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PortfolioCard } from "@/lib/portfolio";
import PortfolioGrid from "@/components/PortfolioGrid";
import { getInterests } from "@/lib/clientHistory";

const PAGE_SIZE = 24;

export default function RecommendedFeed({
  currentUserId,
  exclude = [],
  emptyMessage = "Chưa có ý tưởng nào",
}: {
  currentUserId?: string | null;
  exclude?: string[];
  emptyMessage?: string;
}) {
  const [cards, setCards] = useState<PortfolioCard[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);

  // Cố định sở thích + loại trừ cho suốt phiên cuộn → phân trang ổn định.
  const interestsRef = useRef(getInterests());
  const excludeRef = useRef(exclude);
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests: interestsRef.current,
          exclude: excludeRef.current,
          limit: PAGE_SIZE,
          offset: offsetRef.current,
        }),
      });
      const data: { cards: PortfolioCard[]; hasMore: boolean } = await res.json();
      offsetRef.current += data.cards.length;
      hasMoreRef.current = data.hasMore;
      setCards((prev) => [...prev, ...data.cards]);
      setHasMore(data.hasMore);
    } catch {
      hasMoreRef.current = false;
      setHasMore(false);
    } finally {
      setLoadedOnce(true);
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (loadedOnce && cards.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl bg-gray-50 text-center">
        <p className="text-lg font-bold text-gray-900">{emptyMessage}</p>
        <p className="mt-1 text-sm text-gray-500">Ghé lại sau khi freelancer đăng bài nhé</p>
      </div>
    );
  }

  return (
    <div>
      <PortfolioGrid cards={cards} currentUserId={currentUserId} />
      <div ref={sentinelRef} className="h-px" />
      {loading && <p className="py-6 text-center text-sm text-gray-400">Đang tải…</p>}
      {!hasMore && cards.length > 0 && (
        <p className="py-6 text-center text-sm text-gray-400">Bạn đã xem hết rồi ✨</p>
      )}
    </div>
  );
}
