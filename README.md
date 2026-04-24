# drive-exam-kimi-k26

CABA driving-exam Telegram Mini App.
**Model under test:** Kimi K2.6 (Moonshot AI).
**Bot:** [@kimi_k26_ris_bot](https://t.me/kimi_k26_ris_bot).

Part of live stream `chinese-models` (2026-04-24) — see
[live.sereja.tech/chinese-models](https://live.sereja.tech/chinese-models/).

Six clones of the same PRD built in parallel by six different models.
This repo holds the Kimi K2.6 implementation.

## PRD

[`docs/PRD.md`](./docs/PRD.md) — canonical product spec (mirror of
[serejaris/tg-drive-exam](https://github.com/serejaris/tg-drive-exam/blob/main/docs/PRD.md)).

## Stack

- **Hosting:** Railway (web + Railway Postgres + Railway Cron)
- **Framework:** Next.js 15 App Router + TypeScript + Tailwind v3
- **Bot:** grammY (webhook inside the Next.js server)
- **DB:** Railway Postgres via Prisma
- **Auth:** HMAC-SHA256 validation of Telegram `initData`, HTTP-only session cookie

## Repo layout

```
src/
  app/
    (miniapp)/            # React UI pages (Home, Session, Results, Settings)
    api/
      auth/telegram/      # POST: validates initData, issues session cookie
      me/                 # GET / PATCH current user settings
      questions/          # GET list + GET :id
      sessions/           # POST create; GET/:id; POST/:id/answer; POST/:id/complete
      telegram/webhook/[secret]/   # grammY webhook
      cron/send-reminders # cron endpoint, X-Cron-Secret protected
  lib/                    # prisma, bot, telegram-auth, session, quiz
  components/             # TelegramProvider
prisma/
  schema.prisma           # matches PRD §7
  seed.ts                 # 10 bilingual CABA questions (ES + RU, with road-sign images)
scripts/
  set-webhook.ts          # Telegram setWebhook helper
railway.json              # Railway build / start commands
```

## Local development

```bash
cp .env.example .env    # fill real values (see below)
npm install
npx prisma migrate dev --name init    # or: npx prisma db push
npm run db:seed
npm run dev             # http://localhost:3000
```

`.env` (already gitignored) needs:

```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_BOT_USERNAME=kimi_k26_ris_bot
WEBAPP_URL=https://<tunnel-or-prod>.example
DATABASE_URL=postgresql://...
BOT_WEBHOOK_SECRET=<random-string>
CRON_SECRET=<another-random-string>
APP_TIMEZONE=America/Argentina/Buenos_Aires
```

For local bot testing you'll need a public HTTPS tunnel (ngrok, cloudflared)
so Telegram can reach `/api/telegram/webhook/<secret>`.

## Railway deploy (end-to-end)

1. **Create project.** railway.app → New Project → Deploy from GitHub repo →
   pick `serejaris/drive-exam-kimi-k26`. Railway auto-detects Next.js via Nixpacks.
2. **Add Postgres.** In the same project: `+ New` → Database → Add PostgreSQL.
   Railway auto-injects `DATABASE_URL` into the web service.
3. **Environment variables** (web service → Variables):
   - `TELEGRAM_BOT_TOKEN` — from @BotFather
   - `TELEGRAM_BOT_USERNAME` — `kimi_k26_ris_bot`
   - `WEBAPP_URL` — Railway public URL, e.g. `https://drive-exam-kimi-k26.up.railway.app`
   - `BOT_WEBHOOK_SECRET` — random long string (e.g. `openssl rand -hex 24`)
   - `CRON_SECRET` — another random long string
   - `APP_TIMEZONE` — `America/Argentina/Buenos_Aires`
4. **Deploy.** Railway runs `npm ci && npm run build`, then
   `npx prisma migrate deploy && npm run start` (see `railway.json`).
5. **Seed DB.** Once: `railway run npm run db:seed` locally, or open the
   service shell and `npm run db:seed`.
6. **Register webhook with Telegram:**
   ```bash
   # Locally (reads WEBAPP_URL / token / secret from env)
   WEBAPP_URL=https://drive-exam-kimi-k26.up.railway.app \
   TELEGRAM_BOT_TOKEN=... \
   BOT_WEBHOOK_SECRET=... \
     npm run bot:set-webhook
   ```
   Or via curl:
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
     -d "url=https://drive-exam-kimi-k26.up.railway.app/api/telegram/webhook/<BOT_WEBHOOK_SECRET>"
   ```
7. **Configure Mini App URL in BotFather:** `/mybots` → bot → Bot Settings →
   Menu Button → set URL to `https://drive-exam-kimi-k26.up.railway.app/`.
8. **Add Railway Cron.** Project → `+ New` → Cron job.
   - Schedule: `*/5 * * * *` (every 5 min — endpoint filters by per-user local time)
   - Command: `curl -fsSL -H "X-Cron-Secret: $CRON_SECRET" $WEBAPP_URL/api/cron/send-reminders`
9. **Test.** Open @kimi_k26_ris_bot in Telegram → `/start` → tap the
   web-app button → Mini App should open and auto-auth.

## Testing / verification

```bash
npm run build   # tsc + next build
npm run lint    # eslint
```

Manual QA checklist — see PRD §13.

## Acceptance

See [issue #1](../../issues/1) for the MVP task + checklist.
