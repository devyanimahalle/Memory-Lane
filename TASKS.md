# TASKS.md — Memory Lane

> Update before ending every session. Format: `- [ ] task (owner)`. Move items between sections as they progress.

## Now
- [ ] Agree the shared event schema for reminders, activities and analytics (all; Member 4 drafts)
- [ ] Share the Git workflow in `AGENTS.md` with the team; consider branch protection so only the Lead can merge to `main` (Lead)
- [ ] Agree the voice-recognition approach and command contract (Lead and Ishani)

## Next
**Lead**
- [ ] Approve a one-line clarification in AGENTS.md that user-added memory content (photos, recordings) stays on the device and is never committed (Lead)
- [ ] Memory Detail: keyboard-only and reduced-motion pass; try real voices, Safari and Firefox recording (Lead and QA)
- [ ] Tell Member 3 (memory album) about the IndexedDB content layer so the real album reuses it, and agree the memory data shape (Lead and Member 3)
- [ ] Decide whether the Games covers should drop their `tint-butter` and `tint-peach` card colours for cooler tokens (Lead)
- [ ] Review the Dark Midnight game pages in the browser, including whether the duplicate kind message in Matching Pairs and Picture Puzzle should be tidied (Lead)
- [ ] Review the artwork in the browser (the matching rose looks like a lollipop; the Spot the Difference cover shows two slightly different gardens) (Lead)
- [ ] Games follow-ups: keyboard-only and screen-reader pass, real audio, reduced motion at runtime, Safari and Firefox; consider code-splitting the game art (main bundle +47 kB) (Lead and QA)
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
- [x] Caregiver dashboard: replace placeholder panels with real data and charts (analytics summary integrated, CSS chart)
- [ ] Integrate the feature exports into the screens
- [ ] Rewrite `README.md` for the project

**Member 2: reminders**
- [x] Reminder data model, status and snooze logic, completion events and voice-phrase matching integrated into Patient Home (Lead, 2026-10-31; Ishani to review the port)
- [x] Voice prompt helper (Web Speech API) used by the Ask me assistant; consent-gated listening
- [ ] Show reminder and routine event history on the caregiver dashboard (her ReminderModule has a history list that was not integrated)
- [ ] Persist reminder status across reloads
- [ ] Voice prompt helper exported for the Memory Album read-aloud

**Member 3: activities**
- [x] Richa's Matching Pairs, Spot the Difference and Picture Puzzle ported with keyboard play, sound toggle and original illustrations (Lead, 2026-10-31; Richa to review the port)
- [ ] Memory album with sample photos and voice prompts
- [ ] Activity engagement events

**Member 4: analytics and QA**
- [ ] Simulated 7-day dataset (events) with a believable baseline
- [ ] Engagement metrics and baseline calculation
- [ ] Alert rules (engagement drop, missed reminders against baseline)
- [ ] Set up Playwright (needs Lead approval for dependencies) and write smoke tests

## Later
- [ ] Location follow-ups: test real GPS on a phone (consent, denied, unavailable); remove the remaining emoji in `LocationMap` overlay buttons; fix the `LocationMap` exhaustive-deps warning; decide whether to keep OpenStreetMap tiles online-only; real cross-device tracking is out of scope (needs a server)
- [ ] SOS follow-ups: add a real demo number to `PATIENT.caregiver.phone` to enable the Call button; check the right-edge SOS button and its gutter on a real notched phone, also in landscape; screen-reader, real-device and other-browser checks; real alerting (SMS or push) is out of scope for the prototype (Lead)
- [ ] Review the two interaction videos once keyframes or notes are supplied (Lead)
- [ ] Add Recharts for dashboard charts (Lead and Member 4)
- [ ] Accessibility pass against `DESIGN.md` (Member 4 and Lead)
- [ ] Demo script and final QA (all)

## Requests (changes needed in someone else's area)
- **Ishani (reminders and location):** please review the Lead's port: `src/features/reminders/` (logic extracted, UI not used), `src/features/location/` (adapted: patient-side sharing, no address search, token styling) and note that `LocationModule` never called `evaluateCaregiverBreach` on your branch and `integration.test.js` imports missing exports.
- **Richa (activities):** please review the Lead's port in `src/features/activities/` (new `index.js`, `useGameSession.js`, `art/`; her images and CSS were not used) before it is committed to your branch or main.
- **Sahasra (analytics):** consume the game events `{ id, type:'game', action:'completed', label, occurredAt, durationMinutes }` (emitted once per completed round; wiring comes in Games Phase 3) and add per-game counts.
- **Sahasra (analytics, earlier):** (1) please review the Lead-added `src/features/analytics/index.js` (re-exports `getAnalyticsSummary` only). (2) Add per-game and per-album counts to `daily[]` so the dashboard can split engagement. (3) Optional: a `dateLabel` on alerts, or message templates without the raw ISO date (the dashboard currently rewrites the date with a regex). (4) Confirm the provisional thresholds and the patient identity (`analyticsPatient.displayName`) with the product lead.

## Done
- [x] Ishani's work integrated: reminders and voice into Patient Home (existing UI), GPS location sharing on the patient side with explicit consent and a caregiver Location safety section (same-browser, disclosed), Leaflet added, AGENTS.md exceptions recorded (Lead, 2026-10-31)
- [x] SOS button moved to the right edge of the viewport, vertically centred, with a reserved right gutter; verified at 375, 768 and 1280px on every patient page with no overlap or horizontal scroll (Lead, 2026-10-31)
- [x] SOS fixes: browser Back/Forward protection while an SOS is active, mobile SOS button moved into the Ask me bar row so it never covers content, demo caregiver renamed to Ananya in the lane and memories (Lead, 2026-10-31)
- [x] Global SOS assistance: coral SOS button on every patient page, confirmation, Mint Daylight assistance screen (caregiver Ananya, placeholder number, no tel link until configured), live caregiver alert with acknowledge, resolve and demo reset, same-origin tab sync (no other devices), tokens `sos` and `sos-strong` (Lead, 2026-10-31)
- [x] Dark Midnight theme for the three game pages: navy ground, dark teal surfaces, mint accents, dark Ask me bar while a game is open; contrast-checked; nothing else restyled (Lead, 2026-10-31)
- [x] Games Phase 3: gallery shows Matching Pairs, Spot the Difference and Picture Puzzle with the new covers; each card opens its game in a `game` view of Patient Home (history, scroll and focus restore); completed rounds are recorded once in `games/engagementLog.js`; 16-card phone text improved (Lead, 2026-10-31)
- [x] Games Phases 1 and 2: three games ported with one shared engagement hook and public `index.js`; original token-only artwork (16 cards, 3 scenes with 5 differences each, 4 puzzles, 3 covers); browser-tested; not yet connected to the gallery (Lead, 2026-10-31)
- [x] Memory Detail upgraded: uploaded photos, editable description, text-to-speech controls, microphone voice notes, IndexedDB persistence per memory ID, first photo as carousel cover (Lead, 2026-10-31)
- [x] Analytics integrated into the Caregiver Dashboard: engagement chart, alerts, medicine week, activity and meals strips; Mr. Sharma in both views (Lead, 2026-10-31)
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
