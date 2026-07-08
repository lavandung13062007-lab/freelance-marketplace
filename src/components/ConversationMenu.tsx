"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { setConversationPinned, hideConversation, setNickname, reportConversation } from "@/lib/actions/messages";

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <circle cx="12" cy="5" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="19" r="1.75" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4h6l-.5 6 3 3v2H6.5v-2l3-3L9 4Z" />
      <path strokeLinecap="round" d="M12 15v5" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h7l9 9-7 7-9-9V4Z" />
      <circle cx="8.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h11l-2.5 3.5L17 11H6Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"
      />
    </svg>
  );
}

const REPORT_REASONS: { code: string; label: string }[] = [
  { code: "spam", label: "Tin rác" },
  { code: "harassment", label: "Quấy rối" },
  { code: "scam", label: "Lừa đảo" },
  { code: "other", label: "Khác" },
];

type View = "menu" | "nickname" | "report" | "reported" | "delete";

export default function ConversationMenu({
  conversationId,
  pinned,
  nickname,
  realName,
  triggerClassName = "",
}: {
  conversationId: string;
  pinned: boolean;
  nickname: string | null;
  realName: string;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const [nicknameInput, setNicknameInput] = useState(nickname ?? "");

  function close() {
    setOpen(false);
    setView("menu");
  }

  function stop(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function toggleOpen(e: React.MouseEvent) {
    stop(e);
    setNicknameInput(nickname ?? "");
    setView("menu");
    setOpen((v) => !v);
  }

  // Đóng menu / xác nhận ngay lập tức thay vì chờ máy chủ phản hồi rồi mới cập nhật
  // giao diện — server action vẫn chạy nền, danh sách sẽ tự làm mới sau khi xong.
  function handlePin(e: React.MouseEvent) {
    stop(e);
    close();
    void setConversationPinned(conversationId, !pinned);
  }

  function handleSaveNickname(e: React.FormEvent) {
    stop(e);
    close();
    void setNickname(conversationId, nicknameInput);
  }

  function handleReport(code: string) {
    setView("reported");
    void reportConversation(conversationId, code);
  }

  function handleDelete(e: React.MouseEvent) {
    stop(e);
    close();
    if (pathname === `/messages/${conversationId}`) {
      router.push("/messages");
    }
    void hideConversation(conversationId);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="Tùy chọn hội thoại"
        className={`flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-opacity hover:bg-gray-100 hover:text-gray-600 ${
          open ? "opacity-100" : triggerClassName
        }`}
      >
        <DotsIcon />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={(e) => { stop(e); close(); }} />
          <div
            className="absolute right-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 text-left shadow-lg"
            onClick={stop}
          >
            {view === "menu" && (
              <>
                <button
                  type="button"
                  onClick={handlePin}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <PinIcon />
                  {pinned ? "Bỏ ghim" : "Ghim hội thoại"}
                </button>
                <button
                  type="button"
                  onClick={(e) => { stop(e); setView("nickname"); }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <TagIcon />
                  Đặt biệt danh
                </button>
                <button
                  type="button"
                  onClick={(e) => { stop(e); setView("report"); }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FlagIcon />
                  Báo xấu
                </button>
                <button
                  type="button"
                  onClick={(e) => { stop(e); setView("delete"); }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <TrashIcon />
                  Xóa hội thoại
                </button>
              </>
            )}

            {view === "nickname" && (
              <form onSubmit={handleSaveNickname} className="p-1.5">
                <p className="mb-2 px-1.5 text-xs font-semibold text-gray-400">Biệt danh cho {realName}</p>
                <input
                  autoFocus
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  placeholder={realName}
                  maxLength={40}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={(e) => { stop(e); setView("menu"); }}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Lưu
                  </button>
                </div>
              </form>
            )}

            {view === "report" && (
              <div className="p-1.5">
                <p className="mb-1 px-1.5 text-xs font-semibold text-gray-400">Báo cáo vì</p>
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r.code}
                    type="button"
                    onClick={(e) => { stop(e); handleReport(r.code); }}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}

            {view === "reported" && (
              <p className="p-4 text-center text-sm text-gray-500">Đã gửi báo cáo, cảm ơn bạn.</p>
            )}

            {view === "delete" && (
              <div className="p-3">
                <p className="text-sm text-gray-700">
                  Xóa cuộc trò chuyện này? Bạn sẽ không thấy nó trong danh sách nữa.
                </p>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={(e) => { stop(e); setView("menu"); }}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
