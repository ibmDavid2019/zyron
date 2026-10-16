import { formatSplitSummary, STRENGTH_SPLITS } from "@/constants/strength-workouts";
import { DEFAULT_ACTIVE_PLAN_ID } from "@/features/training-plans/training-plans-page";
import { CURRENT_USER, MOCK_TRAINING_PLANS, WEEKLY_TRAINING_PLAN } from "@/lib/mock-data";
import type { TrainingLevel, TrainingPlan } from "@/types/training-plan";
import { aggregateStats, getWeeklySummary } from "@/utils/activity-stats";
import { formatDistance } from "@/utils/format";
import {
  getActivePlanId,
  getPlanOverrides,
  getSavedActivities,
  getWeeklyPlanOverride,
  saveWeeklyPlanOverride,
  setActivePlanId,
} from "@/utils/local-store";

/** The plan the user is already on (or the app's default), so the AI can reference it instead of assuming nothing's chosen yet — null only when the user explicitly deactivated their plan. */
function resolveActivePlan(): TrainingPlan | null {
  const storedId = getActivePlanId();
  if (storedId === null) return null;
  const id = storedId ?? DEFAULT_ACTIVE_PLAN_ID;
  const plan = MOCK_TRAINING_PLANS.find((p) => p.id === id);
  if (!plan) return null;
  return { ...plan, ...getPlanOverrides()[id] };
}

export const QUICK_QUESTIONS = [
  "Como está minha evolução?",
  "Crie um treino de musculação nível intermediário.",
  "Quero correr 5 km.",
  "Analise meu desempenho.",
  "Mude meu plano para 10k.",
];

export interface AssistantResult {
  reply: string;
  /** Set when the message triggered a real change to the user's active training plan. */
  activatedPlan?: TrainingPlan;
  /** Set when the message added/replaced a day in the weekly plan. */
  weeklyPlanChanged?: boolean;
}

