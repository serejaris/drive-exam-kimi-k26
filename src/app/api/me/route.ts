import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";
import { toJSON } from "@/lib/serialize";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const s = getSessionFromRequest(req);
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: s.uid },
    include: { reminder: true },
  });
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(toJSON(user));
}

const PatchSchema = z.object({
  languageMode: z.enum(["es_ru", "es_only", "ru_only"]).optional(),
  timezone: z.string().max(64).optional(),
  examQuestionCount: z.number().int().min(5).max(80).optional(),
  reminder: z
    .object({
      enabled: z.boolean().optional(),
      timeLocal: z
        .string()
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
        .optional(),
      timezone: z.string().max(64).optional(),
    })
    .optional(),
});

export async function PATCH(req: NextRequest) {
  const s = getSessionFromRequest(req);
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = PatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const user = await prisma.user.update({
    where: { id: s.uid },
    data: {
      languageMode: data.languageMode,
      timezone: data.timezone,
      examQuestionCount: data.examQuestionCount,
      reminder: data.reminder
        ? {
            upsert: {
              create: {
                enabled: data.reminder.enabled ?? true,
                timeLocal: data.reminder.timeLocal ?? "09:00",
                timezone: data.reminder.timezone ?? "America/Argentina/Buenos_Aires",
              },
              update: {
                enabled: data.reminder.enabled,
                timeLocal: data.reminder.timeLocal,
                timezone: data.reminder.timezone,
              },
            },
          }
        : undefined,
    },
    include: { reminder: true },
  });

  return NextResponse.json(toJSON(user));
}
