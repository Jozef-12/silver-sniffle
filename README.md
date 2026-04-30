# silver-sniffle

MMA Career Manager (MVP-first) prototype.

## Current MVP State (after camp and energy pass)
This build currently includes:
- Fighter creation flow (Phase 2)
- All-stat training options with energy costs, recovery, condition, and injury tradeoffs (Phase 3)
- Matchmaking/fight offer generation visible in the dashboard (Phase 4)
- Accepted fight offers now start 4-week fight camps instead of instantly simulating (Phase 5)
- Fight simulation with stronger stat-driven matchup impact for rounds and finishes (Phase 5)
- Career result processing for record, money, fame, ranking, condition, injuries, age, and history (Phase 6 baseline)
- Local persistence hooks connected to the active career, including active camps (load/save/reset)

Still partial:
- Career history is visible, but deeper timeline filtering/detail views are still pending.
- Fight detail UX is currently inline in the dashboard; a dedicated modal/details view remains a follow-up.
- Long-term balancing and expanded career systems remain post-MVP work.

## Requirements
- Node.js 18+
- npm 9+

## How to run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the local URL shown in the terminal (typically `http://localhost:5173`).

## Manual MVP walkthrough
1. Launch the app with `npm run dev`.
2. On **Create Fighter**:
   - Enter a fighter name (required)
   - Enter age (must be 18-45)
   - Choose a valid weight class and style
3. Click **Create Fighter** and confirm dashboard sections render:
   - Fighter Overview
   - Core Stats
   - Training actions
   - Matchmaking offers
   - Fight Result
   - Career History
4. Run training weeks and confirm:
   - Every stat has a trainable option
   - Energy decreases after hard training
   - Hard training is blocked when energy is too low
   - Recovery restores energy and can improve injuries
5. Click **Generate New Offers** and verify offers refresh.
6. Click **Sign Fight Camp** on an offer and confirm:
   - A 4-week fight camp appears
   - Training/recovery advances the camp countdown
   - Fight night runs automatically after camp completion
   - Record, money, fame, ranking, condition, injury status, age, and history update
7. Refresh the browser and confirm the existing career and active camp load from storage.
8. Click **Clear / Reset Career** and verify a new career can be started.

## Build check
Run a production build to ensure the app compiles:

```bash
npm run build
```
