import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export async function pickPracticeQuestionIds(limit: number): Promise<string[]> {
  const all = await prisma.question.findMany({
    where: { status: "active" },
    select: { id: true },
  });
  return shuffle(all.map((q) => q.id)).slice(0, Math.min(limit, all.length));
}

export async function pickExamQuestionIds(limit: number): Promise<string[]> {
  return pickPracticeQuestionIds(limit);
}

export async function pickMistakeQuestionIds(userId: string, limit: number): Promise<string[]> {
  const stats = await prisma.userQuestionStat.findMany({
    where: {
      userId,
      OR: [{ status: "weak" }, { wrongCount: { gt: 0 } }],
    },
    orderBy: [{ correctStreak: "asc" }, { lastAnsweredAt: "asc" }],
    take: limit,
  });
  return stats.map((s) => s.questionId);
}

export function isAnswerCorrect(correctIds: string[], selected: string[]): boolean {
  if (correctIds.length !== selected.length) return false;
  const a = [...correctIds].sort();
  const b = [...selected].sort();
  return a.every((v, i) => v === b[i]);
}

export function parseStringArray(json: Prisma.JsonValue): string[] {
  if (Array.isArray(json)) return json.filter((x): x is string => typeof x === "string");
  return [];
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
