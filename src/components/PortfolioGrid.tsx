import Link from "next/link";
import type { PortfolioCard } from "@/lib/portfolio";

export default function PortfolioGrid({
  cards,
  linkToFreelancer = false,
}: {
  cards: PortfolioCard[];
  linkToFreelancer?: boolean;
}) {
  return (
    <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
      {cards.map((card) => {
        const item = (
          <div className="break-inside-avoid overflow-hidden rounded-2xl bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.cover}
              alt={card.title}
              loading="lazy"
              className="w-full rounded-2xl"
            />
            <p className="truncate px-1 py-2 text-xs font-medium text-gray-600">{card.title}</p>
          </div>
        );

        return linkToFreelancer ? (
          <Link key={card.id} href={`/freelancer/${card.freelancerId}`}>
            {item}
          </Link>
        ) : (
          <div key={card.id}>{item}</div>
        );
      })}
    </div>
  );
}
