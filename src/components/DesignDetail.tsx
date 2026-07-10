"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CardDetail, PortfolioCard } from "@/lib/portfolio";
import { startConversation } from "@/lib/actions/messages";
import RecommendedFeed from "@/components/RecommendedFeed";
import LikeButton from "@/components/LikeButton";
import { recordInterest, recordFreelancerVisit } from "@/lib/clientHistory";

function formatVND(n: number): string {
  return `${n.toLocaleString("vi-VN")} ₫`;
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
      />
    </svg>
  );
}

function MessageButton({
  freelancerId,
  className,
  children,
}: {
  freelancerId: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <form action={startConversation} onClick={(e) => e.stopPropagation()}>
      <input type="hidden" name="userId" value={freelancerId} />
      <button className={className}>{children}</button>
    </form>
  );
}

export default function DesignDetail({
  detail,
  currentUserId,
  freelancerCards,
  basePath = "/design",
}: {
  detail: CardDetail;
  currentUserId?: string | null;
  freelancerCards: PortfolioCard[];
  basePath?: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const canMessage = Boolean(currentUserId) && currentUserId !== detail.freelancer.id;

  async function handleShare() {
    const url = `${window.location.origin}/share/${detail.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // trình duyệt không hỗ trợ clipboard — bỏ qua, không có gì để hiển thị lỗi
    }
  }

  useEffect(() => {
    recordInterest(detail.topic, detail.tags);
    recordFreelancerVisit({ id: detail.freelancer.id, name: detail.freelancer.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.id]);

  const index = detail.siblings.findIndex((s) => s.id === detail.id);
  const isAlbum = detail.siblings.length > 1;

  function go(delta: number) {
    const n = detail.siblings.length;
    if (n === 0) return;
    const next = detail.siblings[(index + delta + n) % n];
    if (next && next.id !== detail.id) router.push(`${basePath}/${next.id}`);
  }

  const excludeForFeed = useMemo(
    () => [detail.id, ...freelancerCards.map((c) => c.id)],
    [detail.id, freelancerCards],
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800"
      >
        <Chevron direction="left" />
        Quay lại
      </button>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Ảnh + tiến/lùi */}
        <div className="lg:w-3/5">
          <div className="group relative flex items-center justify-center overflow-hidden rounded-3xl bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={detail.cover} alt={detail.title} className="max-h-[70vh] w-full object-contain" />

            {isAlbum && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Ảnh trước"
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow hover:bg-white"
                >
                  <Chevron direction="left" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Ảnh sau"
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow hover:bg-white"
                >
                  <Chevron direction="right" />
                </button>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                  {index + 1}/{detail.siblings.length}
                </span>
              </>
            )}

            {canMessage && (
              <div className="absolute right-3 top-3 opacity-0 transition group-hover:opacity-100">
                <MessageButton
                  freelancerId={detail.freelancer.id}
                  className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow"
                >
                  Nhắn tin
                </MessageButton>
              </div>
            )}
          </div>

          {isAlbum && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {detail.siblings.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => s.id !== detail.id && router.push(`${basePath}/${s.id}`)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl ${
                    s.id === detail.id ? "ring-2 ring-brand ring-offset-2" : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.cover} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Thông tin */}
        <div className="lg:w-2/5">
          {detail.topic && (
            <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {detail.topic}
            </span>
          )}
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900">{detail.title}</h1>
          {detail.price != null && (
            <p className="mt-2 text-xl font-bold text-brand">{formatVND(detail.price)}</p>
          )}
          {detail.description && (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">
              {detail.description}
            </p>
          )}

          {detail.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {detail.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <LikeButton imageId={detail.id} currentUserId={currentUserId} />
            {detail.link && (
              <a
                href={detail.link}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                Xem liên kết
              </a>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              {copied ? "Đã sao chép ✓" : "Chia sẻ"}
            </button>
            {canMessage && (
              <MessageButton
                freelancerId={detail.freelancer.id}
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
              >
                Nhắn tin cho freelancer
              </MessageButton>
            )}
          </div>

          <Link
            href={`/freelancer/${detail.freelancer.id}`}
            className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-100 p-3 hover:bg-gray-50"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-yellow text-lg font-bold text-gray-900">
              {detail.freelancer.name.charAt(0).toUpperCase() || "?"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900">{detail.freelancer.name}</p>
              <p className="text-xs text-gray-500">Xem hồ sơ</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Thêm từ freelancer này */}
      {freelancerCards.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Thêm từ {detail.freelancer.name}</h2>
            <Link
              href={`/freelancer/${detail.freelancer.id}`}
              className="text-sm font-semibold text-brand hover:underline"
            >
              Xem thêm
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {freelancerCards.slice(0, 12).map((c) => (
              <div
                key={c.id}
                onClick={() => router.push(`/design/${c.id}`)}
                className="group w-40 shrink-0 cursor-pointer"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.cover} alt={c.title} className="h-full w-full object-cover" />
                  {canMessage && (
                    <div className="absolute inset-x-0 bottom-0 flex justify-end p-2 opacity-0 transition group-hover:opacity-100">
                      <MessageButton
                        freelancerId={c.freelancerId}
                        className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow"
                      >
                        Nhắn tin
                      </MessageButton>
                    </div>
                  )}
                </div>
                <p className="truncate px-1 py-1 text-xs font-medium text-gray-600">{c.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Khám phá thêm — thiết kế của người khác, theo sở thích */}
      <section className="mt-12">
        <h2 className="mb-4 text-base font-bold text-gray-900">Khám phá thêm</h2>
        <RecommendedFeed currentUserId={currentUserId} exclude={excludeForFeed} />
      </section>
    </div>
  );
}
