"use client";

import { useEffect } from "react";
import { deleteNotification, receiveNotification } from "@/lib/greenApi";
import { handleNotification } from "@/lib/notifications";
import { useAuth } from "@/store/useAuth";

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => { clearTimeout(t); resolve(); }, { once: true });
  });

export function useReceiver(enabled: boolean) {
  const credentials = useAuth((s) => s.credentials);

  useEffect(() => {
    if (!credentials || !enabled) return;
    const ctrl = new AbortController();

    (async () => {
      let failures = 0;
      while (!ctrl.signal.aborted) {
        try {
          const n = await receiveNotification(credentials, ctrl.signal);
          failures = 0;
          if (!n) continue;

          if (process.env.NODE_ENV === "development") console.debug("[green-api]", n);
          try {
            handleNotification(n.body, n.receiptId);
          } catch (e) {
            console.error(e); // битое уведомление не должно блокировать очередь
          }
          await deleteNotification(credentials, n.receiptId);
        } catch {
          if (ctrl.signal.aborted) return;
          failures++;
          await sleep(Math.min(1000 * 2 ** failures, 30_000), ctrl.signal);
        }
      }
    })();

    return () => ctrl.abort();
  }, [credentials, enabled]);
}