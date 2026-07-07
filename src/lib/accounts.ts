import { createClient } from "@/lib/supabase/server";

export type AccountHit = { id: string; full_name: string };

// Tìm tài khoản theo email/số điện thoại (khớp chính xác) qua RPC search_accounts.
// Nếu RPC chưa được tạo (chưa chạy migration) thì trả về rỗng thay vì lỗi.
export async function searchAccounts(term: string): Promise<AccountHit[]> {
  const q = term.trim();
  if (!q) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_accounts", { term: q });
  if (error) return [];
  return (data ?? []) as AccountHit[];
}
