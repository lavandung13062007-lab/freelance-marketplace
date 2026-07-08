"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markConversationRead } from "@/lib/actions/messages";
import { formatDivider } from "@/lib/timeAgo";
import ConversationMenu from "@/components/ConversationMenu";

type Message = { id: string; sender_id: string; content: string; created_at: string };

const GROUP_GAP_MS = 3 * 60 * 1000;
const DIVIDER_GAP_MS = 15 * 60 * 1000;

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function needsDivider(prev: Message | undefined, curr: Message): boolean {
  if (!prev) return true;
  if (!isSameDay(prev.created_at, curr.created_at)) return true;
  return new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime() > DIVIDER_GAP_MS;
}

function sameGroup(prev: Message | undefined, curr: Message | undefined): boolean {
  if (!prev || !curr) return false;
  if (prev.sender_id !== curr.sender_id) return false;
  return new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime() < GROUP_GAP_MS;
}

function cornerClass(mine: boolean, groupedWithPrev: boolean, groupedWithNext: boolean): string {
  if (mine) {
    if (groupedWithPrev && groupedWithNext) return "rounded-2xl rounded-tr-md rounded-br-md";
    if (groupedWithPrev) return "rounded-2xl rounded-tr-md";
    if (groupedWithNext) return "rounded-2xl rounded-br-md";
    return "rounded-2xl";
  }
  if (groupedWithPrev && groupedWithNext) return "rounded-2xl rounded-tl-md rounded-bl-md";
  if (groupedWithPrev) return "rounded-2xl rounded-tl-md";
  if (groupedWithNext) return "rounded-2xl rounded-bl-md";
  return "rounded-2xl";
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 translate-x-[1px]">
      <path d="M3 11.5 21 3l-6 18-4-7-8-2.5Z" />
    </svg>
  );
}

export default function ChatThread({
  conversationId,
  currentUserId,
  otherName,
  realName,
  nickname,
  pinned,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  otherName: string;
  realName: string;
  nickname: string | null;
  pinned: boolean;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    markConversationRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
          if (incoming.sender_id !== currentUserId) {
            markConversationRead(conversationId);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    const el = scrollRef.current;
    const nearBottom = !el || el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    const lastMine = messages[messages.length - 1]?.sender_id === currentUserId;
    if (nearBottom || lastMine) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentUserId]);

  async function submitMessage() {
    const content = input.trim();
    if (!content || sending) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setSending(true);
    const sent = await sendMessage(conversationId, content);
    if (sent) {
      setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
    }
    setSending(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitMessage();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col rounded-3xl bg-gray-50">
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-yellow text-base font-bold text-gray-900">
          {otherName.charAt(0).toUpperCase() || "?"}
        </span>
        <p className="flex-1 font-bold text-gray-900">{otherName}</p>
        <ConversationMenu
          conversationId={conversationId}
          pinned={pinned}
          nickname={nickname}
          realName={realName}
        />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow text-2xl font-bold text-gray-900">
              {otherName.charAt(0).toUpperCase() || "?"}
            </span>
            <p className="mt-3 font-bold text-gray-900">{otherName}</p>
            <p className="mt-1 text-sm text-gray-500">Hãy bắt đầu cuộc trò chuyện</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const prev = messages[i - 1];
            const next = messages[i + 1];
            const mine = m.sender_id === currentUserId;
            const groupedWithPrev = sameGroup(prev, m);
            const groupedWithNext = sameGroup(m, next);
            const divider = needsDivider(prev, m);
            const gapClass = divider ? "mt-1" : groupedWithPrev ? "mt-0.5" : "mt-2.5";

            return (
              <div key={m.id}>
                {divider && (
                  <p className="my-3 text-center text-[11px] font-medium text-gray-400">
                    {formatDivider(m.created_at)}
                  </p>
                )}
                <div className={`flex ${mine ? "justify-end" : "justify-start"} ${gapClass}`}>
                  <div
                    className={`max-w-md px-4 py-2 text-sm ${
                      mine ? "bg-brand text-white" : "border border-gray-100 bg-white text-gray-900"
                    } ${cornerClass(mine, groupedWithPrev, groupedWithNext)}`}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-gray-100 p-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Nhắn tin..."
          rows={1}
          className="max-h-[120px] flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-60 ${
            input.trim() ? "bg-brand text-white" : "bg-gray-200 text-gray-400"
          }`}
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
