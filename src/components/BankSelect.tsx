"use client";

import { useEffect, useRef, useState } from "react";
import { VIETNAM_BANKS, type Bank } from "@/lib/vietnamBanks";

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-gray-400">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m20 20-3-3" />
    </svg>
  );
}

export default function BankSelect({ defaultCode }: { defaultCode: string | null }) {
  const initial = VIETNAM_BANKS.find((b) => b.code === defaultCode) ?? null;
  const [query, setQuery] = useState(initial?.name ?? "");
  const [selected, setSelected] = useState<Bank | null>(initial);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(selected?.name ?? "");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [selected]);

  const q = normalize(query.trim());
  const results = q ? VIETNAM_BANKS.filter((b) => normalize(b.name).includes(q)) : VIETNAM_BANKS;

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name="bank_code" value={selected?.code ?? ""} />
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
        <SearchIcon />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Chọn ngân hàng"
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1 shadow-lg">
          {results.length > 0 ? (
            results.map((b) => (
              <button
                key={b.code}
                type="button"
                onClick={() => {
                  setSelected(b);
                  setQuery(b.name);
                  setOpen(false);
                }}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                  selected?.code === b.code ? "font-semibold text-brand" : "text-gray-700"
                }`}
              >
                {b.name}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-gray-400">Không tìm thấy ngân hàng</p>
          )}
        </div>
      )}
    </div>
  );
}
