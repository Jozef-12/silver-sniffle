import { WEIGHT_CLASSES, STYLES, STAT_KEYS, TRAINING_OPTIONS } from "./models/constants";
import { createFighter } from "./models/factory";
import { applyTraining, syncFighterAge } from "./systems/training";
import { getFightOffers } from "./systems/matchmaking";
import { simulateFight } from "./systems/fightSim";
import { applyFightResult } from "./systems/career";
import { loadCareerState, saveCareerState, clearCareerState } from "./systems/persistence";

let fighter = null;
let trainingLog = [];
let latestOffers = [];
let latestFightResult = null;
let activeCamp = null;
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
  saveCareerState({ fighter, trainingLog, latestOffers, latestFightResult, activeCamp });
}

function validateCreateInput({ name, age, weightClass, style }) {
  if (!name) return "Please enter a fighter name.";
  if (!Number.isFinite(age) || age < 18 || age > 45) return "Age must be a number between 18 and 45.";
  if (!WEIGHT_CLASSES.includes(weightClass)) return "Please choose a valid weight class.";
  if (!STYLES.includes(style)) return "Please choose a valid fighting style.";
  return "";
}

function estimateWinPay(opponent) {
  return 2500 + Math.max(0, (70 - opponent.ranking) * 20);
}

function trainingDisabled(option) {
  return option.id !== "recovery" && fighter.condition < (option.energyCost ?? 10);
}

