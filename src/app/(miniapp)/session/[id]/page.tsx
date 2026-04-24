"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Option = { id: string; optionId: string; textEs: string; textRu: string };
type Question = {
  id: string;
  questionEs: string;
  questionRu: string;
  media?: { type: string; url: string } | null;
  options: Option[];
  correctOptionIds?: string[];
  explanationRu?: string | null;
};
type SessionDTO = {
  session: {
    id: string;
    mode: "practice" | "exam" | "mistakes";
    status: "active" | "completed" | "abandoned";
    total: number;
    score: number;
    currentIndex: number;
    questionIds: string[];
    attempts?: { questionId: string; isCorrect: boolean }[];
  };
  questions: Question[];
};

export default function SessionPage() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;
  const router = useRouter();

  const [data, setData] = useState<SessionDTO | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctOptionIds: string[] | null;
    explanationRu: string | null;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`, { credentials: "same-origin" })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json() as Promise<SessionDTO>;
      })
      .then((d) => {
        setData(d);
        // Resume at first unanswered.
        const answered = new Set((d.session.attempts ?? []).map((a) => a.questionId));
        const firstUnanswered = d.questions.findIndex((q) => !answered.has(q.id));
        setIndex(firstUnanswered === -1 ? d.questions.length : firstUnanswered);
      })
      .catch((e: Error) => setError(e.message));
  }, [sessionId]);

  const question = data?.questions[index];
  const mode = data?.session.mode ?? "practice";
  const total = data?.session.total ?? 0;
  const done = data && index >= data.questions.length;

  const toggle = useCallback((id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const advance = useCallback(() => {
    setSelected([]);
    setFeedback(null);
    setIndex((i) => i + 1);
  }, []);

  const submit = useCallback(async () => {
    if (!question || selected.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/sessions/${sessionId}/answer`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: question.id, selected_option_ids: selected }),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? `http_${r.status}`);
      if (mode === "exam") {
        // Silent advance in exam mode.
        advance();
      } else {
        setFeedback({
          isCorrect: body.isCorrect,
          correctOptionIds: body.correctOptionIds,
          explanationRu: body.explanationRu,
        });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [question, selected, sessionId, mode, advance]);

  const complete = useCallback(async () => {
    setBusy(true);
    try {
      const r = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: "POST",
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error(await r.text());
      router.replace(`/session/${sessionId}/results`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }, [sessionId, router]);

  useEffect(() => {
    if (done && !busy) complete();
  }, [done, busy, complete]);

  const modeLabel = useMemo(
    () => ({ practice: "Тренировка", exam: "Экзамен", mistakes: "Повторение ошибок" }[mode]),
    [mode],
  );

  if (error) return <ErrorScreen error={error} />;
  if (!data) return <div className="tg-hint pt-8 text-center">Загружаем...</div>;
  if (done) return <div className="tg-hint pt-8 text-center">Завершаем сессию...</div>;
  if (!question) return <div className="tg-hint pt-8 text-center">Нет вопросов.</div>;

  const isExam = mode === "exam";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs">
        <Link href="/" className="tg-hint">
          ← На главную
        </Link>
        <div className="tg-hint">
          {modeLabel} · {index + 1} / {total}
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      {question.media?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={question.media.url}
          alt="знак"
          className="mx-auto max-h-56 w-auto rounded-lg object-contain"
        />
      ) : null}

      <div className="flex flex-col gap-1">
        <div className="text-lg font-semibold leading-tight">{question.questionEs}</div>
        <div className="tg-hint text-sm italic">{question.questionRu}</div>
      </div>

      <div className="flex flex-col gap-2">
        {question.options.map((o) => {
          const chosen = selected.includes(o.optionId);
          let style = "border-gray-300 dark:border-gray-700";
          if (feedback) {
            const isCorrect = feedback.correctOptionIds?.includes(o.optionId);
            if (isCorrect) style = "border-green-500 bg-green-100 dark:bg-green-950";
            else if (chosen) style = "border-red-500 bg-red-100 dark:bg-red-950";
          } else if (chosen) {
            style = "border-blue-500 bg-blue-50 dark:bg-blue-950";
          }
          return (
            <button
              key={o.optionId}
              disabled={!!feedback || busy}
              onClick={() => toggle(o.optionId)}
              className={`w-full rounded-xl border-2 p-3 text-left transition ${style}`}
            >
              <div className="font-medium">{o.textEs}</div>
              <div className="tg-hint text-xs italic">{o.textRu}</div>
            </button>
          );
        })}
      </div>

      {feedback && !isExam && (
        <div
          className={`rounded-xl p-3 text-sm ${
            feedback.isCorrect ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"
          }`}
        >
          <div className="font-semibold">{feedback.isCorrect ? "Верно ✅" : "Неверно ❌"}</div>
          {feedback.explanationRu ? <div className="mt-1">{feedback.explanationRu}</div> : null}
        </div>
      )}

      <div className="sticky bottom-2 pt-2">
        {!feedback ? (
          <button
            disabled={busy || selected.length === 0}
            onClick={submit}
            className="tg-button w-full rounded-xl p-3 font-semibold disabled:opacity-50"
          >
            {isExam ? "Следующий вопрос" : "Проверить"}
          </button>
        ) : (
          <button
            onClick={advance}
            className="tg-button w-full rounded-xl p-3 font-semibold"
          >
            {index + 1 === total ? "Завершить" : "Дальше"}
          </button>
        )}
      </div>
    </div>
  );
}

function ErrorScreen({ error }: { error: string }) {
  return (
    <div className="flex flex-col gap-3 pt-8 text-center">
      <div className="text-2xl">⚠️</div>
      <div className="text-sm text-red-600">{error}</div>
      <Link href="/" className="tg-hint text-sm underline">
        На главную
      </Link>
    </div>
  );
}
