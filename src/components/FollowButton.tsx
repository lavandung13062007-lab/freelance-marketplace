"use client";

import { useState, useTransition } from "react";
import { toggleFollow } from "@/lib/actions/social";

export default function FollowButton({
  freelancerId,
  initialFollowing,
  initialCount,
}: {
  freelancerId: string;
  initialFollowing: boolean;
  initialCount: number;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();

  function onClick() {
    // Optimistic: đổi giao diện ngay, server xử lý phía sau
    const next = !following;
    setFollowing(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    startTransition(async () => {
      const { following: real } = await toggleFollow(freelancerId);
      if (real !== next) {
        setFollowing(real);
        setCount((c) => Math.max(0, c + (real ? 1 : -1)));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        following
          ? "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          : "bg-brand-yellow text-gray-900 hover:brightness-95"
      }`}
    >
      {following ? "✓ Đang theo dõi" : "＋ Theo dõi"}
      <span className="ml-1.5 text-xs font-medium text-gray-500">{count}</span>
    </button>
  );
}
