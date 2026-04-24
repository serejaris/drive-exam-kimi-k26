/* eslint-disable no-console */
/**
 * Run with: npx tsx scripts/set-webhook.ts
 * Requires env: TELEGRAM_BOT_TOKEN, WEBAPP_URL, BOT_WEBHOOK_SECRET
 */
async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.WEBAPP_URL;
  const secret = process.env.BOT_WEBHOOK_SECRET;
  if (!token || !appUrl || !secret) {
    console.error("Missing env: TELEGRAM_BOT_TOKEN / WEBAPP_URL / BOT_WEBHOOK_SECRET");
    process.exit(1);
  }
  const url = `${appUrl.replace(/\/+$/, "")}/api/telegram/webhook/${secret}`;
  const tgUrl = `https://api.telegram.org/bot${token}/setWebhook`;
  const res = await fetch(tgUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, allowed_updates: ["message", "callback_query"] }),
  });
  const body = await res.json();
  console.log("setWebhook →", body);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
