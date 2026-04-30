import { WEIGHT_CLASSES, STYLES, STAT_KEYS } from "./models/constants";
import { createFighter } from "./models/factory";

let fighter = null;

const app = document.getElementById("app");

function renderCreateFighter() {
  app.innerHTML = `
    <h1>MMA Career Manager</h1>
    <div class='card'>
      <h2>Phase 2: Create Fighter</h2>
      <div class='row'><input id='name' placeholder='Fighter Name' value='Rookie Fighter'></div>
      <div class='row'><label>Age <input id='age' type='number' min='18' max='45' value='24'></label></div>
      <div class='row'><label>Weight Class <select id='weight'>${WEIGHT_CLASSES.map((w) => `<option>${w}</option>`).join("")}</select></label></div>
      <div class='row'><label>Style <select id='style'>${STYLES.map((s) => `<option>${s}</option>`).join("")}</select></label></div>
      <button id='create'>Create Fighter</button>
      <p class='small'>MVP scope currently includes only project setup + fighter model + fighter creation flow.</p>
    </div>
  `;

  document.getElementById("create").onclick = () => {
    const name = document.getElementById("name").value.trim();
    const age = Number(document.getElementById("age").value);
    const weightClass = document.getElementById("weight").value;
    const style = document.getElementById("style").value;

    if (!name) {
      alert("Please enter a fighter name.");
      return;
    }

    fighter = createFighter({ name, age, weightClass, style });
    renderOverview();
  };
}

function renderOverview() {
  app.innerHTML = `
    <h1>MMA Career Manager</h1>
    <div class='grid'>
      <section class='card'>
        <h2>Fighter Overview</h2>
        <p><b>${fighter.name}</b></p>
        <p>Age: ${fighter.age}</p>
        <p>Weight Class: ${fighter.weightClass}</p>
        <p>Style: ${fighter.style}</p>
        <p>Promotion: ${fighter.currentPromotion}</p>
        <p>Record: ${fighter.record.wins}-${fighter.record.losses}-${fighter.record.draws}</p>
        <p>Money: $${fighter.money}</p>
        <p>Fame: ${fighter.fame}</p>
        <p>Ranking: #${fighter.ranking}</p>
      </section>

      <section class='card'>
        <h2>Core Stats</h2>
        <div class='grid'>
          ${STAT_KEYS.map((k) => `<div>${k}: <b>${fighter.stats[k]}</b></div>`).join("")}
        </div>
      </section>

      <section class='card full'>
        <h2>Next Step</h2>
        <p class='small'>Phase 3 (training system) is intentionally not implemented yet.</p>
        <button id='new'>Create Another Fighter</button>
      </section>
    </div>
  `;

  document.getElementById("new").onclick = () => {
    fighter = null;
    renderCreateFighter();
  };
}

renderCreateFighter();
