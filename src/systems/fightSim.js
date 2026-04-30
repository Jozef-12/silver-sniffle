const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function stat(f, key, fallback = 50) {
  const value = f.stats?.[key];
  return Number.isFinite(value) ? value : fallback;
}

function perf(f, round) {
  const condition = Number.isFinite(f.condition) ? f.condition : 100;
  const injuries = Array.isArray(f.injuries) ? f.injuries : [];
  const cardioTax = Math.max(0, 65 - stat(f, "cardio"));
  const lateRoundScale = 0.2 + Math.max(0, round - 1) * 0.45;
  const fatiguePenalty = (100 - condition) * 0.28 + cardioTax * lateRoundScale;
  const injuryPenalty = injuries.length ? 5 + injuries.length * 2 : 0;

  const striking = stat(f, "striking") * 1.15 + stat(f, "speed") * 0.55 + stat(f, "power") * 0.45 + stat(f, "fightIQ") * 0.25 - fatiguePenalty - injuryPenalty;
  const wrestling = stat(f, "wrestling") * 1.0 + stat(f, "cardio") * 0.3 + stat(f, "durability") * 0.2 - fatiguePenalty - injuryPenalty;
  const grappling = stat(f, "grappling") * 1.05 + stat(f, "submissionOffense") * 0.5 + stat(f, "wrestling") * 0.35 - fatiguePenalty - injuryPenalty;
  const defense = stat(f, "defense") * 1.0 + stat(f, "chin") * 0.45 + stat(f, "submissionDefense") * 0.45 + stat(f, "fightIQ") * 0.65 - fatiguePenalty * 0.35;

  return {
    striking,
    wrestling,
    grappling,
    defense,
    pace: stat(f, "cardio") * 0.7 + stat(f, "durability") * 0.3 - fatiguePenalty,
    finishKO: stat(f, "power") * 1.0 + stat(f, "striking") * 0.72 + stat(f, "speed") * 0.25 + stat(f, "fightIQ") * 0.18 - fatiguePenalty * 0.35,
    finishSub: stat(f, "submissionOffense") * 1.05 + stat(f, "grappling") * 0.72 + stat(f, "wrestling") * 0.35 + stat(f, "fightIQ") * 0.18 - fatiguePenalty * 0.35,
    chin: stat(f, "chin"),
    submissionDefense: stat(f, "submissionDefense"),
    fightIQ: stat(f, "fightIQ")
  };
}

function roundScore(a, b) {
  const strikingEdge = a.striking - b.defense * 0.72;
  const grapplingEdge = a.grappling - b.defense * 0.58;
  const wrestlingEdge = a.wrestling - b.grappling * 0.5;
  const paceEdge = a.pace - b.pace;
  return strikingEdge * 0.42 + grapplingEdge * 0.3 + wrestlingEdge * 0.16 + paceEdge * 0.12 + Math.random() * 4;
}

function finishChance(attacker, defender, type, round, roundEdge) {
  const lateRoundBonus = round >= 2 ? round * 0.008 : 0;
  const momentum = clamp(roundEdge / 160, -0.035, 0.055);

  if (type === "ko") {
    const edge = attacker.finishKO - (defender.defense * 0.7 + defender.chin * 0.55);
    return clamp(0.012 + edge / 220 + momentum + lateRoundBonus, 0.005, 0.28);
  }

  const edge = attacker.finishSub - (defender.defense * 0.62 + defender.submissionDefense * 0.65);
  return clamp(0.01 + edge / 230 + momentum + lateRoundBonus, 0.005, 0.24);
}

function matchupNote(player, opponent, p, o) {
  const strikingEdge = p.striking - o.striking;
  const grapplingEdge = p.grappling - o.grappling;
  const defenseEdge = p.defense - o.defense;
  const best = [
    { label: "striking", edge: strikingEdge },
    { label: "grappling", edge: grapplingEdge },
    { label: "defense", edge: defenseEdge }
  ].sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge))[0];

  if (Math.abs(best.edge) < 6) return `The matchup opened evenly, with neither fighter showing a clear statistical edge.`;
  const leader = best.edge > 0 ? player.name : opponent.name;
  return `${leader} entered with the clearer ${best.label} edge.`;
}

export function simulateFight(player, opponent) {
  let playerRounds = 0;
  let oppRounds = 0;
  const summary = [];

  for (let round = 1; round <= 3; round += 1) {
    const p = perf(player, round);
    const o = perf(opponent, round);

    if (round === 1) summary.push(matchupNote(player, opponent, p, o));

    const pScore = roundScore(p, o);
    const oScore = roundScore(o, p);
    const pEdge = pScore - oScore;
    const oEdge = oScore - pScore;

    const playerKoChance = finishChance(p, o, "ko", round, pEdge);
    const oppKoChance = finishChance(o, p, "ko", round, oEdge);
    const playerSubChance = finishChance(p, o, "sub", round, pEdge);
    const oppSubChance = finishChance(o, p, "sub", round, oEdge);

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
        narrative: `Round ${round}: ${player.name}'s striking and power created a stoppage.`,
        chance: playerKoChance,
        roll: playerKoRoll,
        iq: p.fightIQ,
        roundScoreEdge: pEdge
      });
    }

    if (oppKoRoll < oppKoChance) {
      finishEvents.push({
        winner: opponent.name,
        loser: player.name,
        method: "KO/TKO",
        narrative: `Round ${round}: ${opponent.name}'s striking and power broke through for a stoppage.`,
        chance: oppKoChance,
        roll: oppKoRoll,
        iq: o.fightIQ,
        roundScoreEdge: oEdge
      });
    }

    if (playerSubRoll < playerSubChance) {
      finishEvents.push({
        winner: player.name,
        loser: opponent.name,
        method: "Submission",
        narrative: `Round ${round}: ${player.name}'s grappling chain produced the tap.`,
        chance: playerSubChance,
        roll: playerSubRoll,
        iq: p.fightIQ,
        roundScoreEdge: pEdge
      });
    }

    if (oppSubRoll < oppSubChance) {
      finishEvents.push({
        winner: opponent.name,
        loser: player.name,
        method: "Submission",
        narrative: `Round ${round}: ${opponent.name}'s grappling chain forced the tap.`,
        chance: oppSubChance,
        roll: oppSubRoll,
        iq: o.fightIQ,
        roundScoreEdge: oEdge
      });
    }

    if (finishEvents.length) {
      finishEvents.sort((a, b) => {
        const marginA = a.chance - a.roll;
        const marginB = b.chance - b.roll;
        const scoreA = marginA * 120 + a.iq * 0.22 + a.roundScoreEdge * 0.7 + Math.random() * 2;
        const scoreB = marginB * 120 + b.iq * 0.22 + b.roundScoreEdge * 0.7 + Math.random() * 2;
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
      summary.push(`Round ${round}: ${player.name} won the round through stronger stat edges.`);
    } else {
      oppRounds += 1;
      summary.push(`Round ${round}: ${opponent.name} took the round by exploiting the matchup.`);
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
      const pScore = roundScore(p, o);
      const oScore = roundScore(o, p);
      const chances = [
        finishChance(p, o, "ko", round, pScore - oScore),
        finishChance(o, p, "ko", round, oScore - pScore),
        finishChance(p, o, "sub", round, pScore - oScore),
        finishChance(o, p, "sub", round, oScore - pScore)
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
