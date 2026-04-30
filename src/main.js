import { WEIGHT_CLASSES, STYLES, TRAINING_OPTIONS, STAT_KEYS } from "./models/constants";
import { createFighter } from "./models/factory";
import { applyTraining } from "./systems/training";
import { getFightOffers } from "./systems/matchmaking";
import { simulateFight } from "./systems/fightSim";
import { applyFightResult } from "./systems/career";

let fighter = null;
let offers = [];
let logs = [];

const app = document.getElementById("app");

function render() {
  if (!fighter) {
    app.innerHTML = `<h1>MMA Career Manager MVP</h1><div class='card'><h2>Create Fighter</h2>
      <div class='row'><input id='name' placeholder='Name' value='Rookie Fighter'></div>
      <div class='row'><label>Age <input id='age' type='number' min='18' max='45' value='24'></label></div>
      <div class='row'><label>Weight <select id='weight'>${WEIGHT_CLASSES.map((w) => `<option>${w}</option>`).join("")}</select></label></div>
      <div class='row'><label>Style <select id='style'>${STYLES.map((s) => `<option>${s}</option>`).join("")}</select></label></div>
      <button id='create'>Create Fighter</button></div>`;
    document.getElementById("create").onclick = () => {
      fighter = createFighter({
        name: document.getElementById("name").value,
        age: document.getElementById("age").value,
        weightClass: document.getElementById("weight").value,
        style: document.getElementById("style").value
      });
      offers = getFightOffers(fighter);
      render();
    };
    return;
  }

  app.innerHTML = `<h1>MMA Career Manager MVP</h1><div class='grid'>
    <section class='card'><h2>Fighter Overview</h2>
      <p><b>${fighter.name}</b> (${fighter.style}) - ${fighter.weightClass}</p>
      <p>Record: ${fighter.record.wins}-${fighter.record.losses}-${fighter.record.draws} | Ranking: #${fighter.ranking} | Fame: ${fighter.fame}</p>
      <p>Money: $${fighter.money} | Condition: ${fighter.condition.toFixed(0)} | Injury: ${fighter.injuryStatus}</p>
      <p class='small'>Career Week: ${fighter.careerWeek}</p>
    </section>

    <section class='card'><h2>Training</h2>
      ${TRAINING_OPTIONS.map((o) => `<button data-train='${o.id}'>${o.label}</button>`).join(" ")}
      <div class='small'>Train weekly to grow, but condition and injury risk matter.</div>
    </section>

    <section class='card full'><h2>Stats Overview</h2><div class='grid'>${STAT_KEYS.map((k) => `<div>${k}: <b>${fighter.stats[k].toFixed(1)}</b></div>`).join("")}</div></section>

    <section class='card'><h2>Fight Offers</h2>
      ${offers.map((o, i) => `<div class='card'><b>${o.name}</b> (${o.style})<br>Rank #${o.ranking} | ${o.record} | ${o.difficulty}<br><button data-fight='${i}'>Accept Fight</button></div>`).join("")}
      <button id='refresh-offers'>Refresh Offers</button>
    </section>

    <section class='card'><h2>Career History</h2><ul>${fighter.history.map((h) => `<li>${h.date}: vs ${h.opponentName} - ${h.result} by ${h.method} (R${h.round})</li>`).join("") || "<li>No fights yet.</li>"}</ul></section>

    <section class='card full'><h2>Fight Simulation Log</h2><ul>${logs.map((l) => `<li>${l}</li>`).join("") || "<li>No events yet.</li>"}</ul></section>
  </div>`;

  document.querySelectorAll("[data-train]").forEach((btn) => btn.onclick = () => {
    const option = TRAINING_OPTIONS.find((o) => o.id === btn.dataset.train);
    const events = applyTraining(fighter, option);
    logs.unshift(...events);
    render();
  });

  document.getElementById("refresh-offers").onclick = () => { offers = getFightOffers(fighter); render(); };

  document.querySelectorAll("[data-fight]").forEach((btn) => btn.onclick = () => {
    const opponent = offers[Number(btn.dataset.fight)];
    const result = simulateFight(fighter, opponent);
    applyFightResult(fighter, opponent, result);
    logs.unshift(...result.summary, `Result: ${result.method === "Draw" ? "Draw" : `${result.winner} def. ${result.loser} by ${result.method} (R${result.round})`}`);
    offers = getFightOffers(fighter);
    render();
  });
}

render();
