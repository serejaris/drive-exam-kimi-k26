import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";
import { parseStringArray } from "@/lib/quiz";
import { toJSON } from "@/lib/serialize";

export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = getSessionFromRequest(req);
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const session = await prisma.quizSession.findUnique({
    where: { id },
    include: { attempts: true },
  });
  if (!session || session.userId !== s.uid) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const qIds = parseStringArray(session.questionIds);
  const questions = await prisma.question.findMany({
    where: { id: { in: qIds } },
    include: { options: { orderBy: { sortOrder: "asc" } } },
  });
  // Preserve order.
  const byId = new Map(questions.map((q) => [q.id, q]));
  const ordered = qIds.map((id) => byId.get(id)).filter(Boolean);

  return NextResponse.json(toJSON({ session, questions: ordered }));
}
