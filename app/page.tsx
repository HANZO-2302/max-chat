"use client";

import { ChatWindow } from "@/components/ChatWindow";
import { LoginForm } from "@/components/LoginForm";
import { NavRail } from "@/components/NavRail";
import { NotificationsSetup } from "@/components/NotificationsSetup";
import { Sidebar } from "@/components/Sidebar";
import { useHydrated } from "@/hooks/useHydrated";
import { useAuth } from "@/store/useAuth";

export default function Home() {
  const hydrated = useHydrated();
  const credentials = useAuth((s) => s.credentials);

  if (!hydrated) return null;
  if (!credentials) return <LoginForm />;

  return (
    <div className="flex h-dvh flex-col">
      <NotificationsSetup />
      <div className="flex min-h-0 flex-1">
        <NavRail />
        <Sidebar />
        <ChatWindow />
      </div>
    </div>
  );
}