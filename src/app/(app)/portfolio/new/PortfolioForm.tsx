"use client";

import { useRef, useState } from "react";
import { createPortfolioPost } from "@/lib/actions/portfolio";
import SubmitButton from "@/components/SubmitButton";

export default function PortfolioForm({
  error,
  collectionNames,
}: {
  error?: string;
  collectionNames: string[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  function syncInputFiles(next: File[]) {
    const dataTransfer = new DataTransfer();
    next.forEach((file) => dataTransfer.items.add(file));
    if (inputRef.current) inputRef.current.files = dataTransfer.files;
    setFiles(next);
  }

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    syncInputFiles([...files, ...Array.from(e.target.files ?? [])]);
  }

  function handleRemove(index: number) {
    syncInputFiles(files.filter((_, i) => i !== index));
  }

  return (
    <form action={createPortfolioPost} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Ảnh</label>
        <div className="flex flex-wrap gap-3">
          {files.map((file, i) => (
            <div key={i} className="relative h-24 w-24 overflow-hidden rounded-xl bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-brand hover:text-brand"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-xs">Thêm ảnh</span>
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={handlePick}
          className="hidden"
        />
        <p className="mt-1 text-xs text-gray-400">Chọn 1 ảnh, hoặc nhiều ảnh để tạo thành 1 bộ</p>
      </div>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
          Tiêu đề
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="VD: Bộ nhận diện thương hiệu cà phê"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
          Mô tả
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Vài dòng giới thiệu về dự án này"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label htmlFor="link" className="mb-1 block text-sm font-medium text-gray-700">
          Liên kết
        </label>
        <input
          id="link"
          name="link"
          type="url"
          placeholder="https://..."
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label htmlFor="collection" className="mb-1 block text-sm font-medium text-gray-700">
          Thêm vào bộ
        </label>
        <input
          id="collection"
          name="collection"
          type="text"
          list="collection-list"
          placeholder="VD: Thiết kế logo (để trống nếu không cần)"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
        />
        <datalist id="collection-list">
          {collectionNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>

      <div>
        <label htmlFor="tags" className="mb-1 block text-sm font-medium text-gray-700">
          Gắn thẻ
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          placeholder="VD: logo, tối giản, thương hiệu"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
        />
        <p className="mt-1 text-xs text-gray-400">Cách nhau bằng dấu phẩy</p>
      </div>

      {error && <p className="text-sm font-medium text-brand">{error}</p>}

      <div className="pt-2">
        <SubmitButton>Đăng</SubmitButton>
      </div>
    </form>
  );
}
