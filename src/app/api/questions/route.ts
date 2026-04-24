import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { toJSON } from "@/lib/serialize";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 100);
  const questions = await prisma.question.findMany({
    where: { status: "active" },
    include: { options: { orderBy: { sortOrder: "asc" } } },
    take: limit,
  });
  return NextResponse.json(toJSON(questions));
}
