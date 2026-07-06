"use client";

import { useRouter } from "next/navigation";
import type { PortfolioCard } from "@/lib/portfolio";
import { startConversation } from "@/lib/actions/messages";

function formatVND(n: number): string {
  return `${n.toLocaleString("vi-VN")} ₫`;
}

export default function PortfolioGrid({
  cards,
  currentUserId,
}: {
  cards: PortfolioCard[];
  currentUserId?: string | null;
}) {
  const router = useRouter();

  return (
    <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
      {cards.map((card) => {
        const canMessage = Boolean(currentUserId) && currentUserId !== card.freelancerId;

        return (
          <div
            key={card.id}
            onClick={() => router.push(`/design/${card.id}`)}
            className="group cursor-pointer break-inside-avoid"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.cover}
                alt={card.title}
                loading="lazy"
                className="w-full rounded-2xl"
              />

              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-black/0 p-3 opacity-0 transition group-hover:bg-black/60 group-hover:opacity-100">
                {card.topic && (
                  <span className="pointer-events-auto self-start rounded-full bg-white/20 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
                    {card.topic}
                  </span>
                )}

                <div className="pointer-events-auto space-y-1.5">
                  {card.price != null && (
                    <p className="text-base font-bold text-white">{formatVND(card.price)}</p>
                  )}
                  {card.description && (
                    <p className="line-clamp-2 text-xs text-white/90">{card.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {card.link && (
                      <a
                        href={card.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-900"
                      >
                        Xem liên kết
                      </a>
                    )}
                    {canMessage && (
                      <form action={startConversation} onClick={(e) => e.stopPropagation()}>
                        <input type="hidden" name="userId" value={card.freelancerId} />
                        <button className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white">
                          Nhắn tin
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <p className="truncate px-1 py-2 text-xs font-medium text-gray-600">{card.title}</p>
          </div>
        );
      })}
    </div>
  );
}
