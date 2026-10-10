import type { NotificationBody } from "@/lib/greenApi";
import { useAuth } from "@/store/useAuth";
import { useChats, type Message } from "@/store/useChats";

function extractText(md: NotificationBody["messageData"]) {
  return (
    md?.textMessage ??
    md?.textMessageData?.textMessage ??
    md?.extendedTextMessageData?.text ??
    md?.extendedTextMessage?.text
  );
}

const statusMap: Record<string, Message["status"]> = {
  sent: "sent",
  delivered: "delivered",
  read: "read",
  failed: "failed",
  noAccount: "failed",
};

export function handleNotification(body: NotificationBody | null | undefined, receiptId: number) {
  if (!body) return;
  const store = useChats.getState();

  if (body.typeWebhook === "incomingMessageReceived") {
    const sender = body.senderData;
    const text = extractText(body.messageData);
    if (!sender?.chatId || !text || sender.chatId.startsWith("-")) return; // не текст или группа

    const timestamp = (body.timestamp ?? Math.floor(Date.now() / 1000)) * 1000;
    if (timestamp < useAuth.getState().loggedInAt - 60_000) return; // история до входа

    store.ensureChat({
      chatId: sender.chatId,
      title:
        sender.senderContactName || sender.chatName || sender.senderName || sender.chatId,
      lastActivity: timestamp,
    });
    store.addMessage({
      id: body.idMessage ?? `receipt-${receiptId}`,
      chatId: sender.chatId,
      text,
      direction: "in",
      status: "sent",
      timestamp,
    });
    return;
  }

  if (body.typeWebhook === "outgoingMessageStatus" && body.idMessage && body.status) {
    const status = statusMap[body.status];
    if (status) store.patchMessageById(body.idMessage, { status });
  }
}