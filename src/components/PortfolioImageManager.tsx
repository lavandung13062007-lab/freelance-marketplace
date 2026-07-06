"use client";

import { useRef, useState } from "react";

export type ExistingImage = { id: string; url: string };

type Item =
  | { kind: "existing"; id: string; url: string }
  | { kind: "new"; file: File; previewUrl: string };

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

export default function PortfolioImageManager({
  initialImages = [],
}: {
  initialImages?: ExistingImage[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>(
    initialImages.map((img) => ({ kind: "existing", id: img.id, url: img.url })),
  );
  const [selected, setSelected] = useState(0);

  function syncFileInput(next: Item[]) {
    const dataTransfer = new DataTransfer();
    next.forEach((it) => {
      if (it.kind === "new") dataTransfer.items.add(it.file);
    });
    if (fileInputRef.current) fileInputRef.current.files = dataTransfer.files;
  }

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []).map(
      (file): Item => ({ kind: "new", file, previewUrl: URL.createObjectURL(file) }),
    );
    if (picked.length === 0) return;
    const next = [...items, ...picked];
    setItems(next);
    syncFileInput(next);
    setSelected(next.length - 1);
  }

  function handleRemove(index: number) {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    syncFileInput(next);
    setSelected((s) => Math.max(0, Math.min(s, next.length - 1)));
  }

  function goTo(delta: number) {
    setSelected((s) => (s + delta + items.length) % items.length);
  }

  const active = items[selected];
  const keepImageIds = items
    .filter((it): it is Item & { kind: "existing" } => it.kind === "existing")
    .map((it) => it.id);

  return (
    <div>
      <input type="hidden" name="keepImageIds" value={keepImageIds.join(",")} />
      <input
        ref={fileInputRef}
        type="file"
        name="images"
        accept="image/*"
        multiple
        onChange={handlePick}
        className="hidden"
      />

      <div className="relative flex max-h-[520px] min-h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-gray-50">
        {active ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={active.kind === "existing" ? active.url : active.previewUrl}
            alt=""
            className="max-h-[520px] w-full object-contain"
          />
        ) : (
          <span className="text-sm text-gray-400">Chưa có ảnh</span>
        )}
        {items.length > 1 && (
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
        {items.map((it, i) => (
          <div
            key={it.kind === "existing" ? it.id : it.previewUrl}
            onClick={() => setSelected(i)}
            className={`relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl ${
              i === selected ? "ring-2 ring-brand ring-offset-2" : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.kind === "existing" ? it.url : it.previewUrl}
              alt=""
              className="h-full w-full object-cover"
            />
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
  );
}
