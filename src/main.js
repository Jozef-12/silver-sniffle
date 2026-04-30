import { WEIGHT_CLASSES, STYLES, STAT_KEYS } from "./models/constants";
import { createFighter } from "./models/factory";

let fighter = null;

const app = document.getElementById("app");

const THEME_KEY = "mma_theme";

function getTheme() {
  return localStorage.getItem(THEME_KEY) || "dark";
}

function applyTheme(theme) {
  document.body.classList.toggle("light", theme === "light");
  localStorage.setItem(THEME_KEY, theme);
}

function themeToggleLabel() {
  return getTheme() === "light" ? "Dark mode" : "White mode";
}

function bindThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.onclick = () => {
    applyTheme(getTheme() === "light" ? "dark" : "light");
    render();
  };
}

applyTheme(getTheme());

function renderCreateFighter() {
  app.innerHTML = `
    <div class="topbar"><h1>MMA Career Manager</h1><button id="theme-toggle">${themeToggleLabel()}</button></div>
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

  bindThemeToggle();

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
    <div class="topbar"><h1>MMA Career Manager</h1><button id="theme-toggle">${themeToggleLabel()}</button></div>
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

  bindThemeToggle();

  document.getElementById("new").onclick = () => {
    fighter = null;
    renderCreateFighter();
  };
}

renderCreateFighter();
