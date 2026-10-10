import { AlertCircle, Check, CheckCheck, Clock } from "lucide-react";
import type { Message } from "@/store/useChats";

export function StatusTicks({
  status,
  className = "size-4",
}: {
  status: Message["status"];
  className?: string;
}) {
  switch (status) {
    case "sending":
      return <Clock className={className} />;
    case "sent":
      return <Check className={className} />;
    case "delivered":
      return <CheckCheck className={className} />;
    case "read":
      return <CheckCheck className={`${className} text-sky-300`} />;
    case "failed":
      return <AlertCircle className={`${className} text-red-400`} />;
  }
}