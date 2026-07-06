"use client";

import { useState } from "react";

export default function TagInput({
  suggestions,
  tags,
  onChange,
  maxTags = 20,
}: {
  suggestions: string[];
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const atLimit = tags.length >= maxTags;

  const query = input.trim().toLowerCase();
  const filtered = query
    ? suggestions.filter((s) => s.toLowerCase().startsWith(query) && !tags.includes(s)).slice(0, 8)
    : [];

  function commitTag(raw: string) {
    if (atLimit) return;
    const name = raw.trim().toLowerCase();
    if (!name) return;
    if (!tags.includes(name)) onChange([...tags, name]);
    setInput("");
    setShowSuggestions(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitTag(input);
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(name: string) {
    onChange(tags.filter((t) => t !== name));
  }

  return (
    <div>
      <div className="relative">
        <input
          value={input}
          disabled={atLimit}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={atLimit ? "" : "VD: tối giản, cho quán cafe, pastel"}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 disabled:text-gray-400"
        />
        {showSuggestions && !atLimit && filtered.length > 0 && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
            {filtered.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commitTag(s)}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-1 text-xs text-gray-400">
        {atLimit ? "Đã đạt tối đa 20 thẻ" : `${tags.length}/${maxTags} thẻ`}
      </p>

      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
            >
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
