"use client";

import { useState } from "react";
import Link from "next/link";
import PortfolioImageManager, { type ExistingImage } from "@/components/PortfolioImageManager";
import TagInput from "@/components/TagInput";
import PriceGuide from "@/components/PriceGuide";
import SubmitButton from "@/components/SubmitButton";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export type PortfolioFormValues = {
  title: string;
  description: string;
  link: string;
  price: string;
  tags: string[];
};

export default function PortfolioForm({
  action,
  error,
  tagSuggestions,
  initialValues,
  existingImages,
  imageMode = "album",
  postId,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  error?: string;
  tagSuggestions: string[];
  initialValues?: PortfolioFormValues;
  existingImages?: ExistingImage[];
  imageMode?: "single" | "album";
  postId?: string;
  submitLabel: string;
}) {
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/portfolio"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
        >
          <BackIcon />
        </Link>
        <h1 className="text-xl font-extrabold tracking-tight text-gray-900">Đăng dự án</h1>
      </div>

      <form action={action} className="flex flex-col gap-8 lg:flex-row">
        <div className="w-full max-w-md shrink-0 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tiêu đề</label>
            <input
              name="title"
              type="text"
              required
              defaultValue={initialValues?.title}
              placeholder="VD: Bộ nhận diện thương hiệu cà phê"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={initialValues?.description}
              placeholder="Vài dòng giới thiệu về dự án này"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Liên kết</label>
            <input
              name="link"
              type="url"
              defaultValue={initialValues?.link}
              placeholder="Không bắt buộc"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Từ khoá cốt lõi
            </label>
            <TagInput suggestions={tagSuggestions} tags={tags} onChange={setTags} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Giá (VNĐ)</label>
            <PriceGuide tags={tags} excludePostId={postId} initialValue={initialValues?.price} />
          </div>

          {error && <p className="text-sm font-medium text-brand">{error}</p>}

          <SubmitButton>{submitLabel}</SubmitButton>
        </div>

        <div className="max-w-xl flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">Ảnh</label>
          <PortfolioImageManager initialImages={existingImages ?? []} mode={imageMode} />
        </div>
      </form>
    </div>
  );
}
