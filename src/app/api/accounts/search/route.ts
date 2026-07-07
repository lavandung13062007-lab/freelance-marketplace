import { NextRequest, NextResponse } from "next/server";
import { searchAccounts } from "@/lib/accounts";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const results = await searchAccounts(q);
  return NextResponse.json({ accounts: results });
}
