# silver-sniffle

MMA Career Manager (MVP-first) prototype.

## Current MVP State (after fight loop integration)
This build currently includes:
- Fighter creation flow (Phase 2)
- Training loop with stat/condition/injury updates (Phase 3)
- Matchmaking/fight offer generation visible in the dashboard (Phase 4)
- Fight simulation connected to accepted fight offers (Phase 5)
- Career result processing for record, money, fame, ranking, condition, injuries, and history (Phase 6 baseline)
- Local persistence hooks connected to the active career (load/save/reset)

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
   - Phase 3 Training actions
   - Phase 4-5 Matchmaking + Fight Simulation offers
   - Fight Result
   - Career History
4. Run one or more training weeks and confirm stat/condition changes appear.
5. Click **Generate New Offers** and verify offers refresh.
6. Click **Accept Fight** on an offer and confirm:
   - A fight result appears
   - Record, money, fame, ranking, condition, and injury status update
   - Career History receives a new entry
   - New offers are generated for the updated career state
7. Refresh the browser and confirm the existing career loads from storage.
8. Click **Clear / Reset Career** and verify a new career can be started.

## Build check
Run a production build to ensure the app compiles:

```bash
npm run build
```
