"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface TgUser {
  id: string;
  firstName: string | null;
  username: string | null;
}

interface Ctx {
  authed: boolean;
  user: TgUser | null;
  error: string | null;
  isTelegram: boolean;
}

const TgContext = createContext<Ctx>({ authed: false, user: null, error: null, isTelegram: false });

export function useTg() {
  return useContext(TgContext);
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<TgUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const hasInitData = !!tg?.initData && tg.initData.length > 0;
    setIsTelegram(hasInitData);

    if (!hasInitData) {
      setError("Открой это мини-приложение из Telegram-бота @kimi_k26_ris_bot.");
      return;
    }

    fetch("/api/auth/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg!.initData }),
      credentials: "same-origin",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`auth ${r.status}`);
        return r.json();
      })
      .then((data: { user: { id: string; firstName: string | null; username: string | null } }) => {
        setUser(data.user);
        setAuthed(true);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const value = useMemo(() => ({ authed, user, error, isTelegram }), [authed, user, error, isTelegram]);

  return <TgContext.Provider value={value}>{children}</TgContext.Provider>;
}
