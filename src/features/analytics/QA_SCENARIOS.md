# Analytics QA Scenarios

All scenarios use SIMULATED data only. The analytics support caregivers and
do not diagnose or make medical claims.

Provisional thresholds (to be confirmed with the product lead):
- Baseline: 3 activities per day
- Low engagement alert: 2 consecutive complete low days
- Missed medicine alert: 2 or more missed medicines in one complete day

Engagement = games played + activities completed + album interactions.
Missed medicine = scheduled - confirmed.
| 13 | No complete days | Every day missing | Weekly totals, average and medicine percent are null (not 0) |
| 14 | Missing calendar date | Low on 10-26, no row for 10-27, low on 10-28 | No alert, the date gap breaks the streak |
| 15 | Rows out of order | Days given 26th, 24th, 25th | Sorted by date first, then alerts work correctly |
| 16 | Zero medicines scheduled | 0 scheduled, and separately 2 scheduled with 0 confirmed | Percent is null for the first (not applicable) and 0 for the second |
## How to run the tests

    node --test src/features/analytics/analytics.test.js

Expected: 17 tests, all passing.

## Scenarios

| # | Scenario | Input | Expected outcome |
|---|----------|-------|------------------|
| 1 | Normal day | 2 games, 2 activities, 2 album, 2 of 2 medicines | Engagement 6, 0 missed, 100%, no alert |
| 2 | Missing-data day | All values null | Engagement null (not 0), skipped by totals and alerts |
| 3 | Half-filled day | One value null | Treated as missing data, no alert |
| 4 | One low day | Engagement below 3 for one day | No alert |
| 5 | Two low days in a row | Two consecutive complete low days | One gentle low-engagement alert |
| 6 | Low, gap, low | Low day, missing day, low day | No alert, the gap breaks the streak |
| 7 | One missed medicine | 1 of 2 confirmed | No alert |
| 8 | Two missed medicines | 0 of 2 confirmed | One missed-medicine alert |
| 9 | Incomplete current day | Today still in progress | Ignored by alerts |
| 10 | Fewer than 4 complete days | 2 complete days | Trend says not-enough-data |
| 11 | Demo week | Simulated seven days | 5 complete days, 2 without data, total engagement 17, medicine 70%, trend decreasing, 2 alerts |
| 12 | Alert wording | Any alert | Gentle, includes "Consider checking in", no diagnosis words |

## Known limits

- Thresholds are provisional.
- Data is simulated, with no real patient information.
- Trend needs at least 4 complete days.