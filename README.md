# A Clicker Game

A small browser game where every level changes *how* you attack: plain clicking, holding on a moving target, and dragging along a path. Defeat enemies, earn gold, buy upgrades, and beat each level's boss before its timer runs out to unlock the next one.

Built as a working prototype in four days, with AI used for planning, coding and debugging.

| | |
|---|---|
| **Play it** | `https://mustafaalamiri.github.io/Personal-clicker-game/` |
| **Demo video** | TODO: YouTube link (unlisted) |
| **Source code** | You are here |

Built for desktop browsers with a mouse. Touch devices were not tested.

## How to play

1. Attack the enemy to bring its HP bar to zero. You earn gold for every kill.
2. Spend gold in the shop on **Stronger clicks** (more damage per action) and **Idle helper** (damage every second, even without clicking).
3. After 10 kills a **boss** appears with much more HP and a countdown. Beat it in time to unlock the next level. If time runs out, the boss leaves and you keep farming before it returns, so there is no penalty.
4. Each level uses a different way of attacking:

| Level | Mechanic | What to do |
|---|---|---|
| 1. Slime Meadow | Click | Click the enemy |
| 2. Hollow Cave | Hold | Press and hold on the moving target until the ring fills, then it jumps to a new spot |
| 3. Crystal Peak | Drag | Press the green dot and drag along the line towards the red dot. The further you get, the more damage you deal. The trail colour shows the tier (grey: nothing, orange: low, yellow: good, green: full) |

Progress is saved in your browser automatically. Use **Reset progress** to start over.

## Features

1. **Three input mechanics**, one per level, all sharing the same small interface so new ones are easy to add.
2. **Combat and progression loop**: enemies with HP, idle damage, gold, bosses with a timer, and level unlocking.
3. **Upgrade shop** with costs that scale per purchase.

## Tech

- Plain HTML, CSS and JavaScript (ES modules). No frameworks, no build step, no backend.
- Saves with `localStorage`. No accounts, API keys or personal data are used anywhere.
- Hosted as a static site on GitHub Pages.

## Run it locally

Browsers block ES modules when a page is opened by double-clicking, so use a small local server from the project folder:

```
python -m http.server 8000
```

Then open `http://localhost:8000`. The automated tests are at `http://localhost:8000/tests/tests.html`.

## Project structure

```
index.html            page layout
css/style.css         styling
js/config.js          every game number (HP, damage, costs, timers)
js/logic.js           pure game rules, no DOM access (this is what the tests cover)
js/state.js           game state and saving/loading
js/shop.js            buying upgrades
js/ui.js              all screen updates
js/main.js            game loop and wiring
js/mechanics/         click.js, hold.js, drag.js
tests/tests.html      automated logic tests, run in the browser
docs/TESTING.md       test checklist and bug log
docs/AI_LOG.md        log of how AI was used
docs/GENERAL.md       personal log during commits
```

The key design choice is keeping the game rules (`logic.js`) separate from drawing and input, which made the rules easy to test and the mechanics easy to swap per level.

## How I used AI

- **Claude** (Sonnet 5.5 effort:medium) was used for planning (comparing ideas and scoping to four days), writing the code, debugging, and writing documentation.
- I did the testing and decision making: I played every feature, reported what felt wrong, and chose between the options the AI proposed.
- The AI made mistakes that I found by playing. For example, idle damage stopped when the browser tab was in the background, enemies kept scaling when a level was replayed, and the drag mechanic failed too often at first.

The list of prompts and results is in [docs/AI_LOG.md](docs/AI_LOG.md).

## Testing

- **Automated:** `tests/tests.html` runs 41 checks on the game rules (damage, upgrade costs, boss HP and rewards, the boss timer, level unlocking, and the drag geometry). All pass.
- **Manual:** a checklist for every feature, run in the browser after each change.
- **Bugs found and fixed:** background-tab idle damage, runaway enemy scaling, a blocked GitHub push caused by a private email address, and drag difficulty (larger targets, colour feedback). Each is written up in [docs/TESTING.md](docs/TESTING.md).

## The Process
- Some personal thoughts and logs were written
- You can find these at [docs/GENERAL.md](docs/GENERAL.md)

## Known limitations

- Balance is only roughly tuned, so some levels or bosses are easier or harder than they should be.
- Refreshing the page takes you back to the last instance of action, whether that was new enemy, new purchase or change level. This means if boss is at 50% and your last action was to start the fight against the boss, the timer and the HP resets back to boss start.
- Offline progress is capped, and idle damage only counts for up to one minute away.
- Desktop only. Touch devices were not tested.
- In the drag level, reaching 90% of the line completes the drag automatically, so the final green state does not show.

## What I would do next

- Introduce the idea of a moving target in its own level before combining it with hold and drag, for a gentler difficulty curve.
- Add a multiplier-style upgrade, sound and proper art.
- Tune the balance of costs, gold and boss timers.
- Test on touch devices.
- Quests for faster progress (or a "gold-rush" mini-game in between stages), a daily mode for user engagement (whether it features 1 mechanic or is a same stage with a special buff/debuff), more levels.

## Credits

All code was written with AI assistance (see above). The characters are standard emoji, and there are no external images, sounds or fonts.

