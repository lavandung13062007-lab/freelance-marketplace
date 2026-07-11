"use client";

import { useState } from "react";
import Link from "next/link";
import {
  setConversationStatus,
  setAgreedPrice,
  sendMessage,
} from "@/lib/actions/messages";
import { setDealDesign, setProposedPrice, sendPriceOffer } from "@/lib/actions/deals";
import DepositPercentModal from "@/components/DepositPercentModal";
import { buildVietQrUrl } from "@/lib/vietqr";
import { VIETNAM_BANKS } from "@/lib/vietnamBanks";

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

type DesignOption = { id: string; title: string; cover: string; price: number | null };

function DesignPickerModal({
  options,
  onPick,
  onClose,
}: {
  options: DesignOption[];
  onPick: (option: DesignOption) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <p className="font-bold text-gray-900">Chọn thiết kế</p>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        <div className="grid max-h-[65vh] grid-cols-3 gap-2 overflow-y-auto p-4">
          {options.length === 0 && (
            <p className="col-span-3 py-8 text-center text-sm text-gray-400">
              Freelancer chưa có thiết kế nào đã duyệt.
            </p>
          )}
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onPick(opt)}
              className="group text-left"
            >
              <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={opt.cover} alt={opt.title} className="h-full w-full object-cover" />
              </div>
              <p className="mt-1 truncate text-[11px] font-medium text-gray-600 group-hover:text-brand">
                {opt.title}
              </p>
              {opt.price != null && (
                <p className="text-[11px] font-semibold text-gray-900">{formatVND(opt.price)}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ConversationInfoPanel({
  conversationId,
  otherId,
  otherName,
  status,
  agreedPrice,
  viewerIsFreelancer,
  freelancerPortfolio,
  dealImage,
  proposedPrice,
  freelancerDepositPercent,
  dealDepositPercent,
  bank,
}: {
  conversationId: string;
  otherId: string;
  otherName: string;
  status: string;
  agreedPrice: number | null;
  viewerIsFreelancer: boolean;
  freelancerPortfolio: DesignOption[];
  dealImage: DesignOption | null;
  proposedPrice: number | null;
  freelancerDepositPercent: number | null;
  dealDepositPercent: number | null;
  bank: { code: string | null; accountNumber: string | null; accountHolder: string | null };
}) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(agreedPrice != null ? String(agreedPrice) : "");
  const [currentPrice, setCurrentPrice] = useState(agreedPrice);
  const [greetingSent, setGreetingSent] = useState(false);

  const [currentDealImage, setCurrentDealImage] = useState(dealImage);
  const [currentProposedPrice, setCurrentProposedPrice] = useState(proposedPrice);
  const [editingProposed, setEditingProposed] = useState(false);
  const [proposedInput, setProposedInput] = useState(proposedPrice != null ? String(proposedPrice) : "");
  const [showPicker, setShowPicker] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [sendingOffer, setSendingOffer] = useState(false);
  const [offerSent, setOfferSent] = useState(false);

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

  function handlePickDesign(option: DesignOption) {
    setCurrentDealImage(option);
    setCurrentProposedPrice(option.price);
    setShowPicker(false);
    void setDealDesign(conversationId, option.id);
  }

  function handleSaveProposed(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = proposedInput.trim();
    const value = trimmed ? Number(trimmed) : null;
    if (value == null || Number.isNaN(value) || value < 0) return;
    setCurrentProposedPrice(value);
    setEditingProposed(false);
    void setProposedPrice(conversationId, value);
  }

  async function handleSendOffer() {
    if (sendingOffer || !currentDealImage || currentProposedPrice == null) return;
    setSendingOffer(true);
    const result = await sendPriceOffer(conversationId);
    setSendingOffer(false);
    if (!result.ok && result.error === "needs_deposit_percent") {
      setShowDepositModal(true);
      return;
    }
    if (result.ok) {
      setOfferSent(true);
      setTimeout(() => setOfferSent(false), 4000);
    }
  }

  async function handleDepositSaved() {
    setShowDepositModal(false);
    await handleSendOffer();
  }

  const depositPercentForEstimate = dealDepositPercent ?? freelancerDepositPercent;
  const depositAmount =
    currentPrice != null && depositPercentForEstimate != null
      ? Math.round((currentPrice * depositPercentForEstimate) / 100)
      : null;

  const bankLabel = VIETNAM_BANKS.find((b) => b.code === bank.code)?.name ?? bank.code;
  const qrUrl =
    depositAmount != null
      ? buildVietQrUrl({
          bankCode: bank.code,
          accountNumber: bank.accountNumber,
          accountHolder: bank.accountHolder,
          amount: depositAmount,
          note: `Coc thiet ke ${currentDealImage?.title ?? ""}`.slice(0, 50),
        })
      : null;

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-5 overflow-y-auto rounded-3xl bg-gray-50 p-5">
      {showPicker && (
        <DesignPickerModal
          options={freelancerPortfolio}
          onPick={handlePickDesign}
          onClose={() => setShowPicker(false)}
        />
      )}
      {showDepositModal && (
        <DepositPercentModal
          onSaved={handleDepositSaved}
          onClose={() => setShowDepositModal(false)}
        />
      )}

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
                            {!greetingSent && (
                              <button
                                type="button"
                                onClick={handleSendGreeting}
                                className="w-full rounded-full bg-brand px-3 py-2 text-xs font-semibold text-white"
                              >
                                Gửi lời chào
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setShowPicker(true)}
                              className="block w-full overflow-hidden rounded-xl border border-gray-100 text-left hover:border-brand/40"
                            >
                              {currentDealImage ? (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={currentDealImage.cover}
                                    alt={currentDealImage.title}
                                    className="h-28 w-full object-cover"
                                  />
                                  <div className="p-2">
                                    <p className="truncate text-xs font-semibold text-gray-900">
                                      {currentDealImage.title}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {currentProposedPrice != null
                                        ? formatVND(currentProposedPrice)
                                        : "Chưa có giá"}
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <div className="flex h-20 items-center justify-center text-xs text-gray-400">
                                  Bấm để chọn thiết kế
                                </div>
                              )}
                            </button>

                            {viewerIsFreelancer && (
                              <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-gray-400">Giá đề nghị</p>
                                {editingProposed ? (
                                  <form onSubmit={handleSaveProposed} className="flex items-center gap-1.5">
                                    <input
                                      autoFocus
                                      type="number"
                                      min={0}
                                      step={10000}
                                      value={proposedInput}
                                      onChange={(e) => setProposedInput(e.target.value)}
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
                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setProposedInput(
                                          currentProposedPrice != null ? String(currentProposedPrice) : "",
                                        );
                                        setEditingProposed(true);
                                      }}
                                      className="flex-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                      Đặt giá
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleSendOffer}
                                      disabled={
                                        sendingOffer || !currentDealImage || currentProposedPrice == null
                                      }
                                      className="flex-1 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                                    >
                                      {sendingOffer ? "Đang gửi…" : offerSent ? "Đã gửi ✓" : "Gửi yêu cầu"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
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

                            <div className="mt-2 rounded-xl bg-gray-50 p-3 text-center">
                              {depositAmount == null ? (
                                <p className="text-xs text-gray-500">Chưa có giá để tính tiền cọc.</p>
                              ) : qrUrl ? (
                                <>
                                  <p className="text-xs font-semibold text-gray-500">
                                    Đặt cọc {depositPercentForEstimate}% — {formatVND(depositAmount)}
                                  </p>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={qrUrl}
                                    alt="Mã QR chuyển khoản"
                                    className="mx-auto mt-2 h-40 w-40 rounded-xl border border-gray-200"
                                  />
                                  {bankLabel && bank.accountNumber && (
                                    <p className="mt-2 text-[11px] leading-snug text-gray-500">
                                      {bankLabel} · {bank.accountNumber}
                                      {bank.accountHolder ? ` · ${bank.accountHolder}` : ""}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <p className="text-xs leading-snug text-gray-500">
                                  {viewerIsFreelancer
                                    ? "Vào hồ sơ để cấu hình thông tin nhận thanh toán, mã QR sẽ hiện ở đây."
                                    : "Freelancer chưa cấu hình thông tin nhận thanh toán."}
                                </p>
                              )}
                            </div>
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
