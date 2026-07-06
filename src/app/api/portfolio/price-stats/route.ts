import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = (searchParams.get("topic") ?? "").trim().toLowerCase();
  const excludeImageId = searchParams.get("exclude") ?? undefined;

  if (!topic) {
    return NextResponse.json({ count: 0, min: null, max: null, avg: null });
  }

  const supabase = await createClient();

  const { data: approvedPosts } = await supabase
    .from("portfolio_posts")
    .select("id")
    .eq("status", "approved");

  const approvedIds = (approvedPosts ?? []).map((p) => p.id);
  if (approvedIds.length === 0) {
    return NextResponse.json({ count: 0, min: null, max: null, avg: null });
  }

  let query = supabase
    .from("portfolio_post_images")
    .select("price, id")
    .eq("topic", topic)
    .in("post_id", approvedIds)
    .not("price", "is", null);

  if (excludeImageId) {
    query = query.neq("id", excludeImageId);
  }

  const { data: images } = await query;

  const prices = (images ?? [])
    .map((img) => Number(img.price))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (prices.length === 0) {
    return NextResponse.json({ count: 0, min: null, max: null, avg: null });
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);

  return NextResponse.json({ count: prices.length, min, max, avg });
}
