export type Credentials = {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
};

export type InstanceState =
  | "authorized"
  | "notAuthorized"
  | "blocked"
  | "suspended"
  | "starting";

export const DEFAULT_API_URL = "https://api.green-api.com/v3";

/** false — запросы напрямую из браузера; true — через Route Handler /api/green */
const USE_PROXY = false;

export class GreenApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

function buildUrl(c: Credentials, method: string, suffix?: string | number, query?: string) {
  const tail =
    `/waInstance${c.idInstance}/${method}/${c.apiTokenInstance}` +
    (suffix !== undefined ? `/${suffix}` : "") +
    (query ? `?${query}` : "");
  return USE_PROXY ? `/api/green${tail}` : c.apiUrl.replace(/\/+$/, "") + tail;
}

function httpErrorText(status: number) {
  if (status === 401 || status === 403) return "Неверные учётные данные или доступ запрещён";
  if (status === 429) return "Слишком много запросов, попробуйте позже";
  if (status === 466) return "Достигнут лимит тарифа Developer";
  if (status === 502) return "Не удалось связаться с GREEN-API, проверьте apiUrl";
  return `Ошибка API (${status})`;
}

type Opts = RequestInit & { suffix?: string | number; query?: string };

export async function request<T>(c: Credentials, method: string, opts: Opts = {}): Promise<T> {
  const { suffix, query, ...init } = opts;
  // кастомный заголовок только для прокси, иначе браузер добавит лишний preflight
  const headers = USE_PROXY ? { ...init.headers, "x-api-url": c.apiUrl } : init.headers;

  let res: Response;
  try {
    res = await fetch(buildUrl(c, method, suffix, query), { ...init, headers });
  } catch (err) {
    if (init.signal?.aborted) throw err;
    throw new GreenApiError("Нет соединения с GREEN-API (проверьте сеть, VPN или CORS)");
  }
  if (!res.ok) throw new GreenApiError(httpErrorText(res.status), res.status);

  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T; // пустая очередь = null
}

function post<T>(c: Credentials, method: string, body: unknown) {
  return request<T>(c, method, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/* ---------- аккаунт ---------- */

export const getStateInstance = (c: Credentials) =>
  request<{ stateInstance: InstanceState }>(c, "getStateInstance");

export type InstanceSettings = {
  webhookUrl?: string;
  incomingWebhook?: string;
  incomingMessageStatusWebhook?: string;
};

export const getSettings = (c: Credentials) => request<InstanceSettings>(c, "getSettings");
export const setSettings = (c: Credentials, s: InstanceSettings) =>
  post<unknown>(c, "setSettings", s);

/* ---------- отправка ---------- */

export const checkAccount = (c: Credentials, phoneNumber: number) =>
  post<{ exist: boolean; chatId: string }>(c, "checkAccount", { phoneNumber });

export const sendMessage = (c: Credentials, chatId: string, message: string) =>
  post<{ idMessage: string }>(c, "sendMessage", { chatId, message });

/* ---------- приём ---------- */

export type NotificationBody = {
  typeWebhook?: string;
  timestamp?: number;
  idMessage?: string;
  status?: string;
  senderData?: {
    chatId?: string;
    chatName?: string;
    senderName?: string;
    senderContactName?: string;
  };
  messageData?: {
    typeMessage?: string;
    textMessage?: string;
    textMessageData?: { textMessage?: string };
    extendedTextMessageData?: { text?: string };
    extendedTextMessage?: { text?: string };
  };
};

export type Notification = { receiptId: number; body: NotificationBody };

export const receiveNotification = (c: Credentials, signal?: AbortSignal) =>
  request<Notification | null>(c, "receiveNotification", { signal, query: "receiveTimeout=5" });

export const deleteNotification = (c: Credentials, receiptId: number) =>
  request<unknown>(c, "deleteNotification", { method: "DELETE", suffix: receiptId });