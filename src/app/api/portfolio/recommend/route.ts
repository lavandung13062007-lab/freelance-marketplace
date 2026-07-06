import { NextRequest, NextResponse } from "next/server";
import { getApprovedCandidateCards, type RankableCard } from "@/lib/portfolio";

type Interests = { topics?: Record<string, number>; tags?: Record<string, number> };

const TOPIC_WEIGHT = 3;
const TAG_WEIGHT = 1;

function scoreCard(card: RankableCard, interests: Interests): number {
  let score = 0;
  if (card.topic) score += (interests.topics?.[card.topic] ?? 0) * TOPIC_WEIGHT;
  for (const tag of card.tags) score += (interests.tags?.[tag] ?? 0) * TAG_WEIGHT;
  return score;
}

export async function POST(request: NextRequest) {
  let body: {
    interests?: Interests;
    exclude?: string[];
    limit?: number;
    offset?: number;
  } = {};
  try {
    body = await request.json();
  } catch {
    // body rỗng — dùng mặc định
  }

  const interests = body.interests ?? {};
  const exclude = new Set(body.exclude ?? []);
  const limit = Math.min(Math.max(body.limit ?? 24, 1), 48);
  const offset = Math.max(body.offset ?? 0, 0);

  const cards = (await getApprovedCandidateCards()).filter((c) => !exclude.has(c.id));

  // Xếp hạng ổn định: điểm sở thích giảm dần; danh sách gốc đã theo thời gian
  // (mới nhất trước) nên khi chưa có sở thích sẽ tự rơi về "mới nhất".
  const ranked = cards
    .map((card, index) => ({ card, score: scoreCard(card, interests), index }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const page = ranked.slice(offset, offset + limit).map(({ card }) => {
    // Không trả tags ra ngoài — client không cần cho lưới hiển thị.
    const { tags: _tags, ...rest } = card;
    void _tags;
    return rest;
  });

  return NextResponse.json({ cards: page, hasMore: offset + limit < ranked.length });
}
