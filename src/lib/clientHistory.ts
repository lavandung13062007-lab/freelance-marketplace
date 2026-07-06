// Lịch sử & sở thích lưu ngay trên trình duyệt của khách (localStorage).
// Không đụng tới cơ sở dữ liệu — đơn giản, riêng tư theo thiết bị.

const RECENT_FREELANCERS_KEY = "fm:recentFreelancers";
const SEARCH_HISTORY_KEY = "fm:searchHistory";
const INTERESTS_KEY = "fm:interests";

const MAX_RECENT_FREELANCERS = 12;
const MAX_SEARCH_HISTORY = 10;
const MAX_INTEREST_ENTRIES = 60;

export type RecentFreelancer = { id: string; name: string };
export type Interests = { topics: Record<string, number>; tags: Record<string, number> };

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // hết dung lượng hoặc bị chặn — bỏ qua
  }
}

// ---- Freelancer đã xem gần đây ----

export function getRecentFreelancers(): RecentFreelancer[] {
  return read<RecentFreelancer[]>(RECENT_FREELANCERS_KEY, []);
}

export function recordFreelancerVisit(freelancer: RecentFreelancer): void {
  if (!freelancer.id || !freelancer.name) return;
  const existing = getRecentFreelancers().filter((f) => f.id !== freelancer.id);
  write(RECENT_FREELANCERS_KEY, [freelancer, ...existing].slice(0, MAX_RECENT_FREELANCERS));
}

// ---- Lịch sử tìm kiếm ----

export function getSearchHistory(): string[] {
  return read<string[]>(SEARCH_HISTORY_KEY, []);
}

export function recordSearch(query: string): void {
  const q = query.trim();
  if (!q) return;
  const existing = getSearchHistory().filter((s) => s.toLowerCase() !== q.toLowerCase());
  write(SEARCH_HISTORY_KEY, [q, ...existing].slice(0, MAX_SEARCH_HISTORY));
}

export function removeSearch(query: string): void {
  write(
    SEARCH_HISTORY_KEY,
    getSearchHistory().filter((s) => s !== query),
  );
}

// ---- Sở thích (chủ đề + thẻ) suy ra ngầm khi khách mở ảnh ----

export function getInterests(): Interests {
  return read<Interests>(INTERESTS_KEY, { topics: {}, tags: {} });
}

function bump(map: Record<string, number>, key: string, by: number): void {
  const k = key.trim().toLowerCase();
  if (!k) return;
  map[k] = (map[k] ?? 0) + by;
}

function capEntries(map: Record<string, number>): Record<string, number> {
  const entries = Object.entries(map);
  if (entries.length <= MAX_INTEREST_ENTRIES) return map;
  return Object.fromEntries(
    entries.sort((a, b) => b[1] - a[1]).slice(0, MAX_INTEREST_ENTRIES),
  );
}

// Mở 1 ảnh: chủ đề nặng ký hơn (3), mỗi thẻ nhẹ hơn (1).
export function recordInterest(topic: string | null, tags: string[]): void {
  const interests = getInterests();
  if (topic) bump(interests.topics, topic, 3);
  for (const tag of tags) bump(interests.tags, tag, 1);
  write(INTERESTS_KEY, {
    topics: capEntries(interests.topics),
    tags: capEntries(interests.tags),
  });
}
