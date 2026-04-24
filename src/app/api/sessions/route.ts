import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";
import { pickExamQuestionIds, pickMistakeQuestionIds, pickPracticeQuestionIds } from "@/lib/quiz";
import { toJSON } from "@/lib/serialize";

export const runtime = "nodejs";

const CreateSchema = z.object({
  mode: z.enum(["practice", "exam", "mistakes"]),
  limit: z.number().int().min(1).max(80).optional(),
});

export async function POST(req: NextRequest) {
  const s = getSessionFromRequest(req);
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = CreateSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const { mode } = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: s.uid } });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  let questionIds: string[] = [];
  const defaultLimit =
    mode === "exam" ? user.examQuestionCount : mode === "practice" ? 10 : 20;
  const limit = parsed.data.limit ?? defaultLimit;

  if (mode === "practice") questionIds = await pickPracticeQuestionIds(limit);
  else if (mode === "exam") questionIds = await pickExamQuestionIds(limit);
  else questionIds = await pickMistakeQuestionIds(user.id, limit);

  if (questionIds.length === 0) {
    return NextResponse.json({ error: "no_questions_available" }, { status: 400 });
  }

  const session = await prisma.quizSession.create({
    data: {
      userId: user.id,
      mode,
      questionIds,
      total: questionIds.length,
    },
  });

  return NextResponse.json(toJSON(session));
}
