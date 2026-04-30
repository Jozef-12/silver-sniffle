import { STYLES, STAT_KEYS } from "../models/constants";

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }

export function generateOpponent(player, difficulty = 0) {
  const base = 48 + Math.floor(player.fame / 2) + Math.floor((50 - player.ranking) / 4) + difficulty * 4;
  const stats = Object.fromEntries(STAT_KEYS.map((k) => [k, Math.max(35, Math.min(92, base + rand(-8, 8)))]));
  return {
    id: crypto.randomUUID(),
    name: `${pick(["Alex","Jordan","Diego","Marcus","Ivan","Noah"])} ${pick(["Stone","Silva","Reed","Volkov","Kim","Diaz"])}`,
    age: rand(21, 37),
    weightClass: player.weightClass,
    style: pick(STYLES),
    stats,
    record: `${rand(2, 22)}-${rand(0, 8)}-${rand(0, 2)}`,
    ranking: Math.max(1, Math.min(80, player.ranking + rand(-10, 10) - difficulty * 2)),
    difficulty: ["Manageable", "Even", "Tough"][difficulty + 1] || "Even",
    condition: 100,
    injuries: []
  };
}

export function getFightOffers(player) {
  return [generateOpponent(player, -1), generateOpponent(player, 0), generateOpponent(player, 1)];
}
