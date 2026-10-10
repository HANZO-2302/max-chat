"use client";

import { useState } from "react";
import { checkAccount, GreenApiError } from "@/lib/greenApi";
import { normalizePhone } from "@/lib/phone";
import { useAuth } from "@/store/useAuth";
import { useChats } from "@/store/useChats";

export function NewChatForm({ onDone }: { onDone?: () => void }) {
  const credentials = useAuth((s) => s.credentials)!;
  const openChat = useChats((s) => s.openChat);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const phone = normalizePhone(value);
    if (!phone) return setError("Формат: 79991234567 (РФ) или 375291234567 (РБ)");

    // уже есть чат с этим номером — не дёргаем CheckAccount повторно
    const known = Object.values(useChats.getState().chats).find((c) => c.phone === phone);
    if (known) {
      openChat(known);
      setValue("");
      return onDone?.();
    }

    setLoading(true);
    try {
      const { exist, chatId } = await checkAccount(credentials, Number(phone));
      if (!exist) return setError("У этого номера нет аккаунта MAX");
      openChat({ chatId, phone, title: `+${phone}`, lastActivity: Date.now() });
      setValue("");
      onDone?.();
    } catch (err) {
      setError(err instanceof GreenApiError ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2 px-5 pt-3">
      <div className="flex gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Номер телефона"
          inputMode="tel"
          className="h-11 min-w-0 flex-1 rounded-xl bg-max-field px-4 text-[15px] outline-none placeholder:text-max-muted focus:ring-2 focus:ring-max-accent"
        />
        <button
          disabled={loading}
          className="h-11 rounded-xl bg-max-accent px-4 text-sm font-medium transition-colors hover:bg-max-accent-hover disabled:opacity-60"
        >
          {loading ? "…" : "Начать"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}