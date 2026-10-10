"use client";

import { useEffect, useState } from "react";
import { getSettings, GreenApiError, setSettings } from "@/lib/greenApi";
import { useReceiver } from "@/hooks/useReceiver";
import { useAuth } from "@/store/useAuth";

export function NotificationsSetup() {
  const credentials = useAuth((s) => s.credentials)!;
  const [check, setCheck] = useState<"checking" | "ok" | "needs">("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSettings(credentials)
      .then((s) => {
        if (cancelled) return;
        const ok = s.incomingWebhook === "yes" && !s.webhookUrl;
        setCheck(ok ? "ok" : "needs");
      })
      .catch(() => {
        if (!cancelled) setCheck("ok"); // не блокируем приём, если настройки не прочитались
      });
    return () => {
      cancelled = true;
    };
  }, [credentials]);

  useReceiver(check === "ok");

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      await setSettings(credentials, {
        webhookUrl: "",
        incomingWebhook: "yes",
        incomingMessageStatusWebhook: "yes",
      });
      setCheck("ok");
    } catch (err) {
      setError(err instanceof GreenApiError ? err.message : "Не удалось сохранить настройки");
    } finally {
      setBusy(false);
    }
  }

  if (check !== "needs") return null;

  return (
    <div className="flex flex-wrap items-center gap-3 bg-amber-100 px-4 py-2 text-sm text-amber-900">
      <span>
        Для приёма сообщений нужно включить уведомления в настройках инстанса
        (текущий webhookUrl будет очищен).
      </span>
      <button
        onClick={enable}
        disabled={busy}
        className="rounded-lg bg-amber-900 px-3 py-1 text-amber-50 disabled:opacity-60"
      >
        {busy ? "…" : "Включить"}
      </button>
      {error && <span className="text-red-700">{error}</span>}
    </div>
  );
}