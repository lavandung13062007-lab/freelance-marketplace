"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";

function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[,#\s]+/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

export async function createPortfolioPost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const link = (formData.get("link") as string)?.trim() || null;
  const collectionName = (formData.get("collection") as string)?.trim();
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

  let collectionId: string | null = null;
  if (collectionName) {
    const { data: existing } = await supabase
      .from("portfolio_collections")
      .select("id")
      .eq("freelancer_id", user.id)
      .eq("name", collectionName)
      .maybeSingle();

    if (existing) {
      collectionId = existing.id;
    } else {
      const { data: created, error } = await supabase
        .from("portfolio_collections")
        .insert({ freelancer_id: user.id, name: collectionName })
        .select("id")
        .single();
      if (error) redirect(`/portfolio/new?error=${encodeURIComponent(error.message)}`);
      collectionId = created!.id;
    }
  }

  const { data: post, error: postError } = await supabase
    .from("portfolio_posts")
    .insert({
      freelancer_id: user.id,
      collection_id: collectionId,
      title,
      description,
      link,
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

  for (const name of parseTags(tagsRaw)) {
    const { data: existingTag } = await supabase
      .from("tags")
      .select("id")
      .eq("name", name)
      .maybeSingle();

    let tagId = existingTag?.id as string | undefined;
    if (!tagId) {
      const { data: createdTag, error } = await supabase
        .from("tags")
        .insert({ name })
        .select("id")
        .single();
      if (error) redirect(`/portfolio/new?error=${encodeURIComponent(error.message)}`);
      tagId = createdTag!.id;
    }
    await supabase.from("portfolio_post_tags").insert({ post_id: post!.id, tag_id: tagId });
  }

  revalidatePath("/portfolio");
  redirect("/portfolio");
}
