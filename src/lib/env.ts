// Runtime env readers. Throw only at call-site, not at import-time,
// so `next build` works without a full env.

function read(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

export function requireEnv(name: string): string {
  const v = read(name);
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const ENV = {
  get BOT_TOKEN() {
    return requireEnv("TELEGRAM_BOT_TOKEN");
  },
  get BOT_USERNAME() {
    return read("TELEGRAM_BOT_USERNAME") ?? "";
  },
  get WEBAPP_URL() {
    return requireEnv("WEBAPP_URL");
  },
  get WEBHOOK_SECRET() {
    return requireEnv("BOT_WEBHOOK_SECRET");
  },
  get CRON_SECRET() {
    return requireEnv("CRON_SECRET");
  },
  get APP_TIMEZONE() {
    return read("APP_TIMEZONE") ?? "America/Argentina/Buenos_Aires";
  },
};
