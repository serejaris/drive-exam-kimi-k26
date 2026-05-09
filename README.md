<!-- hq-readme-ru: 2026-05-09 -->
# drive-exam-kimi-k26

Коротко: Прототип по подготовке к экзамену на вождение CABA.

## Что здесь

- Назначение: Прототип по подготовке к экзамену на вождение CABA.
- Основной стек: TypeScript.
- Видимость: публичный репозиторий.
- Статус: активный репозиторий; актуальность проверять по issues и последним коммитам.

## Где смотреть работу

- Задачи и текущие решения: GitHub Issues этого репозитория.
- Код и материалы: файлы в корне и профильные папки проекта.
- Связь с HQ: если проект влияет на продукт, контент или воронку, сверяйте канон в `0_hq` и репозитории-владельце.

## Для агентов

- Сначала прочитайте этот README и открытые issues.
- Не переносите сюда канон соседних проектов без ссылки на источник.
- Перед правками проверьте существующие scripts, package.json/pyproject и локальные инструкции.

---

## Исходный README

# drive-exam-kimi-k26

Telegram Mini App для подготовки к экзамену на водительские права CABA. Это одна из шести параллельных реализаций одного PRD, собранная моделью Kimi K2.6 для live-проверки китайских моделей 24 апреля 2026.

## Контекст

- Модель под тестом: Kimi K2.6 (Moonshot AI).
- Бот: [@kimi_k26_ris_bot](https://t.me/kimi_k26_ris_bot).
- Live surface: [live.sereja.tech/chinese-models](https://live.sereja.tech/chinese-models/).
- Канонический PRD: `docs/PRD.md`, зеркало из `serejaris/tg-drive-exam`.

## Что делает приложение

- Авторизация через Telegram `initData`.
- Тренировочные вопросы CABA на испанском/русском.
- Сессии прохождения теста, ответы, результаты.
- Напоминания через Telegram bot / cron.
- Railway deploy с Postgres и Prisma.

## Стек

- Next.js 15 App Router + TypeScript + Tailwind v3.
- grammY для Telegram webhook.
- Prisma + Railway Postgres.
- HMAC-SHA256 проверка Telegram `initData`.

## Как запустить локально

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Локально: `http://localhost:3000`. Для webhook нужен публичный HTTPS tunnel.

## Для агента

Это сравнительный prototype repo, а не единый канон продукта. Перед изменениями сравни scope с `docs/PRD.md` и открытым issue `#1`. Не переносить выводы из этой реализации в другие `drive-exam-*` репозитории без явной сверки.