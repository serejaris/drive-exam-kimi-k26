import { NextResponse, type NextRequest } from "next/server";
import { webhookCallback } from "grammy";
import { getBot } from "@/lib/bot";
import { ENV } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ secret: string }> },
) {
  const { secret } = await ctx.params;
  try {
    if (secret !== ENV.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const bot = getBot();
  // Grammy's Next.js adapter expects a Web-style Request.
  const handler = webhookCallback(bot, "std/http");
  return handler(req);
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "telegram-webhook" });
}