function matches(text: string, ...keywords: string[]) {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

// "Add a workout to my schedule" verbs — distinct from "switch/change" verbs
// below, which mean "give me a different overall plan" instead. Someone
// asking to CREATE something isn't asking to REPLACE their whole plan.
const WORKOUT_ACTION_TRIGGERS = [
  "criar treino",
  "crie um treino",
  "crie o treino",
  "monte um treino",
  "montar treino",
  "adicionar treino",
  "adicione um treino",
  "quero um treino de",
  "quero um treino para",
  "quero fazer um treino de",
];

const STRENGTH_KEYWORDS = ["musculação", "muscula", "academia", "força", "forca", "hipertrofia", "peso", "levantamento", "gym", "full body"];

/** Which multi-week TrainingPlan corresponds to the musculação split at each level — exported so the day-detail view (ai-context-panel.tsx) can tell which level's exercise list to show for a strength day when the user has one of these plans active. */
export const STRENGTH_PLAN_IDS: Record<TrainingLevel, string> = {
  Iniciante: "tp6",
  Intermediário: "tp7",
  Avançado: "tp8",
};

function findLevel(text: string): TrainingLevel | null {
  const lower = text.toLowerCase();
  if (matches(lower, "avançado", "avancado")) return "Avançado";
  if (matches(lower, "intermediário", "intermediario")) return "Intermediário";
  if (matches(lower, "iniciante")) return "Iniciante";
  return null;
}

/** Fills whatever rest days exist in the weekly plan with the A/B/C split for the given level, in order. */
function tryCreateWorkout(text: string): AssistantResult | null {
  if (!matches(text, ...WORKOUT_ACTION_TRIGGERS)) return null;

  if (!matches(text, ...STRENGTH_KEYWORDS)) {
    return {
      reply: 'Consigo montar um treino de musculação pra você, dividido em A/B/C — é só pedir algo como "crie um treino de musculação nível iniciante". Outros tipos de treino de força chegam em breve!',
    };
  }

  // Falls back to the level of whatever strength plan is already active
  // (rather than always "Iniciante") so "crie um treino de musculação"
  // matches the program the user is actually on.
  const activePlan = resolveActivePlan();
  const activeLevelFallback = activePlan && STRENGTH_PLAN_IDS[activePlan.level] === activePlan.id ? activePlan.level : "Iniciante";
  const level = findLevel(text) ?? activeLevelFallback;
  const split = STRENGTH_SPLITS[level];

  const currentPlan = getWeeklyPlanOverride() ?? WEEKLY_TRAINING_PLAN;
  const restDays = currentPlan.filter((d) => d.isRest);
  const nextPlan = currentPlan.map((day) => {
    const splitIndex = restDays.findIndex((d) => d.day === day.day);
    if (splitIndex === -1 || splitIndex >= split.length) return day;
    const splitDay = split[splitIndex];
    return { ...day, activity: `Musculação ${splitDay.key} (${splitDay.focus})`, isRest: false, level };
  });
  saveWeeklyPlanOverride(nextPlan);

  return {
    reply: `Prontinho! Montei seu treino de musculação nível ${level}, dividido em A/B/C nos seus dias de descanso: ${formatSplitSummary(level)}`,
    weeklyPlanChanged: true,
  };
}

// Distinctive words/phrases that identify each plan regardless of exact
// wording — lets "quero um plano de 10k" and "plano performance" both match.
// Deliberately excludes bare level words like "iniciante" — those alone are
// too generic (several plans target beginners) and would win a match before
// a more specific plan is even considered.
const PLAN_KEYWORDS: Record<string, string[]> = {
  tp1: ["5k", "5 km", "primeiros 5"],
  tp2: ["10k", "10 km", "performance"],
  tp3: ["resistência", "resistencia", "volume", "construção", "construcao"],
  tp4: ["21k", "21 km", "meia maratona", "sub-2h", "sub 2h"],
  tp5: ["ciclismo", "pedal", "bike", "50k"],
};

function findMatchingPlan(text: string): TrainingPlan | null {
  const lower = text.toLowerCase();

  // Musculação has one plan per level — disambiguate by level keyword,
  // defaulting to Iniciante when none is given.
  if (STRENGTH_KEYWORDS.some((k) => lower.includes(k))) {
    const level = findLevel(text) ?? "Iniciante";
    return MOCK_TRAINING_PLANS.find((p) => p.id === STRENGTH_PLAN_IDS[level]) ?? null;
  }

  const id = Object.keys(PLAN_KEYWORDS).find((planId) => PLAN_KEYWORDS[planId].some((k) => lower.includes(k)));
  return MOCK_TRAINING_PLANS.find((p) => p.id === id) ?? null;
}

/**
 * Rule-based canned replies keyed by keyword. Stands in for a real LLM call
 * until the Zyron AI backend is wired up.
 */
export function getAssistantReply(userMessage: string): AssistantResult {
  const realActivities = getSavedActivities();
  const week = getWeeklySummary(realActivities);
  const weeklyKm = week.reduce((sum, d) => sum + d.distanceKm, 0);
  const stats = aggregateStats(realActivities);

  const workoutResult = tryCreateWorkout(userMessage);
  if (workoutResult) return workoutResult;

  // Any "switch/change" phrasing means the same thing whether the user says
  // "treino" or "plano" — they want a different overall program. Covers both
  // words so "trocar meu treino para 10k" isn't missed just because it says
  // "treino" instead of "plano" (that used to fall through to
  // tryCreateWorkout's musculação-only handling above and get brushed off).
  if (
    matches(
      userMessage,
      "mudar plano",
      "mude meu plano",
      "mudar meu plano",
      "trocar de plano",
      "troque meu plano",
      "trocar plano",
      "troca meu plano",
      "muda meu plano",
      "ativar plano",
      "quero o plano",
      "quero um plano",
      "quero outro plano",
      "mudar de plano",
      "criar plano",
      "crie um plano",
      "crie o plano",
      "crie plano",
      "montar plano",
      "monte um plano",
      "monte o plano",
      "faça um plano",
      "faca um plano",
      "fazer um plano",
      "novo plano",
      "define o plano",
      "define meu plano",
      "definir plano",
      "escolhi o plano",
      "plano que escolhi",
      "mudar treino",
      "mude meu treino",
      "mudar meu treino",
      "muda meu treino",
      "troca meu treino",
      "trocar treino",
      "trocar meu treino",
      "trocar de treino",
      "troque o treino",
      "troque meu treino",
      "quero outro treino",
      "define o treino",
      "define meu treino",
      "definir treino",
      "definir meu treino"
    )
  ) {
    const currentPlan = resolveActivePlan();
    const plan = findMatchingPlan(userMessage);
    if (plan) {
      setActivePlanId(plan.id);
      const switchNote = currentPlan && currentPlan.id !== plan.id ? `Troquei do plano "${currentPlan.name}" para` : "Ativei";
      return {
        reply: `Prontinho! ${switchNote} o plano "${plan.name}" (${plan.goal} · ${plan.level}, ${plan.durationWeeks} semanas, ${plan.sessionsPerWeek}x por semana). Você pode acompanhar em Planos de Treino.`,
        activatedPlan: plan,
      };
    }
    const currentNote = currentPlan ? ` Você está com o plano "${currentPlan.name}" ativo agora.` : "";
    return {
      reply: `Temos estes planos disponíveis: ${MOCK_TRAINING_PLANS.map((p) => `"${p.name}"`).join(", ")}.${currentNote} Me diga qual deles (ou algo como "10k", "ciclismo" ou "musculação avançado") que eu ativo.`,
    };
  }

  if (matches(userMessage, "evolução", "evoluç", "progresso")) {
    return {
      reply: `Você já percorreu ${formatDistance(stats.distanceKm)} em ${stats.count} atividades e mantém uma sequência de ${CURRENT_USER.streakDays} dias. 📈 Nesta semana você já somou ${formatDistance(weeklyKm)} — continue nesse ritmo para subir de nível!`,
    };
  }

  if (matches(userMessage, "5 km", "5km", "correr 5")) {
    return {
      reply: "Ótimo objetivo! Comece com 1 km de aquecimento em ritmo leve, depois 3 km em ritmo confortável e finalize com 1 km soltando as pernas. Hidrate-se bem antes e depois do treino.",
    };
  }

  if (matches(userMessage, "desempenho", "performance")) {
    return {
      reply: `Seu ritmo médio recente está em torno de 6:00/km, com melhora consistente nas últimas semanas. Seu ponto forte é a regularidade — ${stats.count} atividades registradas. Considere variar a intensidade com um treino intervalado por semana.`,
    };
  }

  if (matches(userMessage, "treino", "plano")) {
    const currentWeek = getWeeklyPlanOverride() ?? WEEKLY_TRAINING_PLAN;
    const next = currentWeek.find((d) => !d.isRest);
    const activePlan = resolveActivePlan();
    const planNote = activePlan ? ` Seu plano ativo é "${activePlan.name}" (${activePlan.goal}).` : "";
    return {
      reply: `Baseado no seu plano semanal, seu próximo treino é "${next?.activity ?? "Corrida leve"}".${planNote} Quer que eu ajuste a intensidade, crie um treino de musculação, ou prefere trocar de plano inteiro? É só pedir, por exemplo "trocar meu treino para 10k" ou "crie um treino de musculação para academia".`,
    };
  }

  if (matches(userMessage, "descanso", "cansad", "dor")) {
    return {
      reply: "Descanso também é treino! Se você está sentindo fadiga ou dor, considere um dia de recuperação ativa (caminhada leve) e priorize o sono. Se a dor persistir, procure orientação de um profissional de saúde.",
    };
  }

  return {
    reply: "Entendido! Vou levar isso em conta nas suas próximas recomendações. Quer que eu sugira um treino para hoje ou prefere ver sua evolução da semana?",
  };
}
