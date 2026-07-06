import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tagsParam = searchParams.get("tags") ?? "";
  const excludePostId = searchParams.get("exclude") ?? undefined;

  const tagNames = tagsParam
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  if (tagNames.length === 0) {
    return NextResponse.json({ count: 0, min: null, max: null, avg: null });
  }

  const supabase = await createClient();

  const { data: tagRows } = await supabase.from("tags").select("id").in("name", tagNames);
  const tagIds = (tagRows ?? []).map((t) => t.id);

  if (tagIds.length === 0) {
    return NextResponse.json({ count: 0, min: null, max: null, avg: null });
  }

  const { data: postTagRows } = await supabase
    .from("portfolio_post_tags")
    .select("post_id")
    .in("tag_id", tagIds);

  const postIds = Array.from(new Set((postTagRows ?? []).map((r) => r.post_id))).filter(
    (id) => id !== excludePostId,
  );

  if (postIds.length === 0) {
    return NextResponse.json({ count: 0, min: null, max: null, avg: null });
  }

  const { data: posts } = await supabase
    .from("portfolio_posts")
    .select("price")
    .in("id", postIds)
    .eq("status", "approved")
    .not("price", "is", null);

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
