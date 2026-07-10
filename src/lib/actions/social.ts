"use server";

import { createClient } from "@/lib/supabase/server";

// Theo dõi / bỏ theo dõi một freelancer. Trả về trạng thái mới.
export async function toggleFollow(freelancerId: string): Promise<{ following: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id === freelancerId) return { following: false };

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("freelancer_id", freelancerId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("freelancer_id", freelancerId);
    return { following: false };
  }

  await supabase.from("follows").insert({ follower_id: user.id, freelancer_id: freelancerId });
  return { following: true };
}

// Tim / bỏ tim một thiết kế. Trả về trạng thái mới.
export async function toggleLike(imageId: string): Promise<{ liked: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { liked: false };

  const { data: existing } = await supabase
    .from("design_likes")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("post_image_id", imageId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("design_likes")
      .delete()
      .eq("user_id", user.id)
      .eq("post_image_id", imageId);
    return { liked: false };
  }

  await supabase.from("design_likes").insert({ user_id: user.id, post_image_id: imageId });
  return { liked: true };
}
