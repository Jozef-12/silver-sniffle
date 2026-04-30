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
    finishSub: f.stats.submissionOffense * 0.95 + f.stats.grappling * 0.5 + f.stats.wrestling * 0.2,
    chin: f.stats.chin,
    submissionDefense: f.stats.submissionDefense
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

    const playerKoRoll = Math.random();
    const oppKoRoll = Math.random();
    const playerSubRoll = Math.random();
    const oppSubRoll = Math.random();

    const finishEvents = [];

    if (playerKoRoll < playerKoChance) {
      finishEvents.push({
        winner: player.name,
        loser: opponent.name,
        method: "KO/TKO",
        narrative: `Round ${round}: ${player.name} found the finish with heavy strikes.`,
        chance: playerKoChance,
        roll: playerKoRoll,
        iq: player.stats.fightIQ,
        roundScoreEdge: pScore - oScore
      });
    }

    if (oppKoRoll < oppKoChance) {
      finishEvents.push({
        winner: opponent.name,
        loser: player.name,
        method: "KO/TKO",
        narrative: `Round ${round}: ${opponent.name} dropped ${player.name} for a stoppage.`,
        chance: oppKoChance,
        roll: oppKoRoll,
        iq: opponent.stats.fightIQ,
        roundScoreEdge: oScore - pScore
      });
    }

    if (playerSubRoll < playerSubChance) {
      finishEvents.push({
        winner: player.name,
        loser: opponent.name,
        method: "Submission",
        narrative: `Round ${round}: ${player.name} locked in a fight-ending submission.`,
        chance: playerSubChance,
        roll: playerSubRoll,
        iq: player.stats.fightIQ,
        roundScoreEdge: pScore - oScore
      });
    }

    if (oppSubRoll < oppSubChance) {
      finishEvents.push({
        winner: opponent.name,
        loser: player.name,
        method: "Submission",
        narrative: `Round ${round}: ${opponent.name} forced a tap after a scramble.`,
        chance: oppSubChance,
        roll: oppSubRoll,
        iq: opponent.stats.fightIQ,
        roundScoreEdge: oScore - pScore
      });
    }

    if (finishEvents.length) {
      finishEvents.sort((a, b) => {
        const marginA = a.chance - a.roll;
        const marginB = b.chance - b.roll;
        const scoreA = marginA * 100 + a.iq * 0.22 + a.roundScoreEdge * 0.55 + Math.random() * 3;
        const scoreB = marginB * 100 + b.iq * 0.22 + b.roundScoreEdge * 0.55 + Math.random() * 3;
        return scoreB - scoreA;
      });

      const chosenFinish = finishEvents[0];
      return {
        winner: chosenFinish.winner,
        loser: chosenFinish.loser,
        method: chosenFinish.method,
        round,
        summary: [...summary, chosenFinish.narrative]
      };
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


export function runFightSimDiagnostics(player, opponent, iterations = 5000) {
  const outcomes = {
    playerKo: 0,
    opponentKo: 0,
    playerSub: 0,
    opponentSub: 0,
    decisions: 0,
    draws: 0,
    nanFinishChances: 0,
    coverage: {
      playerKoWinsOccur: false,
      opponentKoWinsOccur: false,
      playerSubmissionWinsOccur: false,
      opponentSubmissionWinsOccur: false,
      decisionsOccur: false
    }
  };

  for (let i = 0; i < iterations; i += 1) {
    for (let round = 1; round <= 3; round += 1) {
      const p = perf(player, round);
      const o = perf(opponent, round);
      const chances = [
        finishChance(p, o, "ko", round),
        finishChance(o, p, "ko", round),
        finishChance(p, o, "sub", round),
        finishChance(o, p, "sub", round)
      ];
      if (chances.some((chance) => Number.isNaN(chance))) outcomes.nanFinishChances += 1;
    }

    const result = simulateFight(player, opponent);
    if (result.method === "KO/TKO") {
      if (result.winner === player.name) outcomes.playerKo += 1;
      else if (result.winner === opponent.name) outcomes.opponentKo += 1;
    } else if (result.method === "Submission") {
      if (result.winner === player.name) outcomes.playerSub += 1;
      else if (result.winner === opponent.name) outcomes.opponentSub += 1;
    } else if (result.method === "Decision") {
      outcomes.decisions += 1;
    } else if (result.method === "Draw") {
      outcomes.draws += 1;
    }
  }

  outcomes.coverage.playerKoWinsOccur = outcomes.playerKo > 0;
  outcomes.coverage.opponentKoWinsOccur = outcomes.opponentKo > 0;
  outcomes.coverage.playerSubmissionWinsOccur = outcomes.playerSub > 0;
  outcomes.coverage.opponentSubmissionWinsOccur = outcomes.opponentSub > 0;
  outcomes.coverage.decisionsOccur = outcomes.decisions > 0;

  return outcomes;
}
