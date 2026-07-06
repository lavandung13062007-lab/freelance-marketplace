"use client";

import { useState } from "react";
import Link from "next/link";
import PortfolioImageManager, { type ExistingImage } from "@/components/PortfolioImageManager";
import TagInput from "@/components/TagInput";
import TopicSelect from "@/components/TopicSelect";
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
  topic: string;
  tags: string[];
};

export default function PortfolioForm({
  action,
  error,
  categoryNames,
  tagSuggestions,
  initialValues,
  existingImages,
  postId,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  error?: string;
  categoryNames: string[];
  tagSuggestions: string[];
  initialValues?: PortfolioFormValues;
  existingImages?: ExistingImage[];
  postId?: string;
  submitLabel: string;
}) {
  const [topic, setTopic] = useState<string>(initialValues?.topic ?? "");
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Chủ đề</label>
            <TopicSelect categories={categoryNames} value={topic} onChange={setTopic} />
            <p className="mt-1 text-xs text-gray-400">
              Chọn 1 chủ đề để xem mức giá thị trường phù hợp
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Gắn thẻ</label>
            <TagInput suggestions={tagSuggestions} tags={tags} onChange={setTags} maxTags={20} />
            <p className="mt-1 text-xs text-gray-400">Giúp khách lọc tìm kiếm dễ hơn</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Giá (VNĐ)</label>
            <PriceGuide topic={topic} excludePostId={postId} initialValue={initialValues?.price} />
          </div>

          {error && <p className="text-sm font-medium text-brand">{error}</p>}

          <SubmitButton>{submitLabel}</SubmitButton>
        </div>

        <div className="max-w-xl flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">Ảnh</label>
          <PortfolioImageManager initialImages={existingImages ?? []} />
        </div>
      </form>
    </div>
  );
}
