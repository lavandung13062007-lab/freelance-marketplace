"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { syncCardTags } from "@/lib/portfolio";

type CardInput = {
  key: string;
  existingId?: string;
  newFileIndex?: number;
  title: string;
  description: string;
  link: string;
  price: string;
  topic: string;
  tags: string[];
};

function parseCards(raw: string): CardInput[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is CardInput => c && typeof c === "object" && typeof c.title === "string",
    );
  } catch {
    return [];
  }
}

function parseTags(raw: string[]): string[] {
  return Array.from(new Set(raw.map((t) => t.trim().toLowerCase()).filter(Boolean))).slice(0, 20);
}

function parseTopic(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  return trimmed || null;
}

function parsePrice(raw: string): string | null {
  const trimmed = raw.trim();
  return /^\d+$/.test(trimmed) ? trimmed : null;
}

export async function createPortfolioPost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const cards = parseCards((formData.get("cards") as string) ?? "[]");
  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (cards.length === 0) {
    redirect(`/portfolio/new?error=${encodeURIComponent("Vui lòng thêm ít nhất 1 thẻ")}`);
  }
  if (cards.some((c) => !c.title.trim())) {
    redirect(`/portfolio/new?error=${encodeURIComponent("Mỗi thẻ cần có tiêu đề")}`);
  }

  const supabase = await createClient();

  const { data: post, error: postError } = await supabase
    .from("portfolio_posts")
    .insert({ freelancer_id: user.id })
    .select("id")
    .single();

  if (postError) {
    redirect(`/portfolio/new?error=${encodeURIComponent(postError.message)}`);
  }

  for (const [index, card] of cards.entries()) {
    const file = card.newFileIndex != null ? files[card.newFileIndex] : undefined;
    if (!file) continue;

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(path, file, { contentType: file.type });
    if (uploadError) {
      redirect(`/portfolio/new?error=${encodeURIComponent(uploadError.message)}`);
    }
    const { data: pub } = supabase.storage.from("portfolio").getPublicUrl(path);

    const { data: image, error: imageError } = await supabase
      .from("portfolio_post_images")
      .insert({
        post_id: post!.id,
        image_url: pub.publicUrl,
        position: index,
        title: card.title.trim(),
        description: card.description?.trim() || null,
        link: card.link?.trim() || null,
        price: parsePrice(card.price ?? ""),
        topic: parseTopic(card.topic ?? ""),
      })
      .select("id")
      .single();

    if (imageError) {
      redirect(`/portfolio/new?error=${encodeURIComponent(imageError.message)}`);
    }

    await syncCardTags(supabase, image!.id, parseTags(card.tags ?? []));
  }

  revalidatePath("/portfolio");
  redirect("/portfolio");
}

export async function updatePortfolioPost(postId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const cards = parseCards((formData.get("cards") as string) ?? "[]");
  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (cards.length === 0) {
    redirect(`/portfolio/${postId}?error=${encodeURIComponent("Cần ít nhất 1 thẻ")}`);
  }
  if (cards.some((c) => !c.title.trim())) {
    redirect(`/portfolio/${postId}?error=${encodeURIComponent("Mỗi thẻ cần có tiêu đề")}`);
  }

  const supabase = await createClient();

  const { data: currentImages } = await supabase
    .from("portfolio_post_images")
    .select("id, image_url")
    .eq("post_id", postId);

  const keptIds = new Set(cards.filter((c) => c.existingId).map((c) => c.existingId as string));
  const removedImages = (currentImages ?? []).filter((img) => !keptIds.has(img.id));
  const imagesChanged = removedImages.length > 0 || cards.some((c) => c.newFileIndex != null);

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

  for (const [index, card] of cards.entries()) {
    const baseFields = {
      position: index,
      title: card.title.trim(),
      description: card.description?.trim() || null,
      link: card.link?.trim() || null,
      price: parsePrice(card.price ?? ""),
      topic: parseTopic(card.topic ?? ""),
    };

    if (card.existingId) {
      const { error: updateError } = await supabase
        .from("portfolio_post_images")
        .update(baseFields)
        .eq("id", card.existingId);
      if (updateError) {
        redirect(`/portfolio/${postId}?error=${encodeURIComponent(updateError.message)}`);
      }
      await syncCardTags(supabase, card.existingId, parseTags(card.tags ?? []));
    } else if (card.newFileIndex != null) {
      const file = files[card.newFileIndex];
      if (!file) continue;

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(path, file, { contentType: file.type });
      if (uploadError) {
        redirect(`/portfolio/${postId}?error=${encodeURIComponent(uploadError.message)}`);
      }
      const { data: pub } = supabase.storage.from("portfolio").getPublicUrl(path);

      const { data: image, error: imageError } = await supabase
        .from("portfolio_post_images")
        .insert({ post_id: postId, image_url: pub.publicUrl, ...baseFields })
        .select("id")
        .single();
      if (imageError) {
        redirect(`/portfolio/${postId}?error=${encodeURIComponent(imageError.message)}`);
      }
      await syncCardTags(supabase, image!.id, parseTags(card.tags ?? []));
    }
  }

  if (imagesChanged) {
    await supabase
      .from("portfolio_posts")
      .update({ status: "pending" })
      .eq("id", postId)
      .eq("freelancer_id", user.id);
  }

  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${postId}`);
  redirect("/portfolio");
}
