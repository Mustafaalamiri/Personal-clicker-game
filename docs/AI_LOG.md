# AI log

NOTE:Claude has timestamps for each prompt, indicating that it is possible to get the time of previous prompts. The exact times are not included due to privacy concerns.

|20/10/2026|Claude|Explain the brief, hosting options, tech stack and how to approach it|Recommended plain HTML/CSS/JS and GitHub Pages, and pointed out that “how you used AI” and “how you tested” are graded, so I started logging. Right.|

|22/10/2026|Claude|Evaluate my game and app ideas for a 4-day scope|Ranked them by risk and advised against a bullet hell (feature creep). Cut the 8-shape gesture from the clicker idea because it was hard to detect. I chose the clicker.|

|22/10/2026|Claude|Repo setup, file structure, and the template/.gitignore/license questions|Structure was good. It suggested a Node .gitignore by mistake, and I questioned it. It corrected this to “None”.|

|23/10/2026|Claude|Generate the level 1 starter files (click, enemy HP, gold, idle damage, shop, logic tests)|Worked on the first run and all logic tests passed. Idle damage stopped in background tabs (see bug log).|

| Date | Tool | What I asked | What it got right / wrong |

|24/10/2026|Claude|Fix idle damage in background tabs|Switched to measuring real elapsed time. Fixed.|

|24/10/2026|Claude|Add a boss fight with a timer and level unlocking|Boss, timer and unlock logic worked on the first try and passed the logic tests. The scaling design was flawed, because enemies kept getting stronger when replaying a level. I only found this by playing it.|
->|24/10/2026|Claude|Compare three fixes for runaway enemy scaling|Recommended scaling by kills per boss cycle instead of a counter that never resets. I chose it.|

|24/10/2026|Claude|Add the hold mechanic for level 2|Worked in my manual tests. I asked for a faster hold and a mechanic-specific damage multiplier, which was already supported in the config.|