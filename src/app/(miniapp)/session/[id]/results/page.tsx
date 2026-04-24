"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type ResultsDTO = {
  session: { id: string; mode: "practice" | "exam" | "mistakes" };
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  wrongQuestionIds: string[];
  questions: {
    id: string;
    questionEs: string;
    questionRu: string;
  }[];
};

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<ResultsDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // POST /complete is idempotent — returns the same result if already completed.
    fetch(`/api/sessions/${params.id}/complete`, {
      method: "POST",
      credentials: "same-origin",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json() as Promise<ResultsDTO>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, [params.id]);

  if (error) return <div className="pt-8 text-center text-red-600">{error}</div>;
  if (!data) return <div className="tg-hint pt-8 text-center">Считаем результат...</div>;

  const pct = Math.round(data.percentage * 100);
  const wrongSet = new Set(data.wrongQuestionIds);
  const wrong = data.questions.filter((q) => wrongSet.has(q.id));

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col items-center gap-1 pt-4">
        <div className="text-5xl">{data.passed ? "🎉" : "💪"}</div>
        <div className="text-2xl font-bold">
          {data.score} / {data.total}
        </div>
        <div className="tg-hint text-sm">
          {pct}% · {data.passed ? "Сдано" : "Не сдано"} (порог 85%)
        </div>
      </header>

      {wrong.length > 0 && (
        <section className="tg-card rounded-xl p-4">
          <h2 className="mb-2 text-base font-semibold">Ошибки ({wrong.length})</h2>
          <ul className="flex flex-col gap-2">
            {wrong.map((q) => (
              <li key={q.id} className="text-sm">
                <div className="font-medium">{q.questionEs}</div>
                <div className="tg-hint text-xs italic">{q.questionRu}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-2">
        {wrong.length > 0 && (
          <Link
            href="/session/new?mode=mistakes"
            className="tg-button rounded-xl p-3 text-center font-semibold"
          >
            🔁 Повторить ошибки
          </Link>
        )}
        <Link
          href="/session/new?mode=exam"
          className="tg-card rounded-xl p-3 text-center font-semibold"
        >
          📝 Новый экзамен
        </Link>
        <Link href="/" className="tg-card rounded-xl p-3 text-center font-semibold">
          🏠 На главную
        </Link>
      </div>
    </div>
  );
}
