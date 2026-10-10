"use client";

import { LogOut, MessageCircle } from "lucide-react";
import { logoutAll } from "@/lib/session";
import { useAuth } from "@/store/useAuth";
import { useChats } from "@/store/useChats";

export function NavRail() {
  const total = useChats((s) => Object.values(s.unread).reduce((a, b) => a + b, 0));
  const idInstance = useAuth((s) => s.credentials?.idInstance);

  return (
    <nav className="hidden w-18 shrink-0 flex-col items-center justify-between bg-max-rail py-4 md:flex">
      <div className="flex flex-col items-center gap-1 text-xs font-medium">
        <span className="relative">
          <MessageCircle className="size-7" />
          {total > 0 && (
            <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-max-accent px-1 text-[11px] font-semibold">
              {total}
            </span>
          )}
        </span>
        Чаты
      </div>

      <button
        onClick={logoutAll}
        title={`Инстанс ${idInstance}`}
        className="flex flex-col items-center gap-1 text-xs text-max-muted transition-colors hover:text-white"
      >
        <LogOut className="size-6" />
        Выйти
      </button>
    </nav>
  );
}