"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";

export async function updatePhone(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const phone = ((formData.get("phone") as string) ?? "").replace(/\s/g, "").trim() || null;

  const supabase = await createClient();
  await supabase.from("account_contacts").upsert({ id: user.id, phone }, { onConflict: "id" });

  revalidatePath("/profile");
}
