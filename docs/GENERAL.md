
## General Log
Note: time reflects the occurrence of events rather than the time of the commits

### 22/10/2026 23:50
Due to the repo being made after the brainstorming, I've decided to put some details here:
Prompts have timestamps, therefore I will add the necessary additions in AI_LOG.md
Logs in AI_LOG.md reflect that the brainstorming process and reading through the task took around 3 days

### 23/10/2026 22:10
After brainstorming with the AI, We've selected a concept with various ideas to prove its "uniqueness". Due to the vagueness of the task, the AI has suggested a specific structure with various files, as well as 2 additional .md files. imports the .zip file Sonnet created. Will look through the unedited files before testing.

### 24/10/2026 17:00
After looking through some of the files, I started testing alongside the tests Sonnet had prepared at tests/tests.html. I found an inconsistency and got a fix from Claude. Noticed none of the pushes had reached github, it should be fixed now. Claude gave instructions on how to set up the Github Pages site, it is operational now.

### 24/10/2026 17:20
AI gave another zipped file containing the updates. Importing these.

### 24/10/2026 19:20
Testing shows that scaling continues after beating/failing the boss and replaying the level.

### 24/10/2026 19:52
Fixed. lvl 1 initial HP 10, lvl 2 initial HP 80.

### 24/10/2026 20:05
Importing update for hold mechanic (lvl 2).

### 24/10/2026 20:56
Testing shows hold mechanic is operational. Currently only balance issues. user-testing shows the hold mechanic is "too long", will adjust eventually.

### 25/10/2026 16:30
Added previous prompts

### 25/10/2026 17:15
Added the drag mechanic for lvl 3. Currently visually questionable, will see if able to polish or not.

### 25/10/2026 17:45
Tested. Balancing issues in terms of damage, drag mechanic not forgiving, updating

### 25/10/2026 18:20
Patched drag-mechanic, should be more forgiving. Balance issues remain, not adjusted since still prototype. 

### 25/10/2026 19:00
Testing complete, logic tests passed. Prototype seems good enough as it is now. As a future thought, it would be better to add another level between the click and hold level to introduce the concept of a target switching locations, as the target at lvl 1 is static. There are some other issues, such as balancing (mentioned frequently), variety in upgrades, etc. The biggest flaw is the concept of idleness. The AI wanted to call the game "idle clicker", yet the idle upgrade proves to be very ineffective currently. For this, I have personally change the title to "A Clicker Game" to reflect this. This may not be a significant change.
For testing part, the line in lvl 3 is more visible and includes its own padding it seems, meanwhile the box the emoji had (similar to lvl 1) is gone, which should be more visually acceptable.