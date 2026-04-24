/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedOption = { id: string; text_es: string; text_ru: string };
type SeedQuestion = {
  id: string;
  jurisdiction: string;
  license_classes: string[];
  category: string;
  question_es: string;
  question_ru: string;
  type: "single_choice" | "multiple_choice" | "true_false";
  options: SeedOption[];
  correct_option_ids: string[];
  media?: { type: "image"; url: string } | null;
  explanation_ru?: string | null;
  source?: { title: string; url: string; retrieved_at: string };
};

const QUESTIONS: SeedQuestion[] = [
  {
    id: "ar-caba-b-001",
    jurisdiction: "CABA",
    license_classes: ["B"],
    category: "seniales",
    question_es: "¿Qué indica esta señal de tránsito?",
    question_ru: "Что означает этот дорожный знак?",
    type: "single_choice",
    options: [
      { id: "a", text_es: "Cruce de peatones.", text_ru: "Пешеходный переход." },
      { id: "b", text_es: "Prohibido estacionar.", text_ru: "Остановка запрещена." },
      { id: "c", text_es: "Ceda el paso.", text_ru: "Уступите дорогу." },
      { id: "d", text_es: "Curva peligrosa.", text_ru: "Опасный поворот." },
    ],
    correct_option_ids: ["a"],
    media: {
      type: "image",
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Argentina_road_sign_P-11a.svg/240px-Argentina_road_sign_P-11a.svg.png",
    },
    explanation_ru: "Треугольный знак с пешеходом предупреждает о нерегулируемом пешеходном переходе.",
    source: { title: "CABA Manual del Conductor", url: "https://buenosaires.gob.ar/", retrieved_at: "2026-04-24" },
  },
  {
    id: "ar-caba-b-002",
    jurisdiction: "CABA",
    license_classes: ["B"],
    category: "seniales",
    question_es: "¿Qué significa una señal octogonal roja con la palabra 'PARE'?",
    question_ru: "Что означает красный восьмиугольный знак со словом «PARE»?",
    type: "single_choice",
    options: [
      { id: "a", text_es: "Ceder el paso sin detenerse.", text_ru: "Уступить дорогу без остановки." },
      { id: "b", text_es: "Detención obligatoria.", text_ru: "Обязательная остановка." },
      { id: "c", text_es: "Prohibido girar.", text_ru: "Поворот запрещён." },
      { id: "d", text_es: "Fin de la vía.", text_ru: "Конец дороги." },
    ],
    correct_option_ids: ["b"],
    media: {
      type: "image",
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Argentina_road_sign_R-1.svg/240px-Argentina_road_sign_R-1.svg.png",
    },
    explanation_ru: "Знак PARE — аналог международного STOP. Требует полной остановки перед перекрёстком.",
    source: { title: "CABA Manual del Conductor", url: "https://buenosaires.gob.ar/", retrieved_at: "2026-04-24" },
  },
  {
    id: "ar-caba-b-003",
    jurisdiction: "CABA",
    license_classes: ["B"],
    category: "normas",
    question_es: "¿Cuál es la velocidad máxima en calles urbanas de CABA, salvo señalización específica?",
    question_ru: "Какова максимальная скорость на городских улицах CABA без отдельных знаков?",
    type: "single_choice",
    options: [
      { id: "a", text_es: "20 km/h", text_ru: "20 км/ч" },
      { id: "b", text_es: "40 km/h", text_ru: "40 км/ч" },
      { id: "c", text_es: "60 km/h", text_ru: "60 км/ч" },
      { id: "d", text_es: "80 km/h", text_ru: "80 км/ч" },
    ],
    correct_option_ids: ["b"],
    explanation_ru: "На обычных городских улицах лимит — 40 км/ч (Ley Nacional de Tránsito).",
    source: { title: "Ley 24.449", url: "https://servicios.infoleg.gob.ar/", retrieved_at: "2026-04-24" },
  },
  {
    id: "ar-caba-b-004",
    jurisdiction: "CABA",
    license_classes: ["B"],
    category: "normas",
    question_es: "¿Qué tasa de alcohol en sangre está permitida para conductores particulares en CABA?",
    question_ru: "Какой уровень алкоголя в крови разрешён частным водителям в CABA?",
    type: "single_choice",
    options: [
      { id: "a", text_es: "0,0 g/L (tolerancia cero).", text_ru: "0,0 г/л (нулевая терпимость)." },
      { id: "b", text_es: "0,5 g/L", text_ru: "0,5 г/л" },
      { id: "c", text_es: "0,8 g/L", text_ru: "0,8 г/л" },
      { id: "d", text_es: "1,0 g/L", text_ru: "1,0 г/л" },
    ],
    correct_option_ids: ["a"],
    explanation_ru: "В CABA действует alcohol cero: любое обнаружение алкоголя запрещено.",
    source: { title: "Ley 6.024 CABA", url: "https://buenosaires.gob.ar/", retrieved_at: "2026-04-24" },
  },
  {
    id: "ar-caba-b-005",
    jurisdiction: "CABA",
    license_classes: ["B"],
    category: "prioridad",
    question_es: "En una intersección sin semáforos ni señales, ¿quién tiene prioridad?",
    question_ru: "На перекрёстке без светофоров и знаков — у кого приоритет?",
    type: "single_choice",
    options: [
      { id: "a", text_es: "El vehículo que viene por la izquierda.", text_ru: "Транспорт, движущийся слева." },
      { id: "b", text_es: "El vehículo que viene por la derecha.", text_ru: "Транспорт, движущийся справа." },
      { id: "c", text_es: "El vehículo más grande.", text_ru: "Более крупный транспорт." },
      { id: "d", text_es: "El que llegó primero.", text_ru: "Тот, кто приехал первым." },
    ],
    correct_option_ids: ["b"],
    explanation_ru: "Общее правило Аргентины: приоритет имеет транспорт, подъезжающий справа.",
    source: { title: "Ley 24.449 art. 41", url: "https://servicios.infoleg.gob.ar/", retrieved_at: "2026-04-24" },
  },
  {
    id: "ar-caba-b-006",
    jurisdiction: "CABA",
    license_classes: ["B"],
    category: "seniales",
    question_es: "¿Qué indica una línea amarilla continua en el centro de la calzada?",
    question_ru: "Что обозначает сплошная жёлтая линия по центру проезжей части?",
    type: "single_choice",
    options: [
      { id: "a", text_es: "Permitido adelantar con precaución.", text_ru: "Обгон разрешён с осторожностью." },
      { id: "b", text_es: "Prohibido cruzarla para adelantar.", text_ru: "Пересекать для обгона запрещено." },
      { id: "c", text_es: "Carril exclusivo para taxis.", text_ru: "Полоса только для такси." },
      { id: "d", text_es: "Zona escolar.", text_ru: "Школьная зона." },
    ],
    correct_option_ids: ["b"],
    explanation_ru: "Сплошная жёлтая = разделитель встречных потоков, пересекать запрещено.",
    source: { title: "CABA Manual del Conductor", url: "https://buenosaires.gob.ar/", retrieved_at: "2026-04-24" },
  },
  {
    id: "ar-caba-b-007",
    jurisdiction: "CABA",
    license_classes: ["B"],
    category: "documentos",
    question_es: "¿Qué documentos debe portar obligatoriamente el conductor?",
    question_ru: "Какие документы водитель обязан иметь при себе?",
    type: "single_choice",
    options: [
      { id: "a", text_es: "Solo licencia de conducir.", text_ru: "Только водительское удостоверение." },
      { id: "b", text_es: "Licencia, cédula verde/azul, seguro y VTV.", text_ru: "Удостоверение, cédula verde/azul, страховка и VTV." },
      { id: "c", text_es: "Solo el seguro.", text_ru: "Только страховку." },
      { id: "d", text_es: "Licencia y pasaporte.", text_ru: "Удостоверение и паспорт." },
    ],
    correct_option_ids: ["b"],
    explanation_ru: "Минимальный набор: licencia, cédula (verde/azul), seguro vigente, VTV.",
    source: { title: "Ley 24.449 art. 40", url: "https://servicios.infoleg.gob.ar/", retrieved_at: "2026-04-24" },
  },
  {
    id: "ar-caba-b-008",
    jurisdiction: "CABA",
    license_classes: ["B"],
    category: "seguridad",
    question_es: "¿Cuándo es obligatorio el uso del cinturón de seguridad?",
    question_ru: "Когда обязательно использование ремня безопасности?",
    type: "single_choice",
    options: [
      { id: "a", text_es: "Solo en rutas y autopistas.", text_ru: "Только на трассах и автомагистралях." },
      { id: "b", text_es: "Solo el conductor.", text_ru: "Только водитель." },
      { id: "c", text_es: "Todos los ocupantes, en toda la circulación.", text_ru: "Все пассажиры, всегда при движении." },
      { id: "d", text_es: "Solo si se viaja a más de 60 km/h.", text_ru: "Только на скорости выше 60 км/ч." },
    ],
    correct_option_ids: ["c"],
    explanation_ru: "Ремень обязателен для всех пассажиров в любой момент движения автомобиля.",
    source: { title: "Ley 24.449 art. 40 inc. k", url: "https://servicios.infoleg.gob.ar/", retrieved_at: "2026-04-24" },
  },
  {
    id: "ar-caba-b-009",
    jurisdiction: "CABA",
    license_classes: ["B"],
    category: "prioridad",
    question_es: "¿Tienen prioridad de paso los peatones en la senda peatonal?",
    question_ru: "Имеют ли пешеходы приоритет на пешеходном переходе?",
    type: "true_false",
    options: [
      { id: "a", text_es: "Verdadero.", text_ru: "Верно." },
      { id: "b", text_es: "Falso.", text_ru: "Неверно." },
    ],
    correct_option_ids: ["a"],
    explanation_ru: "Пешеход на senda peatonal всегда имеет приоритет.",
    source: { title: "Ley 24.449", url: "https://servicios.infoleg.gob.ar/", retrieved_at: "2026-04-24" },
  },
  {
    id: "ar-caba-b-010",
    jurisdiction: "CABA",
    license_classes: ["B"],
    category: "seniales",
    question_es: "¿Qué significa un semáforo intermitente en amarillo?",
    question_ru: "Что означает жёлтый мигающий сигнал светофора?",
    type: "single_choice",
    options: [
      { id: "a", text_es: "Detenerse obligatoriamente.", text_ru: "Обязательная остановка." },
      { id: "b", text_es: "Circular con precaución.", text_ru: "Движение с осторожностью." },
      { id: "c", text_es: "Semáforo fuera de servicio, avance rápido.", text_ru: "Светофор выключен, двигаться быстро." },
      { id: "d", text_es: "Zona de obra prohibida.", text_ru: "Запрет на зону работ." },
    ],
    correct_option_ids: ["b"],
    explanation_ru: "Жёлтый мигающий — двигаться с осторожностью, уступать приоритет по общим правилам.",
    source: { title: "CABA Manual del Conductor", url: "https://buenosaires.gob.ar/", retrieved_at: "2026-04-24" },
  },
];

async function main() {
  console.log(`Seeding ${QUESTIONS.length} questions...`);
  for (const q of QUESTIONS) {
    await prisma.question.upsert({
      where: { id: q.id },
      create: {
        id: q.id,
        jurisdiction: q.jurisdiction,
        licenseClass: q.license_classes[0] ?? "B",
        category: q.category,
        questionEs: q.question_es,
        questionRu: q.question_ru,
        type: q.type,
        correctOptionIds: q.correct_option_ids,
        media: q.media ?? undefined,
        explanationRu: q.explanation_ru ?? null,
        source: q.source ?? undefined,
        status: "active",
        options: {
          create: q.options.map((o, i) => ({
            optionId: o.id,
            textEs: o.text_es,
            textRu: o.text_ru,
            sortOrder: i,
          })),
        },
      },
      update: {
        questionEs: q.question_es,
        questionRu: q.question_ru,
        correctOptionIds: q.correct_option_ids,
        media: q.media ?? undefined,
        explanationRu: q.explanation_ru ?? null,
      },
    });
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
