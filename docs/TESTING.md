# Testing

## Automated logic tests
Open `tests/tests.html` via the local server. Covers `js/logic.js`.

## Manual checklist
- [YES] Clicking the enemy lowers its HP
- [YES] Killing an enemy gives gold and spawns a stronger one
- [YES] Shop buttons are disabled when gold is too low
- [YES] Buying "Stronger clicks" raises damage per click
- [YES] Buying "Idle helper" damages the enemy without clicking
- [YES] Refreshing the page keeps progress
- [YES] Reset progress works
- [YES] Idle works when tabbed out
- [YES] Boss appears after 10 kills, and the info line switches to a countdown
- [YES] Killing the boss gives a lot of gold and unlocks Level 2
- [YES] Letting the timer run out removes the boss and starts a new 10-kill count
- [YES]* Level 2 button is locked at the start and works after the boss
- [PARTIAL] Refreshing mid-boss keeps the boss and its timer
-> It refreshes boss HP and timer, currently accepted behavior

- [REPEATED]* Level 2 button unlocks after the level 1 boss
- [YES] Switching to level 2 shows the dashed box and the round target
- [YES] Holding fills the ring and deals damage, and the target moves afterwards
- [YES] Releasing early resets the ring with no damage
- [YES] Switching back to level 1 restores normal clicking
- [YES] Refreshing on level 2 keeps the hold mechanic
- [DOABLE] Level 2 boss can be beaten within its 30 seconds with reasonable upgrades

## Bug log
| Date | What happened | Cause | Fix | AI used |

|24/10/2026 16:25|idle damage stopped in background tab|browser throttles timers and the tick assumed a fixed 0.1 s|switched to elapsed-time measurement|Claude|

|24/10/2026 18:50|Refreshing during a boss fight resets the boss’s HP and timer|Progress is only saved on a kill or purchase|Not fixed. Accepted for the prototype|None|

|24/10/2026 19:20|Replaying a level after a boss win or boss escape made enemies and gold rewards keep growing, so the same level got harder and harder|Enemy HP and gold scaled with enemyIndex, a counter that only went up and never reset|Scale by killsInLevel instead, which resets after every boss cycle and level switch|Claude|

|24/10/2026 20:54|Not a bug, but scaling issue. Hold mechanic deals same as a normal click. Conceptually does not make sense, needs private multiplier?|Cause|Fix|AI used|

