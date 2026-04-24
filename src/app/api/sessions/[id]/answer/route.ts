import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";
import { isAnswerCorrect, parseStringArray } from "@/lib/quiz";
import { toJSON } from "@/lib/serialize";

export const runtime = "nodejs";

const Schema = z.object({
  question_id: z.string(),
  selected_option_ids: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = getSessionFromRequest(req);
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const session = await prisma.quizSession.findUnique({ where: { id } });
  if (!session || session.userId !== s.uid) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (session.status !== "active") {
    return NextResponse.json({ error: "session_not_active" }, { status: 400 });
  }
  const qIds = parseStringArray(session.questionIds);
  if (!qIds.includes(parsed.data.question_id)) {
    return NextResponse.json({ error: "question_not_in_session" }, { status: 400 });
  }

  const question = await prisma.question.findUnique({
    where: { id: parsed.data.question_id },
  });
  if (!question) return NextResponse.json({ error: "question_not_found" }, { status: 404 });

  const correctIds = parseStringArray(question.correctOptionIds);
  const isCorrect = isAnswerCorrect(correctIds, parsed.data.selected_option_ids);

  const attempt = await prisma.attempt.create({
    data: {
      userId: s.uid,
      sessionId: session.id,
      questionId: question.id,
      selectedOptionIds: parsed.data.selected_option_ids,
      isCorrect,
    },
  });

  // Update running score + index.
  await prisma.quizSession.update({
    where: { id: session.id },
    data: {
      score: { increment: isCorrect ? 1 : 0 },
      currentIndex: { increment: 1 },
    },
  });

  // Update per-question stats.
  const existing = await prisma.userQuestionStat.findUnique({
    where: { userId_questionId: { userId: s.uid, questionId: question.id } },
  });
  const nextStreak = isCorrect ? (existing?.correctStreak ?? 0) + 1 : 0;
  const nextStatus =
    nextStreak >= 2 ? "mastered" : isCorrect ? "learning" : "weak";

  await prisma.userQuestionStat.upsert({
    where: { userId_questionId: { userId: s.uid, questionId: question.id } },
    create: {
      userId: s.uid,
      questionId: question.id,
      attemptsCount: 1,
      correctCount: isCorrect ? 1 : 0,
      wrongCount: isCorrect ? 0 : 1,
      correctStreak: nextStreak,
      lastAnsweredAt: new Date(),
      status: nextStatus,
    },
    update: {
      attemptsCount: { increment: 1 },
      correctCount: { increment: isCorrect ? 1 : 0 },
      wrongCount: { increment: isCorrect ? 0 : 1 },
      correctStreak: nextStreak,
      lastAnsweredAt: new Date(),
      status: nextStatus,
    },
  });

  return NextResponse.json(
    toJSON({
      attempt,
      isCorrect,
      // Reveal correct answer only in practice/mistakes mode.
      revealed: session.mode !== "exam",
      correctOptionIds: session.mode !== "exam" ? correctIds : null,
      explanationRu: session.mode !== "exam" ? question.explanationRu : null,
    }),
  );
}
