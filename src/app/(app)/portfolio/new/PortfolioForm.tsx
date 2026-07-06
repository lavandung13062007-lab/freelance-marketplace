"use client";

import { useRef, useState } from "react";
import Link from "next/link";
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

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2.5}
      stroke="currentColor"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
      />
    </svg>
  );
}

export type InitialCard = {
  existingId: string;
  url: string;
  title: string;
  description: string;
  link: string;
  price: string;
  topic: string;
  tags: string[];
};

type CardDraft = {
  key: string;
  existingId?: string;
  file?: File;
  previewUrl: string;
  title: string;
  description: string;
  link: string;
  price: string;
  topic: string;
  tags: string[];
};

function toDraft(card: InitialCard): CardDraft {
  return {
    key: card.existingId,
    existingId: card.existingId,
    previewUrl: card.url,
    title: card.title,
    description: card.description,
    link: card.link,
    price: card.price,
    topic: card.topic,
    tags: card.tags,
  };
}

export default function PortfolioForm({
  action,
  error,
  categoryNames,
  tagSuggestions,
  initialCards,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  error?: string;
  categoryNames: string[];
  tagSuggestions: string[];
  initialCards?: InitialCard[];
  submitLabel: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cards, setCards] = useState<CardDraft[]>(() => (initialCards ?? []).map(toDraft));
  const [selected, setSelected] = useState(0);

  const active: CardDraft | undefined = cards[selected];

  function syncFileInput(next: CardDraft[]) {
    const dataTransfer = new DataTransfer();
    next.forEach((c) => {
      if (c.file) dataTransfer.items.add(c.file);
    });
    if (fileInputRef.current) fileInputRef.current.files = dataTransfer.files;
  }

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []).map(
      (file): CardDraft => ({
        key: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        title: "",
        description: "",
        link: "",
        price: "",
        topic: "",
        tags: [],
      }),
    );
    if (picked.length === 0) return;
    const next = [...cards, ...picked];
    setCards(next);
    syncFileInput(next);
    setSelected(next.length - 1);
  }

  function handleRemove(index: number) {
    const next = cards.filter((_, i) => i !== index);
    setCards(next);
    syncFileInput(next);
    setSelected((s) => Math.max(0, Math.min(s, next.length - 1)));
  }

  function goTo(delta: number) {
    setSelected((s) => (s + delta + cards.length) % cards.length);
  }

  function updateActive(patch: Partial<CardDraft>) {
    setCards((prev) => prev.map((c, i) => (i === selected ? { ...c, ...patch } : c)));
  }

  const newCards = cards.filter((c) => c.file);
  const payload = cards.map((c) => ({
    key: c.key,
    existingId: c.existingId,
    newFileIndex: c.file ? newCards.indexOf(c) : undefined,
    title: c.title,
    description: c.description,
    link: c.link,
    price: c.price,
    topic: c.topic,
    tags: c.tags,
  }));

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
        <input type="hidden" name="cards" value={JSON.stringify(payload)} />
        <input
          ref={fileInputRef}
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={handlePick}
          className="hidden"
        />

        <div className="max-w-xl flex-1 lg:order-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Ảnh (mỗi ảnh là 1 thẻ riêng)
          </label>

          <div className="relative flex max-h-[520px] min-h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-gray-50">
            {active ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.previewUrl}
                alt=""
                className="max-h-[520px] w-full object-contain"
              />
            ) : (
              <span className="text-sm text-gray-400">Chưa có ảnh</span>
            )}
            {cards.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(-1)}
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-white"
                >
                  <ChevronIcon direction="left" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(1)}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-white"
                >
                  <ChevronIcon direction="right" />
                </button>
              </>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {cards.map((c, i) => (
              <div
                key={c.key}
                onClick={() => setSelected(i)}
                className={`relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl ${
                  i === selected ? "ring-2 ring-brand ring-offset-2" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.previewUrl} alt="" className="h-full w-full object-cover" />
                {!c.title.trim() && (
                  <span
                    title="Thẻ này chưa có tiêu đề"
                    className="absolute left-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-brand"
                  />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(i);
                  }}
                  className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-[10px] leading-none text-white"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-brand hover:text-brand"
            >
              <span className="text-lg leading-none">+</span>
            </button>
          </div>
        </div>

        <div className="w-full max-w-md shrink-0 space-y-4 lg:order-1">
          {cards.length > 1 && (
            <p className="text-sm font-semibold text-gray-500">
              Thẻ {selected + 1}/{cards.length}
            </p>
          )}

          {active ? (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tiêu đề</label>
                <input
                  type="text"
                  required
                  value={active.title}
                  onChange={(e) => updateActive({ title: e.target.value })}
                  placeholder="VD: Bộ nhận diện thương hiệu cà phê"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  rows={3}
                  value={active.description}
                  onChange={(e) => updateActive({ description: e.target.value })}
                  placeholder="Vài dòng giới thiệu về thiết kế này"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Liên kết</label>
                <input
                  type="url"
                  value={active.link}
                  onChange={(e) => updateActive({ link: e.target.value })}
                  placeholder="Không bắt buộc"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Chủ đề</label>
                <TopicSelect
                  key={active.key}
                  categories={categoryNames}
                  value={active.topic}
                  onChange={(topic) => updateActive({ topic })}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Chọn 1 chủ đề để xem mức giá thị trường phù hợp
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Gắn thẻ</label>
                <TagInput
                  key={active.key}
                  suggestions={tagSuggestions}
                  tags={active.tags}
                  onChange={(tags) => updateActive({ tags })}
                  maxTags={20}
                />
                <p className="mt-1 text-xs text-gray-400">Giúp khách lọc tìm kiếm dễ hơn</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Giá (VNĐ)</label>
                <PriceGuide
                  key={active.key}
                  topic={active.topic}
                  excludeImageId={active.existingId}
                  initialValue={active.price}
                  onChange={(price) => updateActive({ price: String(price) })}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">
              Thêm ít nhất 1 ảnh để bắt đầu nhập thông tin cho thẻ đầu tiên.
            </p>
          )}

          {error && <p className="text-sm font-medium text-brand">{error}</p>}

          <SubmitButton>{submitLabel}</SubmitButton>
        </div>
      </form>
    </div>
  );
}
