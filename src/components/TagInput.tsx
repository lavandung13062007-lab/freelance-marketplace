"use client";

import { useState } from "react";

export default function TagInput({
  suggestions,
  initialTags = [],
}: {
  suggestions: string[];
  initialTags?: string[];
}) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const query = input.trim().toLowerCase();
  const filtered = query
    ? suggestions.filter((s) => s.toLowerCase().includes(query) && !tags.includes(s)).slice(0, 6)
    : [];

  function commitTag(raw: string) {
    const name = raw.trim().toLowerCase();
    if (!name) return;
    setTags((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setInput("");
    setShowSuggestions(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitTag(input);
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function removeTag(name: string) {
    setTags((prev) => prev.filter((t) => t !== name));
  }

  return (
    <div>
      <input type="hidden" name="tags" value={tags.join(",")} />

      <div className="relative">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Gõ tên thẻ, nhấn Enter để thêm"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
        />
        {showSuggestions && filtered.length > 0 && (
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
