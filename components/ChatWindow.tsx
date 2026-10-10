"use client";

import { ArrowLeft, SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { StatusTicks } from "@/components/StatusTicks";
import { formatTime } from "@/lib/format";
import { sendMessage } from "@/lib/greenApi";
import { useAuth } from "@/store/useAuth";
import { useChats } from "@/store/useChats";

const EMPTY: never[] = [];

const pattern =
  "bg-max-bg bg-[radial-gradient(circle_at_1px_1px,rgba(110,110,255,0.14)_1px,transparent_0)] bg-[length:28px_28px]";

export function ChatWindow() {
  const credentials = useAuth((s) => s.credentials)!;
  const chatId = useChats((s) => s.activeChatId);
  const chat = useChats((s) => (chatId ? s.chats[chatId] : undefined));
  const messages = useChats((s) => (chatId ? (s.messages[chatId] ?? EMPTY) : EMPTY));
  const addMessage = useChats((s) => s.addMessage);
  const patchMessage = useChats((s) => s.patchMessage);
  const selectChat = useChats((s) => s.selectChat);

  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, chatId]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [draft, chatId]);

  if (!chatId || !chat) {
    return (
      <section
        className={`${chatId ? "flex" : "hidden md:flex"} min-w-0 flex-1 items-center justify-center ${pattern}`}
      >
        <span className="rounded-full bg-black/40 px-4 py-2 text-sm text-max-muted">
          Выберите чат или создайте новый
        </span>
      </section>
    );
  }

  async function send() {
    const text = draft.trim();
    if (!text || !chatId) return;

    const localId = `local-${crypto.randomUUID()}`;
    addMessage({
      id: localId,
      chatId,
      text,
      direction: "out",
      status: "sending",
      timestamp: Date.now(),
    });
    setDraft("");

    try {
      const { idMessage } = await sendMessage(credentials, chatId, text);
      patchMessage(chatId, localId, { id: idMessage, status: "sent" });
    } catch {
      patchMessage(chatId, localId, { status: "failed" });
    }
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-max-line bg-max-panel px-4 py-3">
        <button
          onClick={() => selectChat(null)}
          aria-label="Назад"
          className="grid size-10 place-items-center rounded-full hover:bg-white/10 md:hidden"
        >
          <ArrowLeft className="size-6" />
        </button>
        <Avatar id={chat.chatId} title={chat.title} className="size-10" />
        <span className="truncate font-semibold">{chat.title}</span>
      </header>

      <div className={`flex-1 overflow-y-auto px-4 py-4 ${pattern}`}>
        <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
          {messages.map((m) => {
            const out = m.direction === "out";
            return (
              <div key={m.id} className={`flex ${out ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flow-root max-w-[80%] rounded-2xl px-3 py-1.5 text-[15px] leading-snug md:max-w-[65%] ${
                    out ? "rounded-br-md bg-max-accent" : "rounded-bl-md bg-max-bubble"
                  }`}
                >
                  <span className="whitespace-pre-wrap wrap-break-word">{m.text}</span>
                  <span
                    className={`float-right ml-3 mt-2 flex items-center gap-1 text-[11px] ${
                      out ? "text-white/70" : "text-max-muted"
                    }`}
                  >
                    {formatTime(m.timestamp)}
                    {out && <StatusTicks status={m.status} className="size-3.5" />}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      <div className="flex items-end gap-2 border-t border-max-line bg-max-panel p-3">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          maxLength={4000}
          rows={1}
          placeholder="Сообщение"
          className="max-h-32 min-h-11 flex-1 resize-none rounded-3xl bg-max-field px-4 py-2.5 text-[15px] leading-6 outline-none placeholder:text-max-muted"
        />
        <button
          onClick={send}
          disabled={!draft.trim()}
          aria-label="Отправить"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-max-accent transition-colors hover:bg-max-accent-hover disabled:opacity-40"
        >
          <SendHorizontal className="size-5" />
        </button>
      </div>
    </section>
  );
}