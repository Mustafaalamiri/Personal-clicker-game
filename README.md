# Idle Clicker

Work in progress.


## The process
See docs/GENERAL.md

## 25/10/2026
Adding comprehensive unit and smoke tests
Node.js and npm are required to run the tests locally.

In addition, Playwright is required for smoke tests in order to test behavior within the browser.

starting the entire test suite

`npm run test:all`

Alternatively, you can also run the entire test suite via GitHub Actions.

**Suspicion:** A boss that appears as a result of idle damage inherits the remaining time from the previous tick, which can cause it to vanish immediately.

The test, however, expects an active boss with a full 30 seconds, and should therefore currently fail.

As expected, the reproduction test failed on the unmodified code; the bug was specifically fixed in `js/main.js.`

Contributor:

Mcpasi

https://github.com/Mcpasi



## How I used AI
See docs/AI_LOG.md

## Testing
See docs/TESTING.md
