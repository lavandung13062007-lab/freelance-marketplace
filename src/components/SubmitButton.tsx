"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? "Đang xử lý…" : children}
    </button>
  );
}
