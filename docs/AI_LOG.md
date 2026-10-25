# AI log

NOTE:Claude has timestamps for each prompt, indicating that it is possible to get the time of previous prompts. The exact times are not included due to privacy concerns.

## Definitions:
"->" means follow-up.
"(())" refers to person giving comments in log.

### Log structure
| Date | Tool | What I asked | What it got right / wrong |

## Log
|20/10/2026|Claude|Explain the brief, hosting options, tech stack and how to approach it|Recommended plain HTML/CSS/JS and GitHub Pages, and pointed out that “how you used AI” and “how you tested” are graded, so I started logging. Right.|

|22/10/2026|Claude|Evaluate my game and app ideas for a 4-day scope|Ranked them by risk and advised against a bullet hell (feature creep). Cut the 8-shape gesture from the clicker idea because it was hard to detect. I chose the clicker.|

|22/10/2026|Claude|Repo setup, file structure, and the template/.gitignore/license questions|Structure was good. It suggested a Node .gitignore by mistake, and I questioned it. It corrected this to “None”.|

|23/10/2026|Claude|Generate the level 1 starter files|The first attempt failed to create the folders, because the command it used didn’t work in its shell, so it wrote the files again. The delivered version worked and the logic tests passed.|
->|23/10/2026|Claude|Generate the level 1 starter files (click, enemy HP, gold, idle damage, shop, logic tests)|Worked on the first run and all logic tests passed. Idle damage stopped in background tabs (see bug log).|

|24/10/2026|Claude|Fix idle damage in background tabs|Switched to measuring real elapsed time. Fixed.|

|24/10/2026|Claude|Add a boss fight with a timer and level unlocking|Boss, timer and unlock logic worked on the first try and passed the logic tests. The scaling design was flawed, because enemies kept getting stronger when replaying a level. I only found this by playing it.|
->|24/10/2026|Claude|Compare three fixes for runaway enemy scaling|Recommended scaling by kills per boss cycle instead of a counter that never resets. I chose it.|

|24/10/2026|Claude|Add the hold mechanic for level 2|Hold, early-release cancel and level switching worked in my manual tests. The first hold time of 700 ms felt too long when I played it.|
->|25/10/2026|Claude|Make the hold faster, and asked if the hold and drag mechanics could have their own damage multiplier|It pointed out that each level already has its own multiplier in config.js, so no new code was needed. It suggested halving holdMs to 350. I hadn’t edited the config yet, so this was applied together with the level 3 update.|

|25/10/2026|Claude|Add the drag mechanic for level 3|Right/Wrong|

|25/10/2026|Claude|Plan the last day (logs, README, video, level 3 in about 4 hours)((NOTE: I (the person) gave the AI 4 hours as I was not sure how much time I had left and gave it an estimation))|Gave a time-boxed plan and said what to cut first (level 3). I didn’t need to cut it.|


