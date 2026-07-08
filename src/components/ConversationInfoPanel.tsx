"use client";

import { useState } from "react";
import Link from "next/link";
import { setConversationStatus, setAgreedPrice, sendMessage } from "@/lib/actions/messages";

function formatVND(n: number): string {
  return `${n.toLocaleString("vi-VN")} ₫`;
}

const GREETING_FREELANCER =
  "Chào bạn! Mình đã xem yêu cầu của bạn, rất vui được tư vấn và thực hiện dự án này 🎨";
const GREETING_CLIENT =
  "Chào bạn! Mình đang tìm dịch vụ thiết kế, rất mong được trao đổi thêm với bạn 👋";

const STAGES = [
  { code: "discussing", title: "Lời chào & trao đổi" },
  { code: "hired", title: "Thanh toán" },
  { code: "in_progress", title: "Đang thực hiện" },
  { code: "completed", title: "Đánh giá & kết thúc" },
] as const;

const STAGE_ORDER: string[] = STAGES.map((s) => s.code);

export default function ConversationInfoPanel({
  conversationId,
  otherId,
  otherName,
  status,
  agreedPrice,
  viewerIsFreelancer,
}: {
  conversationId: string;
  otherId: string;
  otherName: string;
  status: string;
  agreedPrice: number | null;
  viewerIsFreelancer: boolean;
}) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(agreedPrice != null ? String(agreedPrice) : "");
  const [currentPrice, setCurrentPrice] = useState(agreedPrice);
  const [greetingSent, setGreetingSent] = useState(false);

  const cancelled = currentStatus === "cancelled";
  const stepIndex = STAGE_ORDER.indexOf(currentStatus);

  function goToStage(code: string) {
    if (code === currentStatus) return;
    setCurrentStatus(code);
    void setConversationStatus(conversationId, code);
  }

  function handleSendGreeting() {
    setGreetingSent(true);
    void sendMessage(conversationId, viewerIsFreelancer ? GREETING_FREELANCER : GREETING_CLIENT);
  }

  function handleSavePrice(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = priceInput.trim();
    const value = trimmed ? Number(trimmed) : null;
    if (value != null && (Number.isNaN(value) || value < 0)) return;
    setCurrentPrice(value);
    setEditingPrice(false);
    void setAgreedPrice(conversationId, value);
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

      {cancelled ? (
        <div className="rounded-2xl bg-gray-200 p-3 text-center">
          <p className="text-sm font-semibold text-gray-700">Dự án đã huỷ</p>
          <button
            type="button"
            onClick={() => goToStage("discussing")}
            className="mt-1 text-xs font-semibold text-brand hover:underline"
          >
            Khôi phục
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-xs font-semibold text-gray-400">Bảng điều khiển dự án</p>
          <div className="flex flex-col">
            {STAGES.map((s, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <div key={s.code} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => goToStage(s.code)}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        done
                          ? "bg-brand text-white"
                          : active
                            ? "bg-brand text-white ring-4 ring-brand/20"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </button>
                    {i < STAGES.length - 1 && (
                      <span className={`w-0.5 flex-1 ${done ? "bg-brand" : "bg-gray-200"}`} />
                    )}
                  </div>

                  <div className={`min-w-0 flex-1 ${i < STAGES.length - 1 ? "pb-4" : ""}`}>
                    <button
                      type="button"
                      onClick={() => goToStage(s.code)}
                      className={`text-left text-sm font-semibold ${active ? "text-gray-900" : "text-gray-500"}`}
                    >
                      {s.title}
                    </button>

                    {active && (
                      <div className="mt-2 space-y-2 rounded-2xl bg-white p-3">
                        {s.code === "discussing" && (
                          <>
                            <p className="text-xs text-gray-500">
                              Gửi một lời chào nhanh để bắt đầu trao đổi.
                            </p>
                            <button
                              type="button"
                              disabled={greetingSent}
                              onClick={handleSendGreeting}
                              className="w-full rounded-full bg-brand px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                            >
                              {greetingSent ? "Đã gửi lời chào ✓" : "Gửi lời chào"}
                            </button>
                          </>
                        )}

                        {s.code === "hired" && (
                          <>
                            <p className="text-xs font-semibold text-gray-400">Giá đã thoả thuận</p>
                            {editingPrice ? (
                              <form onSubmit={handleSavePrice} className="flex items-center gap-1.5">
                                <input
                                  autoFocus
                                  type="number"
                                  min={0}
                                  step={10000}
                                  value={priceInput}
                                  onChange={(e) => setPriceInput(e.target.value)}
                                  placeholder="VD: 1500000"
                                  className="w-full min-w-0 rounded-xl border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                                />
                                <button
                                  type="submit"
                                  className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white"
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
                                className="block text-left text-sm font-semibold text-gray-900 hover:text-brand"
                              >
                                {currentPrice != null ? formatVND(currentPrice) : "Chưa đặt — bấm để nhập"}
                              </button>
                            )}
                            <p className="text-[11px] leading-snug text-gray-400">
                              Xác nhận chuyển khoản qua mã QR ngay trong đoạn chat sẽ có ở bản cập nhật tiếp theo.
                            </p>
                          </>
                        )}

                        {s.code === "in_progress" && (
                          <p className="text-xs leading-snug text-gray-500">
                            Đếm ngược thời hạn bàn giao theo thoả thuận sẽ có ở bản cập nhật tiếp theo.
                          </p>
                        )}

                        {s.code === "completed" && (
                          <p className="text-xs leading-snug text-gray-500">
                            Đánh giá và kết thúc hoặc tiếp tục dự án mới sẽ có ở bản cập nhật tiếp theo.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => goToStage("cancelled")}
            className="mt-1 text-xs font-semibold text-gray-400 hover:text-red-600"
          >
            Huỷ dự án
          </button>
        </div>
      )}
    </aside>
  );
}
