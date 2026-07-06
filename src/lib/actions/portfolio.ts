"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { syncPostTags } from "@/lib/portfolio";

function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

function parsePrice(raw: string): string | null {
  const trimmed = raw.trim();
  return /^\d+$/.test(trimmed) ? trimmed : null;
}

export async function createPortfolioPost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const link = (formData.get("link") as string)?.trim() || null;
  const price = parsePrice((formData.get("price") as string) ?? "");
  const tagsRaw = (formData.get("tags") as string) ?? "";
  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (!title) {
    redirect(`/portfolio/new?error=${encodeURIComponent("Vui lòng nhập tiêu đề")}`);
  }
  if (files.length === 0) {
    redirect(`/portfolio/new?error=${encodeURIComponent("Vui lòng chọn ít nhất 1 ảnh")}`);
  }

  const supabase = await createClient();

  const imageUrls: string[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(path, file, { contentType: file.type });
    if (uploadError) {
      redirect(`/portfolio/new?error=${encodeURIComponent(uploadError.message)}`);
    }
    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    imageUrls.push(data.publicUrl);
  }

  const { data: post, error: postError } = await supabase
    .from("portfolio_posts")
    .insert({
      freelancer_id: user.id,
      title,
      description,
      link,
      price,
    })
    .select("id")
    .single();

  if (postError) {
    redirect(`/portfolio/new?error=${encodeURIComponent(postError.message)}`);
  }

  const { error: imagesError } = await supabase.from("portfolio_post_images").insert(
    imageUrls.map((url, i) => ({ post_id: post!.id, image_url: url, position: i })),
  );
  if (imagesError) {
    redirect(`/portfolio/new?error=${encodeURIComponent(imagesError.message)}`);
  }

  await syncPostTags(supabase, post!.id, parseTags(tagsRaw));

  revalidatePath("/portfolio");
  redirect("/portfolio");
}

export async function updatePortfolioPost(postId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const link = (formData.get("link") as string)?.trim() || null;
  const price = parsePrice((formData.get("price") as string) ?? "");
  const tagsRaw = (formData.get("tags") as string) ?? "";
  const keepImageIds = ((formData.get("keepImageIds") as string) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const newFiles = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (!title) {
    redirect(`/portfolio/${postId}?error=${encodeURIComponent("Vui lòng nhập tiêu đề")}`);
  }
  if (keepImageIds.length + newFiles.length === 0) {
    redirect(`/portfolio/${postId}?error=${encodeURIComponent("Cần ít nhất 1 ảnh")}`);
  }

  const supabase = await createClient();

  const { data: currentImages } = await supabase
    .from("portfolio_post_images")
    .select("id, image_url")
    .eq("post_id", postId);

  const removedImages = (currentImages ?? []).filter((img) => !keepImageIds.includes(img.id));
  const imagesChanged = removedImages.length > 0 || newFiles.length > 0;

  for (const img of removedImages) {
    const path = img.image_url.split("/portfolio/")[1];
    if (path) await supabase.storage.from("portfolio").remove([path]);
  }
  if (removedImages.length > 0) {
    await supabase
      .from("portfolio_post_images")
      .delete()
      .in(
        "id",
        removedImages.map((img) => img.id),
      );
  }

  const newUrls: string[] = [];
  for (const file of newFiles) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(path, file, { contentType: file.type });
    if (uploadError) {
      redirect(`/portfolio/${postId}?error=${encodeURIComponent(uploadError.message)}`);
    }
    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    newUrls.push(data.publicUrl);
  }
  if (newUrls.length > 0) {
    await supabase.from("portfolio_post_images").insert(
      newUrls.map((url, i) => ({
        post_id: postId,
        image_url: url,
        position: keepImageIds.length + i,
      })),
    );
  }

  const updates: {
    title: string;
    description: string | null;
    link: string | null;
    price: string | null;
    status?: "pending";
  } = {
    title,
    description,
    link,
    price,
  };
  if (imagesChanged) {
    updates.status = "pending";
  }

  const { error: updateError } = await supabase
    .from("portfolio_posts")
    .update(updates)
    .eq("id", postId)
    .eq("freelancer_id", user.id);

  if (updateError) {
    redirect(`/portfolio/${postId}?error=${encodeURIComponent(updateError.message)}`);
  }

  await syncPostTags(supabase, postId, parseTags(tagsRaw));

  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${postId}`);
  redirect("/portfolio");
}
