"use client";

import { useState } from "react";
import { setDepositPercent } from "@/lib/actions/deals";

/**
 * Hiện khi freelancer lần đầu gửi yêu cầu cho khách mà chưa cấu hình % đặt cọc.
 * Lưu vào hồ sơ rồi gọi lại onSaved (thường là thử gửi yêu cầu lại lần nữa).
 */
export default function DepositPercentModal({
  onSaved,
  onClose,
}: {
  onSaved: (percent: number) => void;
  onClose: () => void;
}) {
  const [percent, setPercent] = useState("30");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const value = Number(percent);
    if (!(value > 0 && value <= 100)) return;
    setSaving(true);
    await setDepositPercent(value);
    setSaving(false);
    onSaved(value);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <p className="text-lg font-extrabold text-gray-900">Đặt % cọc trước</p>
        <p className="mt-1 text-sm text-gray-500">
          Đây là lần đầu bạn gửi yêu cầu cho khách. Hãy chọn tỷ lệ khách cần đặt cọc trước khi bạn
          bắt đầu thực hiện — áp dụng cho mọi đơn hàng sau này (chỉnh lại được trong hồ sơ).
        </p>

        <div className="mt-4 flex items-center gap-2">
          <input
            autoFocus
            type="number"
            min={1}
            max={100}
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <span className="text-sm font-semibold text-gray-500">%</span>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Để sau
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Đang lưu…" : "Lưu & gửi yêu cầu"}
          </button>
        </div>
      </div>
    </div>
  );
}
