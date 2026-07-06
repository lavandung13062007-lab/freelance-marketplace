import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = (searchParams.get("topic") ?? "").trim().toLowerCase();
  const excludePostId = searchParams.get("exclude") ?? undefined;

  if (!topic) {
    return NextResponse.json({ count: 0, min: null, max: null, avg: null });
  }

  const supabase = await createClient();

  let query = supabase
    .from("portfolio_posts")
    .select("price")
    .eq("topic", topic)
    .eq("status", "approved")
    .not("price", "is", null);

  if (excludePostId) {
    query = query.neq("id", excludePostId);
  }

  const { data: posts } = await query;

  const prices = (posts ?? [])
    .map((p) => Number(p.price))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (prices.length === 0) {
    return NextResponse.json({ count: 0, min: null, max: null, avg: null });
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);

  return NextResponse.json({ count: prices.length, min, max, avg });
}
