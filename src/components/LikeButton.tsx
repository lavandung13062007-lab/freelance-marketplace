"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { toggleLike } from "@/lib/actions/social";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      strokeWidth={2}
      stroke="currentColor"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.5s-7.5-4.7-9.4-9.2C1.2 8 3.2 4.9 6.4 4.9c2 0 3.5 1.1 4.3 2.6.2.4.4.9.5 1.3.1-.4.3-.9.5-1.3.8-1.5 2.3-2.6 4.3-2.6 3.2 0 5.2 3.1 3.8 6.4-1.9 4.5-9.4 9.2-9.4 9.2Z"
      />
    </svg>
  );
}

export default function LikeButton({
  imageId,
  currentUserId,
}: {
  imageId: string;
  currentUserId?: string | null;
}) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const [{ count: total }, mine] = await Promise.all([
          supabase
            .from("design_likes")
            .select("user_id", { count: "exact", head: true })
            .eq("post_image_id", imageId),
          currentUserId
            ? supabase
                .from("design_likes")
                .select("user_id")
                .eq("post_image_id", imageId)
                .eq("user_id", currentUserId)
                .maybeSingle()
            : Promise.resolve({ data: null }),
        ]);
        if (!cancelled) {
          setCount(total ?? 0);
          setLiked(Boolean(mine.data));
        }
      } catch {
        // bảng design_likes chưa tạo — giữ 0, nút vẫn hiển thị
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [imageId, currentUserId]);

  function onClick() {
    if (!currentUserId) return;
    const next = !liked;
    setLiked(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    startTransition(async () => {
      const { liked: real } = await toggleLike(imageId);
      if (real !== next) {
        setLiked(real);
        setCount((c) => Math.max(0, c + (real ? 1 : -1)));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || !currentUserId}
      title={currentUserId ? (liked ? "Bỏ tim" : "Tim thiết kế") : "Đăng nhập để tim"}
      className={`flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
        liked
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-gray-200 text-gray-800 hover:bg-gray-50"
      }`}
    >
      <HeartIcon filled={liked} />
      {count > 0 ? count : "Tim"}
    </button>
  );
}
