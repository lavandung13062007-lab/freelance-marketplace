"use client";

import PortfolioImageManager, { type ExistingImage } from "@/components/PortfolioImageManager";
import TagInput from "@/components/TagInput";
import SubmitButton from "@/components/SubmitButton";

export type PortfolioFormValues = {
  title: string;
  description: string;
  link: string;
  price: string;
  collection: string;
  tags: string[];
};

export default function PortfolioForm({
  action,
  error,
  collectionNames,
  tagSuggestions,
  initialValues,
  existingImages,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  error?: string;
  collectionNames: string[];
  tagSuggestions: string[];
  initialValues?: PortfolioFormValues;
  existingImages?: ExistingImage[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-8 lg:flex-row">
      <div className="w-full max-w-md shrink-0 space-y-4">
        <input
          name="title"
          type="text"
          required
          defaultValue={initialValues?.title}
          placeholder="VD: Bộ nhận diện thương hiệu cà phê"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
        />

        <textarea
          name="description"
          rows={3}
          defaultValue={initialValues?.description}
          placeholder="Vài dòng giới thiệu về dự án này"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
        />

        <input
          name="link"
          type="url"
          defaultValue={initialValues?.link}
          placeholder="Liên kết (không bắt buộc)"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
        />

        <input
          name="price"
          type="number"
          min={0}
          step={1000}
          defaultValue={initialValues?.price}
          placeholder="Giá (VNĐ, không bắt buộc)"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
        />

        <div>
          <input
            name="collection"
            type="text"
            list="collection-list"
            defaultValue={initialValues?.collection}
            placeholder="Thêm vào bộ (không bắt buộc)"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
          />
          <datalist id="collection-list">
            {collectionNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>

        <TagInput suggestions={tagSuggestions} initialTags={initialValues?.tags ?? []} />

        {error && <p className="text-sm font-medium text-brand">{error}</p>}

        <SubmitButton>{submitLabel}</SubmitButton>
      </div>

      <div className="max-w-xl flex-1">
        <PortfolioImageManager initialImages={existingImages ?? []} />
      </div>
    </form>
  );
}
