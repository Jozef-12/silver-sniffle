const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export function applyFightResult(player, opponent, result) {
  let fameChange = 0; let rankingChange = 0; let pay = 0;
  const won = result.winner === player.name;
  if (result.method === "Draw") {
    player.record.draws += 1; pay = 1200; fameChange = 0; rankingChange = 0;
  } else if (won) {
    player.record.wins += 1;
    if (result.method === "KO/TKO") player.record.koWins += 1;
    else if (result.method === "Submission") player.record.submissionWins += 1;
    else player.record.decisionWins += 1;
    pay = 2500 + Math.max(0, (70 - opponent.ranking) * 20);
    fameChange = 3;
    rankingChange = -2;
  } else {
    player.record.losses += 1;
    if (result.method === "KO/TKO") player.record.koLosses += 1;
    else if (result.method === "Submission") player.record.submissionLosses += 1;
    else player.record.decisionLosses += 1;
    pay = 1000;
    fameChange = -1;
    rankingChange = 2;
  }

  player.money += pay;
  player.fame = clamp(player.fame + fameChange, 1, 100);
  player.ranking = clamp(player.ranking + rankingChange, 1, 100);
  player.condition = clamp(player.condition - 20, 0, 100);
  if (Math.random() < 0.2) player.injuries.push("Fight damage");
  player.injuryStatus = player.injuries.length ? "Minor Injury" : "Healthy";
  player.careerWeek += 4;
  player.history.unshift({
    opponentName: opponent.name,
    result: result.method === "Draw" ? "Draw" : won ? "Win" : "Loss",
    method: result.method,
    round: result.round,
    date: `Week ${player.careerWeek}`,
    summary: result.summary.join(" "),
    moneyEarned: pay,
    fameChange,
    rankingChange
  });
}
