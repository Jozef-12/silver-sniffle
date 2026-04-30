const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export function syncFighterAge(fighter) {
  const startingAge = Number.isFinite(fighter.startingAge) ? fighter.startingAge : fighter.age;
  fighter.startingAge = startingAge;
  fighter.age = startingAge + Math.floor(Math.max(0, fighter.careerWeek - 1) / 52);
}

function advanceWeek(fighter) {
  fighter.careerWeek += 1;
  syncFighterAge(fighter);
}

export function applyTraining(fighter, option) {
  const changes = [];
  const energyCost = option.energyCost ?? 10;
  const injuries = Array.isArray(fighter.injuries) ? fighter.injuries : [];
  fighter.injuries = injuries;

  if (option.id !== "recovery" && fighter.condition < energyCost) {
    return [`Too exhausted for ${option.label}. Take a recovery week first.`];
  }

  advanceWeek(fighter);

  if (option.id === "recovery") {
    fighter.condition = clamp(fighter.condition + 24, 0, 100);
    if (fighter.injuries.length > 0 && Math.random() < 0.55) {
      fighter.injuries.pop();
      changes.push("A minor injury improved.");
    }
    fighter.injuryStatus = fighter.injuries.length ? "Minor Injury" : "Healthy";
    return ["Recovery week completed: condition restored.", ...changes];
  }

  const injuryPressure = fighter.injuries.length * 0.03;
  const lowEnergyPressure = fighter.condition < 25 ? 0.08 : 0;
  fighter.condition = clamp(fighter.condition - (energyCost + Math.random() * 3), 0, 100);

  const focusGain = 1.1 + Math.random() * 1.6;
  fighter.stats[option.focus] = clamp(fighter.stats[option.focus] + focusGain, 30, 99);
  changes.push(`${option.label}: +${focusGain.toFixed(1)} ${option.focus}`);

  option.secondary?.forEach((stat) => {
    const gain = 0.25 + Math.random() * 0.55;
    fighter.stats[stat] = clamp(fighter.stats[stat] + gain, 30, 99);
    changes.push(`+${gain.toFixed(1)} ${stat}`);
  });

  if (Math.random() < 0.08 + injuryPressure + lowEnergyPressure) {
    fighter.injuries.push("Training strain");
    fighter.condition = clamp(fighter.condition - 8, 0, 100);
    changes.push("Minor training strain suffered.");
  }

  fighter.injuryStatus = fighter.injuries.length ? "Minor Injury" : "Healthy";
  return changes;
}
