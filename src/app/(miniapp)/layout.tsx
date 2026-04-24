"use client";

import { useEffect } from "react";
import { TelegramProvider } from "@/components/TelegramProvider";

export default function MiniAppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.ready();
    tg?.expand();
  }, []);

  return (
    <TelegramProvider>
      <main className="mx-auto min-h-screen w-full max-w-lg px-4 pb-16 pt-4">{children}</main>
    </TelegramProvider>
  );
}
