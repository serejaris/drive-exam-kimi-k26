import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";
import { parseStringArray } from "@/lib/quiz";
import { toJSON } from "@/lib/serialize";

export const runtime = "nodejs";

const PASS_THRESHOLD = 0.85;

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = getSessionFromRequest(req);
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const session = await prisma.quizSession.findUnique({
    where: { id },
    include: {
      attempts: true,
    },
  });
  if (!session || session.userId !== s.uid) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const qIds = parseStringArray(session.questionIds);
  const questions = await prisma.question.findMany({
    where: { id: { in: qIds } },
    include: { options: { orderBy: { sortOrder: "asc" } } },
  });

  const correctAttempts = session.attempts.filter((a) => a.isCorrect).length;
  const wrongQuestionIds = session.attempts.filter((a) => !a.isCorrect).map((a) => a.questionId);
  const percentage = session.total > 0 ? correctAttempts / session.total : 0;
  const passed = percentage >= PASS_THRESHOLD;

  const updated = await prisma.quizSession.update({
    where: { id: session.id },
    data: {
      status: "completed",
      score: correctAttempts,
      completedAt: new Date(),
    },
  });

  return NextResponse.json(
    toJSON({
      session: updated,
      score: correctAttempts,
      total: session.total,
      percentage,
      passed,
      wrongQuestionIds,
      questions,
    }),
  );
}
