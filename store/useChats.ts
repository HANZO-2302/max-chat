import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Chat = { chatId: string; phone?: string; title: string; lastActivity: number };

export type Message = {
  id: string;
  chatId: string;
  text: string;
  direction: "in" | "out";
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  timestamp: number;
};

type ChatsState = {
  chats: Record<string, Chat>;
  messages: Record<string, Message[]>;
  unread: Record<string, number>;
  activeChatId: string | null;
  openChat: (chat: Chat) => void;
  selectChat: (chatId: string | null) => void;
  ensureChat: (chat: Chat) => void;
  addMessage: (m: Message) => void;
  patchMessage: (chatId: string, id: string, patch: Partial<Message>) => void;
  patchMessageById: (id: string, patch: Partial<Message>) => void;
  reset: () => void;
};

const empty = { chats: {}, messages: {}, unread: {}, activeChatId: null };

export const useChats = create<ChatsState>()(
  persist(
    (set) => ({
      ...empty,
      openChat: (chat) =>
        set((s) => ({
          chats: { ...s.chats, [chat.chatId]: s.chats[chat.chatId] ?? chat },
          activeChatId: chat.chatId,
          unread: { ...s.unread, [chat.chatId]: 0 },
        })),
      selectChat: (activeChatId) =>
        set((s) => ({
          activeChatId,
          unread: activeChatId ? { ...s.unread, [activeChatId]: 0 } : s.unread,
        })),
      ensureChat: (chat) =>
        set((s) => (s.chats[chat.chatId] ? s : { chats: { ...s.chats, [chat.chatId]: chat } })),
      addMessage: (m) =>
        set((s) => {
          const list = s.messages[m.chatId] ?? [];
          if (list.some((x) => x.id === m.id)) return s; // дедупликация
          const chat = s.chats[m.chatId];
          const isUnread = m.direction === "in" && s.activeChatId !== m.chatId;
          return {
            messages: { ...s.messages, [m.chatId]: [...list, m] },
            chats: chat
              ? { ...s.chats, [m.chatId]: { ...chat, lastActivity: m.timestamp } }
              : s.chats,
            unread: isUnread
              ? { ...s.unread, [m.chatId]: (s.unread[m.chatId] ?? 0) + 1 }
              : s.unread,
          };
        }),
      patchMessage: (chatId, id, patch) =>
        set((s) => ({
          messages: {
            ...s.messages,
            [chatId]: (s.messages[chatId] ?? []).map((m) => (m.id === id ? { ...m, ...patch } : m)),
          },
        })),
      patchMessageById: (id, patch) =>
        set((s) => {
          for (const [chatId, list] of Object.entries(s.messages)) {
            if (list.some((m) => m.id === id)) {
              return {
                messages: {
                  ...s.messages,
                  [chatId]: list.map((m) => (m.id === id ? { ...m, ...patch } : m)),
                },
              };
            }
          }
          return s;
        }),
      reset: () => set(empty),
    }),
    { name: "max-chat-data" },
  ),
);