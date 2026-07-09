"use client";

import { useState } from "react";

function BellIcon({ filled }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
        <path d="M9.5 18.5a2.5 2.5 0 0 0 5 0h-5Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
      <path strokeLinecap="round" d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Thông báo"
        title="Thông báo"
        className={`flex h-10 w-full items-center rounded-xl ${
          open ? "bg-brand/10 text-brand" : "text-gray-500 hover:bg-gray-50"
        }`}
      >
        <span className="flex w-10 shrink-0 items-center justify-center">
          <BellIcon filled={open} />
        </span>
        <span className="pointer-events-none ml-1 whitespace-nowrap text-sm font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          Thông báo
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-full z-20 ml-2 w-64 rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-lg">
            <p className="text-sm font-semibold text-gray-900">Chưa có thông báo</p>
            <p className="mt-1 text-xs text-gray-500">Thông báo mới sẽ xuất hiện ở đây</p>
          </div>
        </>
      )}
    </div>
  );
}
