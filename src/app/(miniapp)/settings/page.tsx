"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type MeDTO = {
  id: string;
  languageMode: "es_ru" | "es_only" | "ru_only";
  timezone: string;
  examQuestionCount: number;
  reminder: { enabled: boolean; timeLocal: string; timezone: string } | null;
};

export default function SettingsPage() {
  const [me, setMe] = useState<MeDTO | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/me", { credentials: "same-origin" })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json() as Promise<MeDTO>;
      })
      .then(setMe)
      .catch((e: Error) => setErr(e.message));
  }, []);

  async function save() {
    if (!me) return;
    setSaving(true);
    setSaved(false);
    try {
      const r = await fetch("/api/me", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          languageMode: me.languageMode,
          timezone: me.timezone,
          examQuestionCount: me.examQuestionCount,
          reminder: me.reminder
            ? {
                enabled: me.reminder.enabled,
                timeLocal: me.reminder.timeLocal,
                timezone: me.reminder.timezone,
              }
            : undefined,
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      setSaved(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (err) return <div className="pt-8 text-center text-red-600">{err}</div>;
  if (!me) return <div className="tg-hint pt-8 text-center">Загружаем настройки...</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="tg-hint text-sm">
          ← Назад
        </Link>
        <h1 className="text-lg font-bold">Настройки</h1>
        <span />
      </div>

      <section className="tg-card flex flex-col gap-2 rounded-xl p-4">
        <label className="text-sm font-semibold">Язык отображения</label>
        <select
          className="tg-card rounded-lg border border-gray-300 p-2"
          value={me.languageMode}
          onChange={(e) => setMe({ ...me, languageMode: e.target.value as MeDTO["languageMode"] })}
        >
          <option value="es_ru">ES + RU (рекомендуется)</option>
          <option value="es_only">Только ES</option>
          <option value="ru_only">Только RU</option>
        </select>
      </section>

      <section className="tg-card flex flex-col gap-2 rounded-xl p-4">
        <label className="text-sm font-semibold">Вопросов в экзамене</label>
        <input
          type="number"
          min={5}
          max={80}
          className="tg-card rounded-lg border border-gray-300 p-2"
          value={me.examQuestionCount}
          onChange={(e) =>
            setMe({ ...me, examQuestionCount: Math.max(5, Math.min(80, Number(e.target.value) || 40)) })
          }
        />
      </section>

      <section className="tg-card flex flex-col gap-2 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold">Ежедневное напоминание</label>
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={me.reminder?.enabled ?? false}
            onChange={(e) =>
              setMe({
                ...me,
                reminder: {
                  enabled: e.target.checked,
                  timeLocal: me.reminder?.timeLocal ?? "09:00",
                  timezone: me.reminder?.timezone ?? "America/Argentina/Buenos_Aires",
                },
              })
            }
          />
        </div>
        <label className="tg-hint text-xs">Время (локальное)</label>
        <input
          type="time"
          className="tg-card rounded-lg border border-gray-300 p-2"
          value={me.reminder?.timeLocal ?? "09:00"}
          onChange={(e) =>
            setMe({
              ...me,
              reminder: {
                enabled: me.reminder?.enabled ?? true,
                timeLocal: e.target.value,
                timezone: me.reminder?.timezone ?? "America/Argentina/Buenos_Aires",
              },
            })
          }
        />
        <label className="tg-hint text-xs">Часовой пояс</label>
        <input
          type="text"
          className="tg-card rounded-lg border border-gray-300 p-2"
          value={me.reminder?.timezone ?? me.timezone}
          onChange={(e) =>
            setMe({
              ...me,
              reminder: {
                enabled: me.reminder?.enabled ?? true,
                timeLocal: me.reminder?.timeLocal ?? "09:00",
                timezone: e.target.value,
              },
            })
          }
        />
      </section>

      <button
        disabled={saving}
        onClick={save}
        className="tg-button sticky bottom-2 rounded-xl p-3 font-semibold disabled:opacity-50"
      >
        {saving ? "Сохраняем..." : saved ? "Сохранено ✓" : "Сохранить"}
      </button>
    </div>
  );
}
