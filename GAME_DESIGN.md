# MMA Career Manager - Game Design (MVP-first)

## Vision
A serious MMA career simulator where the player develops a single fighter from prospect to veteran by making weekly management decisions.

## Core Loop (MVP)
1. Create fighter
2. Train for a week
3. Review fight offers
4. Accept one fight
5. Simulate 3-round bout
6. Apply career updates (record, money, fame, ranking, condition, injuries)
7. Repeat

## MVP Systems
- Fighter creation: name, age, weight class, style, baseline stats.
- Stats model: striking, wrestling, grappling, cardio, power, speed, defense, chin, submission offense/defense, fight IQ, durability.
- Training: weekly focus options with stat growth + condition and injury tradeoffs.
- Matchmaking: three generated offers scaled by player progression.
- Fight sim: round-by-round scoring with finish chances (KO/sub) and decision fallback.
- Career progression: result processing, economy/fame/ranking updates, fight history logging.
- UI: single-page dashboard with overview, stats, training, offers, simulation log, and history.

## Future Systems (Deferred)
Promotions/contracts, gyms/coaches, advanced injuries, morale/fanbase/media, title fights, retirement, dynamic world simulation, tactics/camps, and legacy systems.

## Design Principles
- Better fighter usually wins, but randomness enables upsets.
- Every action has tradeoffs (training gains vs fatigue/injury risk).
- Keep state transparent with readable summaries and logs.
- Modular architecture for feature expansion.
