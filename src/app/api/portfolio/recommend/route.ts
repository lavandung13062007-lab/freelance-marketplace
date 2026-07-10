import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getApprovedCandidateCards, type RankableCard } from "@/lib/portfolio";

type Interests = { topics?: Record<string, number>; tags?: Record<string, number> };

const TOPIC_WEIGHT = 3;
const TAG_WEIGHT = 1;
// Mỗi lượt tim cộng thẳng vào điểm — thiết kế được cộng đồng tim nhiều
// sẽ nổi lên trong đề xuất, kể cả với người xem chưa có lịch sử sở thích.
const LIKE_WEIGHT = 2;

function scoreCard(card: RankableCard, interests: Interests, likes: Map<string, number>): number {
  let score = 0;
  if (card.topic) score += (interests.topics?.[card.topic] ?? 0) * TOPIC_WEIGHT;
  for (const tag of card.tags) score += (interests.tags?.[tag] ?? 0) * TAG_WEIGHT;
  score += (likes.get(card.id) ?? 0) * LIKE_WEIGHT;
  return score;
}

// Đếm lượt tim theo từng thiết kế. Bảng có thể chưa tạo -> map rỗng.
async function getLikeCounts(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("design_likes").select("post_image_id").limit(10000);
    for (const row of data ?? []) {
      counts.set(row.post_image_id, (counts.get(row.post_image_id) ?? 0) + 1);
    }
  } catch {
    // giữ map rỗng
  }
  return counts;
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

  const [allCards, likeCounts] = await Promise.all([
    getApprovedCandidateCards(),
    getLikeCounts(),
  ]);
  const cards = allCards.filter((c) => !exclude.has(c.id));

  // Xếp hạng ổn định: điểm sở thích + lượt tim giảm dần; danh sách gốc đã theo
  // thời gian (mới nhất trước) nên khi chưa có tín hiệu sẽ tự rơi về "mới nhất".
  const ranked = cards
    .map((card, index) => ({ card, score: scoreCard(card, interests, likeCounts), index }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const page = ranked.slice(offset, offset + limit).map(({ card }) => {
    // Không trả tags ra ngoài — client không cần cho lưới hiển thị.
    const { tags: _tags, ...rest } = card;
    void _tags;
    return rest;
  });

  return NextResponse.json({ cards: page, hasMore: offset + limit < ranked.length });
}