function completeCampFight() {
  if (!activeCamp?.opponent) return;
  const opponent = activeCamp.opponent;
  latestFightResult = simulateFight(fighter, opponent);
  applyFightResult(fighter, opponent, latestFightResult);
  activeCamp = null;
  latestOffers = getFightOffers(fighter);
  trainingLog = [`Week ${fighter.careerWeek}: Fight completed vs ${opponent.name}.`, ...trainingLog].slice(0, 10);
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
      <p class='small'>Includes fighter creation, training, fight camps, matchmaking, fight simulation, and career history systems.</p>
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
    latestFightResult = null;
    activeCamp = null;
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
      <p>Energy: ${fighter.condition.toFixed(0)}/100</p>
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
      <h2>Training</h2>
      <p class='small'>Every non-recovery session costs energy and advances one career week. Low energy blocks hard training.</p>
      <div class='row'>
        ${TRAINING_OPTIONS.map((option) => `
          <button class='training-action' data-option='${option.id}' ${trainingDisabled(option) ? "disabled" : ""}>
            ${option.label} ${option.id !== "recovery" ? `(${option.energyCost} energy)` : ""}
          </button>
        `).join("")}
      </div>
      <div class='small'>
        ${trainingLog.length ? trainingLog.slice(0, 5).map((entry) => `<p>- ${entry}</p>`).join("") : "No training weeks completed yet."}
      </div>
    </section>
  `;
}

function renderCampCard() {
  if (!activeCamp) return "";
  const opponent = activeCamp.opponent;
  return `
    <section class='card full'>
      <h2>Fight Camp</h2>
      <p><b>${opponent.name}</b> is signed. Fight week in ${activeCamp.weeksRemaining} week${activeCamp.weeksRemaining === 1 ? "" : "s"}.</p>
      <p class='small'>Train or recover to finish the camp. Your energy, injuries, and improved stats carry into the fight.</p>
    </section>
  `;
}

function renderMatchmakingCard() {
  if (activeCamp) {
    return `
      <section class='card full'>
        <h2>Matchmaking</h2>
        <p class='small'>You already have a signed fight. Finish the camp before taking another offer.</p>
      </section>
    `;
  }

  return `
    <section class='card full'>
      <h2>Matchmaking</h2>
      <p class='small'>Accepting an offer starts a 4-week fight camp instead of jumping straight to fight night.</p>
      <button id='refresh-offers'>Generate New Offers</button>
      <div class='grid'>
        ${latestOffers.map((opponent, index) => `
          <div class='card'>
            <p><b>${opponent.name}</b> (${opponent.difficulty})</p>
            <p>Style: ${opponent.style}</p>
            <p>Age: ${opponent.age}</p>
            <p>Ranking: #${opponent.ranking}</p>
            <p>Record: ${opponent.record}</p>
            <p class='small'>Risk/reward: win pay about $${estimateWinPay(opponent)}, loss pay $1000. Better-ranked opponents can move your ranking faster.</p>
            <button class='accept-fight' data-offer-index='${index}'>Sign Fight Camp</button>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderFightResultCard() {
  if (!latestFightResult) {
    return `
      <section class='card full'>
        <h2>Fight Result</h2>
        <p class='small'>No fight completed yet. Sign a fight, complete camp, and fight night will run automatically.</p>
      </section>
    `;
  }

  return `
    <section class='card full'>
      <h2>Fight Result</h2>
      <p><b>${latestFightResult.method}</b>${latestFightResult.winner ? ` - Winner: ${latestFightResult.winner}` : ""}</p>
      <p>Round: ${latestFightResult.round}</p>
      <div class='small'>
        ${latestFightResult.summary.map((line) => `<p>- ${line}</p>`).join("")}
      </div>
    </section>
  `;
}

function renderHistoryCard() {
  const history = Array.isArray(fighter.history) ? fighter.history : [];
  return `
    <section class='card full'>
      <h2>Career History</h2>
      ${history.length ? `
        <ul>
          ${history.slice(0, 8).map((entry) => `
            <li>
              <b>${entry.result}</b> vs ${entry.opponentName} by ${entry.method} in round ${entry.round}
              <span class='small'>(${entry.date}, $${entry.moneyEarned}, fame ${entry.fameChange >= 0 ? "+" : ""}${entry.fameChange}, ranking ${entry.rankingChange > 0 ? "+" : ""}${entry.rankingChange})</span>
            </li>
          `).join("")}
        </ul>
      ` : `<p class='small'>No career fights logged yet.</p>`}
    </section>
  `;
}

function bindOverviewEvents() {
  document.querySelectorAll(".training-action").forEach((btn) => {
    btn.onclick = () => {
      const option = TRAINING_OPTIONS.find((item) => item.id === btn.dataset.option);
      if (!option) return;

      const weekBefore = fighter.careerWeek;
      const changes = applyTraining(fighter, option);
      const weekAdvanced = fighter.careerWeek > weekBefore;
      trainingLog = [`Week ${fighter.careerWeek}: ${changes.join(" ")}`, ...trainingLog].slice(0, 10);

      if (weekAdvanced && activeCamp) {
        activeCamp.weeksRemaining -= 1;
        if (activeCamp.weeksRemaining <= 0) completeCampFight();
      } else if (weekAdvanced) {
        latestOffers = getFightOffers(fighter);
      }

      persistCareer();
      renderOverview();
    };
  });

  document.querySelectorAll(".accept-fight").forEach((btn) => {
    btn.onclick = () => {
      const opponent = latestOffers[Number(btn.dataset.offerIndex)];
      if (!opponent) return;
      activeCamp = { opponent, weeksRemaining: 4 };
      latestFightResult = null;
      trainingLog = [`Week ${fighter.careerWeek}: Signed a 4-week fight camp vs ${opponent.name}.`, ...trainingLog].slice(0, 10);
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
    latestFightResult = null;
    activeCamp = null;
    setError("");
    clearCareerState();
    renderCreateFighter();
  };
}

function renderOverview() {
  syncFighterAge(fighter);
  app.innerHTML = `
    <div class="topbar"><h1>MMA Career Manager</h1><button id="theme-toggle">${themeToggleLabel()}</button></div>
    <div class='grid'>
      ${renderOverviewCard()}
      ${renderStatsCard()}
      ${renderTrainingCard()}
      ${renderCampCard()}
      ${renderMatchmakingCard()}
      ${renderFightResultCard()}
      ${renderHistoryCard()}
      <section class='card full'>
        <h2>Career Flow</h2>
        <p class='small'>Create a fighter, sign fights, complete camps, manage energy, and build a persistent career history.</p>
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
  latestFightResult = saved.latestFightResult || null;
  activeCamp = saved.activeCamp || null;
  syncFighterAge(fighter);
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
