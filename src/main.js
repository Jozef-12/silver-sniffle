import { WEIGHT_CLASSES, STYLES, STAT_KEYS, TRAINING_OPTIONS } from "./models/constants";
import { createFighter } from "./models/factory";
import { applyTraining } from "./systems/training";
import { getFightOffers } from "./systems/matchmaking";
import { loadCareerState, saveCareerState, clearCareerState } from "./systems/persistence";

let fighter = null;
let trainingLog = [];
let latestOffers = [];
let uiError = "";

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

function setError(message = "") {
  uiError = message;
}

function persistCareer() {
  if (!fighter) return;
  saveCareerState({ fighter, trainingLog, latestOffers });
}

function validateCreateInput({ name, age, weightClass, style }) {
  if (!name) return "Please enter a fighter name.";
  if (!Number.isFinite(age) || age < 18 || age > 45) return "Age must be a number between 18 and 45.";
  if (!WEIGHT_CLASSES.includes(weightClass)) return "Please choose a valid weight class.";
  if (!STYLES.includes(style)) return "Please choose a valid fighting style.";
  return "";
}

function renderCreateFighter() {
  app.innerHTML = `
    <div class="topbar"><h1>MMA Career Manager</h1><button id="theme-toggle">${themeToggleLabel()}</button></div>
    <div class='card'>
      <h2>Phase 2: Create Fighter</h2>
      ${uiError ? `<p class='small' style='color:#ff7f7f'><b>${uiError}</b></p>` : ""}
      <div class='row'><input id='name' placeholder='Fighter Name' value='Rookie Fighter'></div>
      <div class='row'><label>Age <input id='age' type='number' min='18' max='45' value='24'></label></div>
      <div class='row'><label>Weight Class <select id='weight'>${WEIGHT_CLASSES.map((w) => `<option>${w}</option>`).join("")}</select></label></div>
      <div class='row'><label>Style <select id='style'>${STYLES.map((s) => `<option>${s}</option>`).join("")}</select></label></div>
      <button id='create'>Create Fighter</button>
      <p class='small'>Includes fighter creation, training, and matchmaking prototype systems.</p>
    </div>
  `;

  bindThemeToggle();

  document.getElementById("create").onclick = () => {
    const name = document.getElementById("name").value.trim();
    const age = Number(document.getElementById("age").value);
    const weightClass = document.getElementById("weight").value;
    const style = document.getElementById("style").value;

    const validationError = validateCreateInput({ name, age, weightClass, style });
    if (validationError) {
      setError(validationError);
      renderCreateFighter();
      return;
    }

    fighter = createFighter({ name, age, weightClass, style });
    trainingLog = [];
    latestOffers = getFightOffers(fighter);
    setError("");
    persistCareer();
    renderOverview();
  };
}

function renderOverviewCard() {
  return `
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
      <p>Condition: ${fighter.condition.toFixed(0)}</p>
      <p>Injury Status: ${fighter.injuryStatus}</p>
      <p>Career Week: ${fighter.careerWeek}</p>
    </section>
  `;
}

function renderStatsCard() {
  return `
    <section class='card'>
      <h2>Core Stats</h2>
      <div class='grid'>
        ${STAT_KEYS.map((k) => `<div>${k}: <b>${Number(fighter.stats[k]).toFixed(1)}</b></div>`).join("")}
      </div>
    </section>
  `;
}

function renderTrainingCard() {
  return `
    <section class='card full'>
      <h2>Phase 3: Training System</h2>
      <p class='small'>Choose a weekly action. Training increases focused stats but reduces condition and can cause injuries.</p>
      <div class='row'>
        ${TRAINING_OPTIONS.map((option) => `<button class='training-action' data-option='${option.id}'>${option.label}</button>`).join("")}
      </div>
      <div class='small'>
        ${trainingLog.length ? trainingLog.slice(0, 4).map((entry) => `<p>• ${entry}</p>`).join("") : "No training weeks completed yet."}
      </div>
    </section>
  `;
}

function renderMatchmakingCard() {
  return `
    <section class='card full'>
      <h2>Phase 4: Opponent Generation + Matchmaking</h2>
      <p class='small'>Offers are generated by weight class and tuned by your current fame/ranking.</p>
      <button id='refresh-offers'>Generate New Offers</button>
      <div class='grid'>
        ${latestOffers.map((opponent) => `
          <div class='card'>
            <p><b>${opponent.name}</b> (${opponent.difficulty})</p>
            <p>Style: ${opponent.style}</p>
            <p>Age: ${opponent.age}</p>
            <p>Ranking: #${opponent.ranking}</p>
            <p>Record: ${opponent.record}</p>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function bindOverviewEvents() {
  document.querySelectorAll(".training-action").forEach((btn) => {
    btn.onclick = () => {
      const option = TRAINING_OPTIONS.find((item) => item.id === btn.dataset.option);
      if (!option) return;
      const changes = applyTraining(fighter, option);
      trainingLog = [`Week ${fighter.careerWeek}: ${changes.join(" ")}`, ...trainingLog].slice(0, 10);
      latestOffers = getFightOffers(fighter);
      persistCareer();
      renderOverview();
    };
  });

  const refresh = document.getElementById("refresh-offers");
  if (refresh) {
    refresh.onclick = () => {
      latestOffers = getFightOffers(fighter);
      persistCareer();
      renderOverview();
    };
  }

  document.getElementById("reset-career").onclick = () => {
    fighter = null;
    trainingLog = [];
    latestOffers = [];
    setError("");
    clearCareerState();
    renderCreateFighter();
  };
}

function renderOverview() {
  app.innerHTML = `
    <div class="topbar"><h1>MMA Career Manager</h1><button id="theme-toggle">${themeToggleLabel()}</button></div>
    <div class='grid'>
      ${renderOverviewCard()}
      ${renderStatsCard()}
      ${renderTrainingCard()}
      ${renderMatchmakingCard()}
      <section class='card full'>
        <h2>Career Flow</h2>
        <p class='small'>Fighter creation, training, and fight offer generation are playable. Fight simulation is not yet wired into this flow.</p>
        <button id='reset-career'>Clear / Reset Career</button>
      </section>
    </div>
  `;

  bindThemeToggle();
  bindOverviewEvents();
}

function hydrateFromSave() {
  const saved = loadCareerState();
  if (!saved || !saved.fighter) return;
  fighter = saved.fighter;
  trainingLog = Array.isArray(saved.trainingLog) ? saved.trainingLog : [];
  latestOffers = Array.isArray(saved.latestOffers) ? saved.latestOffers : getFightOffers(fighter);
}

function render() {
  if (fighter) {
    renderOverview();
  } else {
    renderCreateFighter();
  }
}

hydrateFromSave();
applyTheme(getTheme());
render();
