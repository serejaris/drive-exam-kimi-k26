import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ENV } from "@/lib/env";
import { sendReminderTo } from "@/lib/bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Triggered by Railway Cron (or curl).
 * Auth: header `X-Cron-Secret: <CRON_SECRET>` or `?secret=<CRON_SECRET>`.
 *
 * Picks users whose reminder time (in their timezone) matches the current
 * hour:minute and whose `last_sent_at` isn't from today in that timezone.
 */
export async function POST(req: NextRequest) {
  let expected: string;
  try {
    expected = ENV.CRON_SECRET;
  } catch {
    return NextResponse.json({ error: "server_not_configured" }, { status: 500 });
  }
  const provided = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (provided !== expected) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const now = new Date();
  const users = await prisma.user.findMany({
    include: { reminder: true },
  });

  const sent: string[] = [];
  const errors: { userId: string; err: string }[] = [];

  for (const u of users) {
    if (!u.reminder || !u.reminder.enabled) continue;
    const targetHM = u.reminder.timeLocal; // "HH:MM"
    const tz = u.reminder.timezone || u.timezone;

    const localHM = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
    if (localHM !== targetHM) continue;

    // Avoid double-send within 60 minutes.
    if (u.reminder.lastSentAt && now.getTime() - u.reminder.lastSentAt.getTime() < 60 * 60 * 1000) {
      continue;
    }

    try {
      await sendReminderTo(u.chatId);
      await prisma.reminderSettings.update({
        where: { userId: u.id },
        data: { lastSentAt: now },
      });
      sent.push(u.id);
    } catch (e) {
      errors.push({ userId: u.id, err: (e as Error).message });
    }
  }

  return NextResponse.json({ ok: true, sent: sent.length, errors });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
