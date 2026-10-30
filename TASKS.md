# TASKS.md — Memory Lane

> Update before ending every session. Format: `- [ ] task (owner)`. Move items between sections as they progress.

## Now
- [ ] Agree the shared event schema for reminders, activities and analytics (all; Member 4 drafts)
- [ ] Share the Git workflow in `AGENTS.md` with the team; consider branch protection so only the Lead can merge to `main` (Lead)
- [ ] Agree the voice-recognition approach and command contract (Lead and Ishani)

## Next
**Lead**
- [ ] Decide whether the Games covers should drop their `tint-butter` and `tint-peach` card colours for cooler tokens (Lead)
- [ ] Games: wire `onSelect(game)` in `PatientHome.handleSelectGame` to Richa's game pages and replace `gameArt.js` covers with real portrait art (Lead and Member 3). Confirm titles in `games/gameCards.js`.
- [ ] Compare the Memory Album with the reference video and tune `recede`, `keystone` and lens size in `MemoryCarousel.jsx` (Lead)
- [ ] Memory Album: replace demo data and `demoArt.js` with Member 3's real photos and narration through a `memories` prop (Lead and Member 3)
- [ ] Memory Album: keep the voice assistant state when opening a memory page (Lead)
- [x] Choose the font: Oswald (headings) and Figtree (body) applied app-wide (Lead, 2026-10-31)
- [ ] `src/ui/` primitives: Button, Card, Heading, Stack, Badge, using the tokens
- [ ] Review the Patient Home prototype in the browser and list changes (Lead)
- [ ] Patient home: wire the prototype to real reminders, games and album exports (replace `mockData.js` and `SectionPreview.jsx`)
- [ ] Voice: connect the real voice feature to `runCommand(id)` in `PatientHome.jsx` (Lead and Ishani)
- [ ] Replace the placeholder page title and add the active nav highlight (Lead)
- [ ] Caregiver dashboard: recompose to the direction (greeting banner, KPI cards, deep-teal chart, alerts) for mobile and desktop
- [ ] Caregiver dashboard: replace placeholder panels with real data and charts
- [ ] Integrate the feature exports into the screens
- [ ] Rewrite `README.md` for the project

**Member 2: reminders**
- [ ] Reminder data model and simulated schedule (medicine and routine)
- [ ] Patient reminder UI (gentle and dismissible)
- [ ] Routine tracking with completion events
- [ ] Voice prompt helper (Web Speech API), exported for the album

**Member 3: activities**
- [ ] 1–2 gentle games (e.g. matching pairs, ordering a daily routine)
- [ ] Memory album with sample photos and voice prompts
- [ ] Activity engagement events

**Member 4: analytics and QA**
- [ ] Simulated 7-day dataset (events) with a believable baseline
- [ ] Engagement metrics and baseline calculation
- [ ] Alert rules (engagement drop, missed reminders against baseline)
- [ ] Set up Playwright (needs Lead approval for dependencies) and write smoke tests

## Later
- [ ] Review the two interaction videos once keyframes or notes are supplied (Lead)
- [ ] Add Recharts for dashboard charts (Lead and Member 4)
- [ ] Accessibility pass against `DESIGN.md` (Member 4 and Lead)
- [ ] Demo script and final QA (all)

## Requests (changes needed in someone else's area)
_None yet._

## Done
- [x] Larger Oswald section titles for Games and Memory Album (Lead, 2026-10-31)
- [x] Typography: Oswald headings and Figtree body applied across both experiences, fonts verified loading, no overflow at 375/768/1280 (Lead, 2026-10-31)
- [x] Palette correction: warm lane tints and alert fill removed, carousel RGB fringe off, non-token art colours remapped, hex audit script clean (Lead, 2026-10-31)
- [x] Memory Album: edge-to-edge `tint-sky` background with centred content (Lead, 2026-10-31)
- [x] Colour refinement across Patient and Caregiver using existing Mint Daylight tokens: tint-sky album, category-tinted lane, caregiver deep header, section rules, alert panel, scroll-spy nav (Lead, 2026-10-31)
- [x] Games gallery on Patient Home: three portrait image cards above the Memory Album, single-card hover scale, responsive, `onSelect(game)` hook (Lead, 2026-10-31)
- [x] Memory Album integrated into Patient Home: OGL carousel in Mint Daylight, full-page memory detail, Back restores position, demo data, reduced-motion and no-WebGL fallback (Lead, 2026-10-31)
- [x] Visual direction approved; tokens migrated to Mint Daylight (Lead, 2026-10-30)
- [x] Patient Home prototype: greeting, Next up, Today's lane, Games and Memory Album tiles, persistent voice control (UI mock), `src/ui/Button` and icons (Lead, 2026-10-30)
- [x] Reviewed `design-references/` and documented the proposed visual direction in `DESIGN.md` (Lead, 2026-10-30)
- [x] App shell, view switcher, patient home and caregiver dashboard placeholders; unused template assets removed (Lead, 2026-10-30)
- [x] Design tokens in `src/index.css` with `@theme`; `DESIGN.md` token table updated (Lead, 2026-10-30)
- [x] Project docs: `AGENTS.md`, `context.md`, `DESIGN.md`, `TASKS.md` (Lead, 2026-10-30)
- [x] Doc verification; added the missing Git branching rules to `AGENTS.md` (2026-10-30)
- [x] Corrected Git rules: feature-branch pushes for teammates, Lead-only merges, read-only Git for Claude (2026-10-30)
