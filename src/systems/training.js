const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export function applyTraining(fighter, option) {
  const changes = [];
  fighter.careerWeek += 1;

  if (option.id === "recovery") {
    fighter.condition = clamp(fighter.condition + 20, 0, 100);
    if (fighter.injuries.length > 0 && Math.random() < 0.5) {
      fighter.injuries.pop();
    }
    fighter.injuryStatus = fighter.injuries.length ? "Minor Injury" : "Healthy";
    return ["Recovery week completed: condition restored."];
  }

  fighter.condition = clamp(fighter.condition - (8 + Math.random() * 4), 0, 100);
  const gain = 1 + Math.random() * 2;
  fighter.stats[option.focus] = clamp(fighter.stats[option.focus] + gain, 30, 99);
  changes.push(`${option.label}: +${gain.toFixed(1)} ${option.focus}`);

  if (Math.random() < 0.12) {
    fighter.injuries.push("Training strain");
    fighter.condition = clamp(fighter.condition - 10, 0, 100);
  }
  fighter.injuryStatus = fighter.injuries.length ? "Minor Injury" : "Healthy";
  return changes;
}
