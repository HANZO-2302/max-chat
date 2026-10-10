"use client";

import { LogOut, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { NewChatForm } from "@/components/NewChatForm";
import { StatusTicks } from "@/components/StatusTicks";
import { formatListTime } from "@/lib/format";
import { logoutAll } from "@/lib/session";
import { useChats } from "@/store/useChats";

export function Sidebar() {
  const chats = useChats((s) => s.chats);
  const messages = useChats((s) => s.messages);
  const unread = useChats((s) => s.unread);
  const activeChatId = useChats((s) => s.activeChatId);
  const selectChat = useChats((s) => s.selectChat);

  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);

  const q = query.trim().toLowerCase();
  const list = Object.values(chats)
    .filter((c) => !q || c.title.toLowerCase().includes(q))
    .sort((a, b) => b.lastActivity - a.lastActivity);

  return (
    <aside
      className={`${activeChatId ? "hidden md:flex" : "flex"} w-full flex-col bg-max-panel md:w-90 md:shrink-0`}
    >
      <header className="flex items-center justify-between px-5 pt-5">
        <h1 className="text-[28px] font-bold">Чаты</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={logoutAll}
            aria-label="Выйти"
            className="grid size-11 place-items-center rounded-full text-max-muted hover:text-white md:hidden"
          >
            <LogOut className="size-5" />
          </button>
          <button
            onClick={() => setShowNew((v) => !v)}
            aria-label="Новый чат"
            className="grid size-11 place-items-center rounded-full bg-max-accent transition-colors hover:bg-max-accent-hover"
          >
            <Plus className={`size-6 transition-transform ${showNew ? "rotate-45" : ""}`} />
          </button>
        </div>
      </header>

      {showNew && <NewChatForm onDone={() => setShowNew(false)} />}

      <div className="px-5 py-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-max-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти"
            className="h-12 w-full rounded-2xl bg-max-field pl-12 pr-4 text-[16px] outline-none placeholder:text-max-muted focus:ring-2 focus:ring-max-accent"
          />
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {list.map((c) => {
          const last = messages[c.chatId]?.at(-1);
          const count = unread[c.chatId] ?? 0;
          return (
            <li key={c.chatId}>
              <button
                onClick={() => selectChat(c.chatId)}
                className={`flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-white/5 ${
                  c.chatId === activeChatId ? "bg-white/10" : ""
                }`}
              >
                <Avatar id={c.chatId} title={c.title} className="size-14" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-semibold">{c.title}</span>
                    {last && (
                      <span className="flex shrink-0 items-center gap-1 text-sm text-max-muted">
                        {last.direction === "out" && <StatusTicks status={last.status} />}
                        {formatListTime(last.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="line-clamp-2 min-h-5 text-[15px] leading-5 text-max-muted">
                      {last?.text}
                    </p>
                    {count > 0 && (
                      <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-max-accent px-1.5 text-xs font-semibold">
                        {count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}