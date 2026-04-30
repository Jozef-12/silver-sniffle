import { STAT_KEYS } from "./constants";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export function createBaseStats(style) {
  const stats = Object.fromEntries(STAT_KEYS.map((k) => [k, 50]));
  if (style === "Striker") { stats.striking += 12; stats.speed += 8; }
  if (style === "Wrestler") { stats.wrestling += 12; stats.cardio += 7; }
  if (style === "Grappler") { stats.grappling += 12; stats.submissionOffense += 8; }
  if (style === "Balanced") { stats.fightIQ += 6; stats.defense += 6; }
  STAT_KEYS.forEach((k) => { stats[k] = clamp(stats[k], 35, 75); });
  return stats;
}

export function createFighter({ name, age, weightClass, style }) {
  const startingAge = Number(age);
  return {
    id: crypto.randomUUID(),
    name,
    age: startingAge,
    startingAge,
    weightClass,
    style,
    stats: createBaseStats(style),
    record: { wins: 0, losses: 0, draws: 0, koWins: 0, submissionWins: 0, decisionWins: 0, koLosses: 0, submissionLosses: 0, decisionLosses: 0 },
    money: 1000,
    fame: 1,
    ranking: 50,
    currentPromotion: "Regional Circuit",
    condition: 100,
    injuries: [],
    injuryStatus: "Healthy",
    careerWeek: 1,
    history: []
  };
}
