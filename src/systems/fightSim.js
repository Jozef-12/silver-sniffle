const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function perf(f, round) {
  const cardioTax = Math.max(0, 62 - f.stats.cardio);
  const lateRoundScale = 0.15 + Math.max(0, round - 1) * 0.35;
  const fatiguePenalty = (100 - f.condition) * 0.22 + cardioTax * lateRoundScale;
  const injuryPenalty = f.injuries?.length ? 4 + f.injuries.length * 1.5 : 0;

  return {
    striking: f.stats.striking + f.stats.speed * 0.7 + f.stats.power * 0.55 - fatiguePenalty - injuryPenalty,
    grappling: f.stats.wrestling + f.stats.grappling + f.stats.submissionOffense * 0.45 - fatiguePenalty - injuryPenalty,
    defense: f.stats.defense + f.stats.chin * 0.5 + f.stats.submissionDefense * 0.55 + f.stats.fightIQ * 0.6,
    finishKO: f.stats.power * 0.9 + f.stats.striking * 0.5 + f.stats.speed * 0.2,
    finishSub: f.stats.submissionOffense * 0.95 + f.stats.grappling * 0.5 + f.stats.wrestling * 0.2
  };
}

function finishChance(attacker, defender, type, round) {
  const lateRoundBonus = round >= 2 ? round * 0.01 : 0;
  if (type === "ko") {
    const edge = attacker.finishKO - (defender.defense + defender.chin * 0.3);
    return clamp(0.015 + edge / 260 + lateRoundBonus, 0.01, 0.24);
  }

  const edge = attacker.finishSub - (defender.defense + defender.submissionDefense * 0.25);
  return clamp(0.012 + edge / 275 + lateRoundBonus, 0.01, 0.2);
}

export function simulateFight(player, opponent) {
  let playerRounds = 0;
  let oppRounds = 0;
  const summary = [];

  for (let round = 1; round <= 3; round += 1) {
    const p = perf(player, round);
    const o = perf(opponent, round);

    const pScore = p.striking * 0.44 + p.grappling * 0.33 + p.defense * 0.23 + Math.random() * 10;
    const oScore = o.striking * 0.44 + o.grappling * 0.33 + o.defense * 0.23 + Math.random() * 10;

    const playerKoChance = finishChance(p, o, "ko", round);
    const oppKoChance = finishChance(o, p, "ko", round);
    const playerSubChance = finishChance(p, o, "sub", round);
    const oppSubChance = finishChance(o, p, "sub", round);

    const playerFinishRoll = Math.random();
    const oppFinishRoll = Math.random();

    if (playerFinishRoll < playerKoChance) {
      return { winner: player.name, loser: opponent.name, method: "KO/TKO", round, summary: [...summary, `Round ${round}: ${player.name} found the finish with heavy strikes.`] };
    }
    if (oppFinishRoll < oppKoChance) {
      return { winner: opponent.name, loser: player.name, method: "KO/TKO", round, summary: [...summary, `Round ${round}: ${opponent.name} dropped ${player.name} for a stoppage.`] };
    }
    if (playerFinishRoll < playerSubChance) {
      return { winner: player.name, loser: opponent.name, method: "Submission", round, summary: [...summary, `Round ${round}: ${player.name} locked in a fight-ending submission.`] };
    }
    if (oppFinishRoll < oppSubChance) {
      return { winner: opponent.name, loser: player.name, method: "Submission", round, summary: [...summary, `Round ${round}: ${opponent.name} forced a tap after a scramble.`] };
    }

    if (pScore > oScore) {
      playerRounds += 1;
      summary.push(`Round ${round}: ${player.name} won the exchanges.`);
    } else {
      oppRounds += 1;
      summary.push(`Round ${round}: ${opponent.name} edged the round.`);
    }
  }

  if (playerRounds === oppRounds) return { winner: null, loser: null, method: "Draw", round: 3, summary };

  return playerRounds > oppRounds
    ? { winner: player.name, loser: opponent.name, method: "Decision", round: 3, summary }
    : { winner: opponent.name, loser: player.name, method: "Decision", round: 3, summary };
}
