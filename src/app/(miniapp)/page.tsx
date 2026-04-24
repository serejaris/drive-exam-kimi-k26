"use client";

import Link from "next/link";
import { useTg } from "@/components/TelegramProvider";

export default function Home() {
  const { user, authed, error, isTelegram } = useTg();

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1 py-2">
        <h1 className="text-2xl font-bold">CABA Drive Exam</h1>
        <p className="tg-hint text-sm">
          {user?.firstName ? `Привет, ${user.firstName}!` : "Тренажёр теоретического экзамена (категория B)."}
        </p>
      </header>

      {!isTelegram && (
        <div className="tg-card rounded-xl p-4 text-sm">
          <b>Dev preview.</b> Полная функциональность работает внутри Telegram Mini App.
        </div>
      )}

      {error && isTelegram && (
        <div className="rounded-xl bg-red-100 p-4 text-sm text-red-900">Ошибка авторизации: {error}</div>
      )}

      <nav className="grid grid-cols-1 gap-3">
        <MenuCard
          href="/session/new?mode=practice"
          title="Тренировка"
          subtitle="Вопросы с ответом и пояснением сразу."
          icon="🏋️"
          disabled={!authed && isTelegram}
        />
        <MenuCard
          href="/session/new?mode=exam"
          title="Экзамен"
          subtitle="40 вопросов, результат в конце."
          icon="📝"
          disabled={!authed && isTelegram}
        />
        <MenuCard
          href="/session/new?mode=mistakes"
          title="Повторение ошибок"
          subtitle="Вопросы, где ты ошибался."
          icon="🔁"
          disabled={!authed && isTelegram}
        />
        <MenuCard href="/settings" title="Настройки" subtitle="Напоминания, язык, количество вопросов." icon="⚙️" />
      </nav>

      <footer className="tg-hint pt-4 text-center text-xs">
        Живая сборка от модели <b>Kimi K2.6</b> · part of live-stream `chinese-models`.
      </footer>
    </div>
  );
}

function MenuCard({
  href,
  title,
  subtitle,
  icon,
  disabled,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: string;
  disabled?: boolean;
}) {
  const content = (
    <div className={`tg-card flex items-center gap-3 rounded-xl p-4 ${disabled ? "opacity-50" : "active:opacity-80"}`}>
      <div className="text-3xl leading-none">{icon}</div>
      <div className="flex-1">
        <div className="text-base font-semibold">{title}</div>
        <div className="tg-hint text-xs">{subtitle}</div>
      </div>
      <div className="tg-hint">›</div>
    </div>
  );
  if (disabled) return <div aria-disabled>{content}</div>;
  return <Link href={href}>{content}</Link>;
}
