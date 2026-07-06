"use client";

import { useEffect, useState } from "react";

function formatVND(n: number): string {
  return n.toLocaleString("vi-VN");
}

const DEFAULT_MAX = 5000000;
const STEP = 100000;
const EMPTY_STATS: Stats = { count: 0, min: null, max: null, avg: null };

type Stats = { count: number; min: number | null; max: number | null; avg: number | null };
type Result = { key: string; stats: Stats };

export default function PriceGuide({
  topic,
  excludePostId,
  initialValue,
}: {
  topic: string;
  excludePostId?: string;
  initialValue?: string;
}) {
  const [result, setResult] = useState<Result | null>(null);
  const [price, setPrice] = useState<number>(() => {
    const parsed = initialValue ? Number(initialValue) : NaN;
    return Number.isFinite(parsed) && parsed > 0
      ? parsed
      : Math.round(DEFAULT_MAX / 2 / STEP) * STEP;
  });

  const topicKey = topic.trim().toLowerCase();
  const stats = topicKey && result?.key === topicKey ? result.stats : EMPTY_STATS;
  const loading = Boolean(topicKey) && result?.key !== topicKey;

  useEffect(() => {
    if (!topicKey) return;

    const controller = new AbortController();
    const params = new URLSearchParams({ topic: topicKey });
    if (excludePostId) params.set("exclude", excludePostId);

    fetch(`/api/portfolio/price-stats?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: Stats) => setResult({ key: topicKey, stats: data }))
      .catch(() => setResult({ key: topicKey, stats: EMPTY_STATS }));

    return () => controller.abort();
  }, [topicKey, excludePostId]);

  const sliderMax =
    stats.max != null
      ? Math.max(Math.ceil((stats.max * 1.5) / STEP) * STEP, DEFAULT_MAX)
      : DEFAULT_MAX;
  const displayPrice = Math.min(price, sliderMax);

  const avgBarIndex =
    stats.count > 0 && stats.avg != null && stats.min != null && stats.max != null
      ? stats.max > stats.min
        ? Math.round(((stats.avg - stats.min) / (stats.max - stats.min)) * 9)
        : 4
      : -1;

  return (
    <div>
      <div className="mb-2 flex items-end gap-1">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`h-6 flex-1 rounded-full ${
              i === avgBarIndex ? "bg-brand" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <p className="mb-3 text-xs text-gray-400">
        {stats.count > 0 && stats.min != null && stats.max != null
          ? `Freelancer khác từng nhận ${formatVND(stats.min)} – ${formatVND(stats.max)} ₫ cho chủ đề này, trung bình ${formatVND(stats.avg ?? 0)} ₫`
          : loading
            ? "Đang tải mức giá tham khảo…"
            : topicKey
              ? "Chưa có dữ liệu giá cho chủ đề này"
              : "Chọn chủ đề để xem giá tham khảo"}
      </p>

      <input type="hidden" name="price" value={displayPrice} />
      <input
        type="range"
        min={0}
        max={sliderMax}
        step={STEP}
        value={displayPrice}
        onChange={(e) => setPrice(Number(e.target.value))}
        className="w-full accent-brand"
      />
      <p className="mt-1 text-center text-lg font-bold text-gray-900">
        {formatVND(displayPrice)} ₫
      </p>
    </div>
  );
}
