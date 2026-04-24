import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateInitData } from "@/lib/telegram-auth";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { ENV } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { initData?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const initData = body.initData;
  if (!initData) {
    return NextResponse.json({ error: "missing_init_data" }, { status: 400 });
  }

  let token: string;
  try {
    token = ENV.BOT_TOKEN;
  } catch {
    return NextResponse.json({ error: "server_not_configured" }, { status: 500 });
  }

  const result = validateInitData(initData, token);
  if (!result || !result.user) {
    return NextResponse.json({ error: "invalid_init_data" }, { status: 401 });
  }
  const tgUser = result.user;

  const user = await prisma.user.upsert({
    where: { telegramUserId: BigInt(tgUser.id) },
    create: {
      telegramUserId: BigInt(tgUser.id),
      chatId: BigInt(tgUser.id), // best-guess; real chatId comes from /start
      username: tgUser.username ?? null,
      firstName: tgUser.first_name ?? null,
      reminder: { create: {} },
    },
    update: {
      username: tgUser.username ?? null,
      firstName: tgUser.first_name ?? null,
      lastSeenAt: new Date(),
    },
  });

  const sessionToken = createSessionToken(user.id, user.telegramUserId);
  await setSessionCookie(sessionToken);

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      telegramUserId: user.telegramUserId.toString(),
      username: user.username,
      firstName: user.firstName,
    },
  });
}
