"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function NewSessionPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Inner />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="flex flex-col gap-2 pt-8 text-center">
      <div className="text-lg">⏳</div>
      <div className="tg-hint text-sm">Создаём сессию...</div>
    </div>
  );
}

function Inner() {
  const params = useSearchParams();
  const router = useRouter();
  const mode = (params.get("mode") ?? "practice") as "practice" | "exam" | "mistakes";
  const [status, setStatus] = useState("Создаём сессию...");
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
      credentials: "same-origin",
    })
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body.error ?? `http_${r.status}`);
        return body as { id: string };
      })
      .then((s) => router.replace(`/session/${s.id}`))
      .catch((e: Error) => setStatus(`Не удалось начать: ${e.message}`));
  }, [mode, router]);

  return (
    <div className="flex flex-col gap-2 pt-8 text-center">
      <div className="text-lg">⏳</div>
      <div className="tg-hint text-sm">{status}</div>
    </div>
  );
}
