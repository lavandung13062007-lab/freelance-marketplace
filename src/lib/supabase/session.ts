import { cache } from "react";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  const headersList = await headers();
  const id = headersList.get("x-user-id");
  if (!id) return null;
  const email = decodeURIComponent(headersList.get("x-user-email") ?? "");
  return { id, email };
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  return data;
});

// Tách riêng khỏi getCurrentProfile: nếu avatar_url/role chưa tồn tại (chưa chạy
// migration mới) thì chỉ ảnh đại diện/chế độ freelancer bị ảnh hưởng, không kéo
// theo việc hiển thị tên ở khắp nơi.
export const getProfileExtras = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();
  return data;
});
