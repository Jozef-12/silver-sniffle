const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function perf(f, round) {
  const fatiguePenalty = (100 - f.condition) * 0.25 + (round - 1) * Math.max(0, 4 - f.stats.cardio / 30);
  const injuryPenalty = f.injuries?.length ? 5 : 0;
  return {
    striking: f.stats.striking + f.stats.speed + f.stats.power * 0.6 - fatiguePenalty - injuryPenalty,
    grappling: f.stats.wrestling + f.stats.grappling + f.stats.submissionOffense * 0.5 - fatiguePenalty - injuryPenalty,
    defense: f.stats.defense + f.stats.chin + f.stats.submissionDefense * 0.5 + f.stats.fightIQ * 0.5,
    finishKO: f.stats.power * 0.8 + f.stats.striking * 0.4 - f.stats.chin * 0.2,
    finishSub: f.stats.submissionOffense * 0.9 + f.stats.grappling * 0.5 - f.stats.submissionDefense * 0.2
  };
}

export function simulateFight(player, opponent) {
  let playerRounds = 0; let oppRounds = 0;
  const summary = [];
  for (let round = 1; round <= 3; round += 1) {
    const p = perf(player, round); const o = perf(opponent, round);
    const pScore = p.striking * 0.45 + p.grappling * 0.35 + p.defense * 0.2 + Math.random() * 12;
    const oScore = o.striking * 0.45 + o.grappling * 0.35 + o.defense * 0.2 + Math.random() * 12;

    const playerKoChance = clamp((p.finishKO - o.defense) / 180, 0.01, 0.25);
    const playerSubChance = clamp((p.finishSub - o.defense) / 190, 0.01, 0.2);
    const oppKoChance = clamp((o.finishKO - p.defense) / 180, 0.01, 0.25);
    const oppSubChance = clamp((o.finishSub - p.defense) / 190, 0.01, 0.2);

    if (Math.random() < playerKoChance) return { winner: player.name, loser: opponent.name, method: "KO/TKO", round, summary: [...summary, `Round ${round}: ${player.name} landed a fight-ending combination.`] };
    if (Math.random() < playerSubChance) return { winner: player.name, loser: opponent.name, method: "Submission", round, summary: [...summary, `Round ${round}: ${player.name} secured a submission after grappling exchanges.`] };
    if (Math.random() < oppKoChance) return { winner: opponent.name, loser: player.name, method: "KO/TKO", round, summary: [...summary, `Round ${round}: ${opponent.name} landed a fight-ending combination.`] };
    if (Math.random() < oppSubChance) return { winner: opponent.name, loser: player.name, method: "Submission", round, summary: [...summary, `Round ${round}: ${opponent.name} secured a submission after grappling exchanges.`] };

    if (pScore > oScore) {
      playerRounds += 1;
      summary.push(`Round ${round}: ${player.name} controlled most exchanges.`);
    } else {
      oppRounds += 1;
      summary.push(`Round ${round}: ${opponent.name} took the round with cleaner work.`);
    }
  }
  if (playerRounds === oppRounds) return { winner: null, loser: null, method: "Draw", round: 3, summary };
  return playerRounds > oppRounds
    ? { winner: player.name, loser: opponent.name, method: "Decision", round: 3, summary }
    : { winner: opponent.name, loser: player.name, method: "Decision", round: 3, summary };
}
