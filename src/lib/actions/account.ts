"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { VIETNAM_BANKS } from "@/lib/vietnamBanks";

export async function updatePhone(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const phone = ((formData.get("phone") as string) ?? "").replace(/\s/g, "").trim() || null;

  const supabase = await createClient();
  await supabase.from("account_contacts").upsert({ id: user.id, phone }, { onConflict: "id" });

  revalidatePath("/profile");
}

export async function uploadAvatar(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return;

  const supabase = await createClient();

  const { data: current } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type });
  if (uploadError) return;

  const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
  await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", user.id);

  const oldPath = current?.avatar_url?.split("/avatars/")[1];
  if (oldPath) await supabase.storage.from("avatars").remove([oldPath]);

  revalidatePath("/profile");
  revalidatePath("/dashboard");
}

export async function setFreelancerMode(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const enabled = formData.get("freelancer") === "on";
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ role: enabled ? "freelancer" : "client" })
    .eq("id", user.id);

  revalidatePath("/profile");
}

export async function updateBankInfo(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rawCode = ((formData.get("bank_code") as string) ?? "").trim();
  const bank_name = VIETNAM_BANKS.some((b) => b.code === rawCode) ? rawCode : null;
  const bank_account_number = ((formData.get("bank_account_number") as string) ?? "").trim() || null;
  const bank_account_holder = ((formData.get("bank_account_holder") as string) ?? "").trim() || null;

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ bank_name, bank_account_number, bank_account_holder })
    .eq("id", user.id);

  revalidatePath("/profile");
}
