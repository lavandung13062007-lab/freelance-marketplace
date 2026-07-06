import { NextRequest, NextResponse } from "next/server";
import { searchApproved } from "@/lib/portfolio";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const results = await searchApproved(q);
  return NextResponse.json(results);
}
