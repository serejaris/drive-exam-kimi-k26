import { Bot, InlineKeyboard } from "grammy";
import { prisma } from "./prisma";
import { ENV } from "./env";

let _bot: Bot | null = null;

export function getBot(): Bot {
  if (_bot) return _bot;
  _bot = new Bot(ENV.BOT_TOKEN);
  registerHandlers(_bot);
  return _bot;
}

function webAppUrl(suffix = ""): string {
  const base = ENV.WEBAPP_URL.replace(/\/+$/, "");
  return `${base}${suffix}`;
}

function webAppButton(label: string, path = "/") {
  return new InlineKeyboard().webApp(label, webAppUrl(path));
}

async function upsertUser(ctx: {
  from?: { id: number; username?: string; first_name?: string };
  chat?: { id: number };
}) {
  const u = ctx.from;
  const c = ctx.chat;
  if (!u || !c) return null;

  const user = await prisma.user.upsert({
    where: { telegramUserId: BigInt(u.id) },
    create: {
      telegramUserId: BigInt(u.id),
      chatId: BigInt(c.id),
      username: u.username ?? null,
      firstName: u.first_name ?? null,
      reminder: { create: {} },
    },
    update: {
      chatId: BigInt(c.id),
      username: u.username ?? null,
      firstName: u.first_name ?? null,
      lastSeenAt: new Date(),
    },
  });
  return user;
}

function registerHandlers(bot: Bot) {
  bot.command("start", async (ctx) => {
    await upsertUser(ctx);
    await ctx.reply(
      "Привет! Это тренажёр для подготовки к теоретическому экзамену на права в CABA (категория B).\n\n" +
        "Вопросы на испанском и русском. Нажми кнопку, чтобы открыть мини-приложение.",
      { reply_markup: webAppButton("🚗 Открыть тренажёр", "/") },
    );
  });

  bot.command("practice", async (ctx) => {
    await upsertUser(ctx);
    await ctx.reply("Запускаем тренировку:", {
      reply_markup: webAppButton("🏋️ Тренировка", "/practice"),
    });
  });

  bot.command("exam", async (ctx) => {
    await upsertUser(ctx);
    await ctx.reply("Пробный экзамен на 40 вопросов:", {
      reply_markup: webAppButton("📝 Экзамен", "/exam"),
    });
  });

  bot.command("settings", async (ctx) => {
    await upsertUser(ctx);
    await ctx.reply("Настройки напоминаний и языка:", {
      reply_markup: webAppButton("⚙️ Настройки", "/settings"),
    });
  });

  bot.command("status", async (ctx) => {
    const user = await upsertUser(ctx);
    if (!user) return;
    const total = await prisma.attempt.count({ where: { userId: user.id } });
    const correct = await prisma.attempt.count({ where: { userId: user.id, isCorrect: true } });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await prisma.attempt.count({
      where: { userId: user.id, answeredAt: { gte: today } },
    });
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    await ctx.reply(
      `📊 Твой прогресс:\n` +
        `• Решено сегодня: ${todayCount}\n` +
        `• Всего попыток: ${total}\n` +
        `• Точность: ${accuracy}%`,
    );
  });

  bot.catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[bot error]", err);
  });
}

export async function sendReminderTo(chatId: bigint | number) {
  const bot = getBot();
  const kb = new InlineKeyboard()
    .webApp("🏋️ Тренировка", webAppUrl("/practice"))
    .webApp("📝 Экзамен", webAppUrl("/exam"));
  await bot.api.sendMessage(
    Number(chatId),
    "Пора потренироваться 🚗\nСегодня цель: 20 вопросов или 1 тестовый экзамен.",
    { reply_markup: kb },
  );
}
