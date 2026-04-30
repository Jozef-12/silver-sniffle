# DECISIONS

## 2026-04-30 - MVP architecture
- Chosen stack: Vanilla JavaScript + Vite.
- Reason: quick startup, zero framework overhead, simple modular ES module structure.

## 2026-04-30 - Separation of concerns
- `src/models`: data constants and fighter factory.
- `src/systems`: pure gameplay systems (training, matchmaking, fight sim, career updates).
- `src/main.js`: minimal UI/state wiring only.
- Reason: gameplay logic stays independent from rendering and can be moved to another UI later.

## 2026-04-30 - MVP scope constraints
- Built only create/train/fight/update/history loop.
- Deferred all advanced features to roadmap/TODO.
- Reason: keep first version playable and testable before complexity.
