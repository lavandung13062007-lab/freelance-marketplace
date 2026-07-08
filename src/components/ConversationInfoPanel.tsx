"use client";

import { useState } from "react";
import Link from "next/link";
import { setConversationStatus, setAgreedPrice } from "@/lib/actions/messages";

function formatVND(n: number): string {
  return `${n.toLocaleString("vi-VN")} ₫`;
}

const STATUSES = [
  { code: "discussing", label: "Đang trao đổi" },
  { code: "hired", label: "Đã thuê" },
  { code: "completed", label: "Hoàn thành" },
  { code: "cancelled", label: "Đã huỷ" },
] as const;

const STEP_ORDER = ["discussing", "hired", "completed"];

export default function ConversationInfoPanel({
  conversationId,
  otherId,
  otherName,
  status,
  agreedPrice,
}: {
  conversationId: string;
  otherId: string;
  otherName: string;
  status: string;
  agreedPrice: number | null;
}) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [statusPending, setStatusPending] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(agreedPrice != null ? String(agreedPrice) : "");
  const [currentPrice, setCurrentPrice] = useState(agreedPrice);
  const [pricePending, setPricePending] = useState(false);

  const cancelled = currentStatus === "cancelled";
  const stepIndex = STEP_ORDER.indexOf(currentStatus);

  async function handleStatusClick(code: string) {
    if (code === currentStatus || statusPending) return;
    setStatusPending(true);
    setCurrentStatus(code);
    await setConversationStatus(conversationId, code);
    setStatusPending(false);
  }

  async function handleSavePrice(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = priceInput.trim();
    const value = trimmed ? Number(trimmed) : null;
    if (value != null && (Number.isNaN(value) || value < 0)) return;
    setPricePending(true);
    await setAgreedPrice(conversationId, value);
    setCurrentPrice(value);
    setPricePending(false);
    setEditingPrice(false);
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-5 overflow-y-auto rounded-3xl bg-gray-50 p-5">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow text-2xl font-bold text-gray-900">
          {otherName.charAt(0).toUpperCase() || "?"}
        </span>
        <p className="mt-2 font-bold text-gray-900">{otherName}</p>
        <Link href={`/freelancer/${otherId}`} className="mt-0.5 text-xs font-semibold text-brand hover:underline">
          Xem hồ sơ
        </Link>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400">Tiến độ</p>
        <div className="mt-2 flex gap-1">
          {STEP_ORDER.map((code, i) => (
            <span
              key={code}
              className={`h-1.5 flex-1 rounded-full ${
                cancelled ? "bg-gray-200" : i <= stepIndex ? "bg-brand" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s.code}
              type="button"
              disabled={statusPending}
              onClick={() => handleStatusClick(s.code)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                currentStatus === s.code
                  ? s.code === "cancelled"
                    ? "bg-gray-700 text-white"
                    : "bg-brand text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              } disabled:opacity-60`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400">Giá đã thoả thuận</p>
        {editingPrice ? (
          <form onSubmit={handleSavePrice} className="mt-1.5 flex items-center gap-1.5">
            <input
              autoFocus
              type="number"
              min={0}
              step={10000}
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              placeholder="VD: 1500000"
              className="w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <button
              type="submit"
              disabled={pricePending}
              className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              Lưu
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setPriceInput(currentPrice != null ? String(currentPrice) : "");
              setEditingPrice(true);
            }}
            className="mt-1.5 block text-left text-sm font-semibold text-gray-900 hover:text-brand"
          >
            {currentPrice != null ? formatVND(currentPrice) : "Chưa đặt — bấm để nhập"}
          </button>
        )}
        <p className="mt-1.5 text-[11px] leading-snug text-gray-400">
          Chỉ là ghi chú giữa hai bên, ứng dụng chưa hỗ trợ thanh toán trực tuyến.
        </p>
      </div>
    </aside>
  );
}
