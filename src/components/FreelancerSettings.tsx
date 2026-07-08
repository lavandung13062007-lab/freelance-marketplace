"use client";

import { useState } from "react";
import { setFreelancerMode, updateBankInfo } from "@/lib/actions/account";

export default function FreelancerSettings({
  initialEnabled,
  bankName,
  bankAccountNumber,
  bankAccountHolder,
}: {
  initialEnabled: boolean;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);

  function handleToggle(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.checked;
    setEnabled(next);
    const formData = new FormData();
    formData.append("freelancer", next ? "on" : "off");
    void setFreelancerMode(formData);
  }

  function handleSaveBank(formData: FormData) {
    void updateBankInfo(formData);
  }

  return (
    <div className="mt-8">
      <label className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3">
        <span>
          <span className="block text-sm font-semibold text-gray-900">Tôi là freelancer</span>
          <span className="block text-xs text-gray-500">Bật để nhập thông tin nhận thanh toán</span>
        </span>
        <input type="checkbox" checked={enabled} onChange={handleToggle} className="h-5 w-5 accent-brand" />
      </label>

      {enabled && (
        <form action={handleSaveBank} className="mt-4 space-y-2 rounded-2xl border border-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-900">Thông tin nhận thanh toán</p>
          <input
            name="bank_name"
            defaultValue={bankName ?? ""}
            placeholder="Tên ngân hàng (VD: Vietcombank)"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <input
            name="bank_account_number"
            inputMode="numeric"
            defaultValue={bankAccountNumber ?? ""}
            placeholder="Số tài khoản"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <input
            name="bank_account_holder"
            defaultValue={bankAccountHolder ?? ""}
            placeholder="Tên chủ tài khoản"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <p className="text-[11px] text-gray-400">
            Dùng để tạo mã QR nhận thanh toán ngay trong đoạn chat với khách (sắp có).
          </p>
          <button type="submit" className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white">
            Lưu
          </button>
        </form>
      )}
    </div>
  );
}
