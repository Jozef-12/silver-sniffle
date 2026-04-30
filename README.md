# silver-sniffle

MMA Career Manager (MVP-first) prototype.

## Current Scope
This build currently includes **Phase 1 + Phase 2**:
- Project setup and documentation
- Fighter data model
- Fighter creation flow
- Fighter overview + core stats display

Training, matchmaking, and fight simulation are intentionally deferred for later phases.

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

## How to test the game out (manual)
1. Launch the app with `npm run dev`.
2. On the **Create Fighter** screen:
   - Enter a fighter name
   - Set age
   - Choose weight class and style
   - Click **Create Fighter**
3. Confirm the **Fighter Overview** screen appears and shows:
   - Name, age, weight class, style
   - Promotion, record, money, fame, ranking
4. Confirm **Core Stats** render for all stat categories.
5. Click **Create Another Fighter** and verify you return to the creation form.

## Build check
Run a production build to ensure the app compiles:

```bash
npm run build
```
