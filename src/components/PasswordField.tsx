"use client";

import { useState } from "react";

export default function PasswordField({
  id,
  name,
  placeholder,
  minLength,
}: {
  id: string;
  name: string;
  placeholder?: string;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required
        minLength={minLength}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-14 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-gray-600"
      >
        {visible ? "Ẩn" : "Hiện"}
      </button>
    </div>
  );
}
