# silver-sniffle

MMA Career Manager (MVP-first) prototype.

## Current MVP State (after Phase 4 hardening)
This build currently includes:
- Fighter creation flow (Phase 2)
- Training loop with stat/condition/injury updates (Phase 3)
- Matchmaking/fight offer generation visible in the dashboard (Phase 4)
- Local persistence hooks connected to the active career (load/save/reset)

Not yet connected:
- Fight simulation is present in code, diagnostics are in place, and it is intentionally not wired into the main UI flow yet.
- Full career persistence/history integration is still partial and will be completed in a later phase.

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
   - Phase 4 Matchmaking offers
4. Run one or more training weeks and confirm stat/condition changes appear.
5. Click **Generate New Offers** and verify offers refresh.
6. Refresh the browser and confirm the existing career loads from storage.
7. Click **Clear / Reset Career** and verify a new career can be started.

## Build check
Run a production build to ensure the app compiles:

```bash
npm run build
```
