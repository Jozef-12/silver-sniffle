const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export function applyFightResult(player, opponent, result) {
  let fameChange = 0;
  let rankingChange = 0;
  let pay = 0;
  const won = result.winner === player.name;
  const rankingGap = player.ranking - opponent.ranking;

  if (result.method === "Draw") {
    player.record.draws += 1;
    pay = 1200;
    fameChange = 1;
    rankingChange = rankingGap > 8 ? -1 : 0;
  } else if (won) {
    player.record.wins += 1;
    if (result.method === "KO/TKO") player.record.koWins += 1;
    else if (result.method === "Submission") player.record.submissionWins += 1;
    else player.record.decisionWins += 1;
    pay = 2500 + Math.max(0, (70 - opponent.ranking) * 20);
    fameChange = opponent.ranking < player.ranking ? 4 : 3;
    rankingChange = opponent.ranking < player.ranking ? -4 : -2;
  } else {
    player.record.losses += 1;
    if (result.method === "KO/TKO") player.record.koLosses += 1;
    else if (result.method === "Submission") player.record.submissionLosses += 1;
    else player.record.decisionLosses += 1;
    pay = 1000;
    fameChange = -1;
    rankingChange = opponent.ranking > player.ranking ? 1 : 3;
  }

  player.money += pay;
  player.fame = clamp(player.fame + fameChange, 1, 100);
  player.ranking = clamp(player.ranking + rankingChange, 1, 100);
  player.condition = clamp(player.condition - 18, 0, 100);
  if (Math.random() < 0.18) player.injuries.push("Fight damage");
  player.injuryStatus = player.injuries.length ? "Minor Injury" : "Healthy";
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
