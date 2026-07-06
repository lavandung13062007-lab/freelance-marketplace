"use client";

import { useState } from "react";

export default function TopicSelect({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [input, setInput] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const query = input.trim().toLowerCase();
  const filtered = query
    ? categories.filter((c) => c.toLowerCase().startsWith(query)).slice(0, 8)
    : [];

  function select(v: string) {
    onChange(v);
    setInput(v);
    setShowSuggestions(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) select(filtered[0]);
    }
  }

  return (
    <div className="relative">
      <input type="hidden" name="topic" value={value} />
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setShowSuggestions(true);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() =>
          setTimeout(() => {
            setShowSuggestions(false);
            setInput(value);
          }, 150)
        }
        placeholder="Chọn 1 chủ đề để xem giá thị trường"
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
      />
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
          {filtered.map((c) => (
            <button
              key={c}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(c)}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
