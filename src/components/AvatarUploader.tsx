"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "@/components/Avatar";
import { uploadAvatar } from "@/lib/actions/account";

export default function AvatarUploader({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Khi profile trả về avatarUrl mới (sau khi revalidate), bỏ ảnh xem trước tạm
  // thời — theo đúng cách React khuyến nghị để "đồng bộ theo prop" mà không cần effect.
  const [lastAvatarUrl, setLastAvatarUrl] = useState(avatarUrl);
  if (avatarUrl !== lastAvatarUrl) {
    setLastAvatarUrl(avatarUrl);
    setPreview(null);
  }

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);
    await uploadAvatar(formData);
    setUploading(false);
    e.target.value = "";
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="group relative h-14 w-14 shrink-0 rounded-full"
      aria-label="Đổi ảnh đại diện"
    >
      <Avatar name={name} avatarUrl={preview ?? avatarUrl} size="h-14 w-14 text-xl" />
      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-[9px] font-semibold leading-tight text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
        {uploading ? "Đang tải…" : "Đổi ảnh"}
      </span>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
    </button>
  );
}
