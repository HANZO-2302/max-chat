"use client";

import { useState } from "react";
import { DEFAULT_API_URL, getStateInstance, GreenApiError } from "@/lib/greenApi";
import { useAuth } from "@/store/useAuth";

const stateMessages: Record<string, string> = {
  notAuthorized: "Инстанс не авторизован. Отсканируйте QR-код в личном кабинете GREEN-API.",
  blocked: "Аккаунт заблокирован.",
  suspended: "На аккаунте временные ограничения.",
  starting: "Инстанс запускается, подождите до 5 минут.",
};

const input =
  "h-12 w-full rounded-xl bg-max-field px-4 text-[15px] outline-none placeholder:text-max-muted focus:ring-2 focus:ring-max-accent";

export function LoginForm() {
  const login = useAuth((s) => s.login);
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setToken] = useState("");
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const id = idInstance.trim();
    const token = apiTokenInstance.trim();
    if (!/^\d+$/.test(id)) return setError("idInstance должен состоять из цифр");
    if (!token) return setError("Введите apiTokenInstance");

    const credentials = { apiUrl: apiUrl.trim(), idInstance: id, apiTokenInstance: token };

    setLoading(true);
    try {
      const { stateInstance } = await getStateInstance(credentials);
      if (stateInstance !== "authorized") {
        return setError(stateMessages[stateInstance] ?? `Состояние инстанса: ${stateInstance}`);
      }
      login(credentials);
    } catch (err) {
      setError(err instanceof GreenApiError ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-max-bg p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-3xl bg-max-panel p-6">
        <h1 className="text-2xl font-bold">Вход в MAX Chat</h1>

        <input
          className={input}
          placeholder="idInstance"
          inputMode="numeric"
          autoComplete="off"
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
        />
        <input
          className={input}
          placeholder="apiTokenInstance"
          type="password"
          autoComplete="off"
          value={apiTokenInstance}
          onChange={(e) => setToken(e.target.value)}
        />

        <details className="text-sm text-max-muted">
          <summary className="cursor-pointer">Дополнительно</summary>
          <input
            className={`${input} mt-2`}
            placeholder="apiUrl"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
        </details>

        {error && (
          <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="h-12 w-full rounded-xl bg-max-accent font-medium transition-colors hover:bg-max-accent-hover disabled:opacity-60"
        >
          {loading ? "Проверяем…" : "Войти"}
        </button>
      </form>
    </main>
  );
}