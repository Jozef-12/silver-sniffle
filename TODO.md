# TODO

## Immediate stabilization (current)
- [x] Connect persistence to the active MVP loop (create, train, refresh offers, load on boot, clear/reset).
- [x] Add user-friendly create-fighter validation messages (no empty name, age 18-45, valid class/style).
- [x] Rebalance fight simulator internals so both sides can win by KO/TKO or submission.
- [x] Add fight simulation diagnostics to verify KO/submission/decision coverage and zero NaN finish chances.
- [x] Connect the fight simulator to matchmaking selection.
- [x] Apply accepted fight results to record, money, fame, ranking, condition, injuries, and career history.
- [x] Add baseline fight offer risk/reward copy.
- [x] Make every core stat trainable.
- [x] Block hard training when energy is too low.
- [x] Add 4-week fight camps before fight night.
- [x] Age fighters as career weeks advance.
- [x] Make fight outcomes more visibly stat-driven.

## Next MVP follow-ups
- [ ] Add dedicated fight detail modal instead of inline dashboard-only output.
- [ ] Persist expanded career timeline filters and richer fight history views.
- [ ] Add pre-fight matchup comparison with clear stat advantages and warnings.
- [ ] Add more detailed fight offer risk/reward breakdown with projected ranking/fame movement.
- [ ] Add automated smoke checks for training gates, fight camps, fight simulation, and career result processing.
- [ ] Re-run balance diagnostics after several UI-played careers.

## Post-MVP systems
- [ ] Multi-promotion world and contracts.
- [ ] Dynamic rankings and title paths.
- [ ] Gyms/coaches and advanced training camp scheduling.
- [ ] Expanded injuries and medical suspensions.
- [ ] 5-round title fights and tactical plans.
- [ ] Retirement, hall of fame, and legacy scoring.
