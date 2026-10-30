# context.md — Memory Lane

> Read this before working. Update it (and `TASKS.md`) before ending every session.

## Goal
A 24-hour hackathon prototype for dementia care: a **gentle companion** for elderly people with dementia, plus a **dashboard for remote caregivers**.

## Requirements
**Patient experience**
- A simple, accessible home screen.
- Medicine and daily routine reminders.
- Gentle cognitive games.
- A familiar photo memory album with voice prompts.
- **Voice commands** (agreed requirement, implemented by Ishani): spoken input as well as spoken output. UI states and technical/privacy options are in `DESIGN.md`.

**Caregiver experience**
- View patient engagement over a simulated 7-day period.
- Track reminders and activities.
- Alert when engagement drops or reminders are missed, compared with the person's usual baseline.

**Constraints:** simulated data only. No real patient data, APIs, hardware or medical diagnosis. Keep the experience calm, accessible and non-judgmental. Teammates may not change the shared app shell or global styles without Lead approval.

## Architecture
One React + Vite application. Features are isolated, and the shared shell and dashboard UI are owned by the Lead.
```
src/app/                 app shell, patient/caregiver view switch, providers   (Lead)
src/ui/                  design-system components                              (Lead)
src/components/          shared visual components (FlexCarousel, OGL)          (Lead)
src/index.css            Tailwind v4 import and @theme tokens                  (Lead)
src/screens/patient/     patient home                                          (Lead)
src/screens/caregiver/   caregiver dashboard UI and integration                (Lead)
src/features/reminders/  reminders, routine tracking, voice prompts            (Member 2)
src/features/activities/ cognitive games, memory album                         (Member 3)
src/features/analytics/  simulated 7-day data, metrics, baseline, alerts       (Member 4)
```
Data flow: reminders and activities emit **events**, analytics consumes the events and the simulated history, and the caregiver dashboard renders the metrics and alerts. Each feature exports from its `index.js`.

## Team
| Who | Owns |
|---|---|
| Lead (product lead) | Frontend, visual design, design system, app shell, patient home, caregiver dashboard UI and integration |
| Member 2 | Reminders, routine tracking, voice prompts |
| Member 3 | Cognitive games, memory album |
| Member 4 | Simulated data, analytics calculations, alerts, QA |

## Git workflow (summary; full rules in `AGENTS.md`)
Teammates commit and push only to their own `<area>/<task>` feature branches. Only the product lead merges into `main`. Claude Code never runs Git write operations (no commit, push, merge, rebase, branch create/delete). It may inspect status, diffs and logs, and leaves changes ready for human review.

## Current status
- Vite + React + Tailwind v4 + Motion template installed. `src/App.jsx` and `README.md` are still template defaults.
- Project docs created.
- Design tokens defined in `src/index.css` (`@theme`): now the Mint Daylight set (soft white and mint primary; deep turquoise, navy and deep teal secondary), plus type scale, spacing, radii, shadows, motion and global base styles. `npm run lint` and `npm run build` pass.
- **Memory Album integrated into Patient Home** (2026-10-31, Lead-owned files only): the peach album tile is gone and a full-width Memory Album section sits below Today's lane. It uses the OGL `src/components/FlexCarousel` (original lens/wave shader kept; added `recede`, a keystone vertex effect, `initialIndex`, an imperative `next/prev/goTo` handle and a stiff spring under reduced motion; Unsplash demo URLs removed; CSS themed to the Mint Daylight tokens). Tapping the centred card, or "Open this memory", opens a full-page memory (`memories/MemoryDetail`: photo viewer, description, optional narration). Back (button, browser or phone) returns to Patient Home with the carousel index and scroll restored (state in `history.state.memoryIndex`, hash `#memory-<id>`). Demo data in `src/screens/patient/memories/demoMemories.js` (SVG stand-ins from `demoArt.js`; future assets go in `public/memories/<id>/`). Narration: recorded `audio.src` is supported; otherwise the browser's built-in "Read to me". No-WebGL2 fallback is a scrolling list. The carousel chunk is lazy-loaded (about 24 kB gzip). `ogl` was already in `package.json`; no dependencies added. Feature folders untouched.
- **Games gallery on Patient Home** (2026-10-31, Lead-owned): full-width section `src/screens/patient/games/` directly above the Memory Album. Three portrait (3:4) image-led cards from `gameCards.js` (stand-in SVG art in `gameArt.js`). One column on phones (image beside text), two columns on tablets, three from 1024px. Only the hovered card scales (1.05, z-index 10, 300ms, hover-capable devices only via Tailwind's `@media (hover:hover)`, off under reduced motion). `GamesSection` calls `onSelect(game)`: that is the integration point for the real game pages (Member 3 / Richa); `PatientHome.handleSelectGame` is intentionally a no-op. No placeholder game page. The old Games tile (`EntryTiles.jsx`) and `SectionPreview.jsx` were removed; the voice "Play a game" now scrolls to the gallery.
- **Colour refinement applied** (2026-10-31, Lead-owned files; no new hues): Memory Album section on `sunken` (was `tint-sky`, see the 2026-10-31 album background entry), memory-page photo viewer on `tint-sky`; Next up has an accent left rule and time chip; lane stops tinted by category; Caregiver has a deep header band, `sunken` sidebar with scroll-spy active state, coloured panel top rules and an `attention-soft` Alerts panel; the demo bar is white. See DESIGN.md "Colour usage". Feature folders, Games gallery layout and Memory Album behaviour untouched.
- **Patient Home prototype built** (Mint Daylight, mock data, Lead-owned files only): `src/screens/patient/` (`PatientHome`, `GreetingHeader`, `NextUpCard`, `DayLane`, `EntryTiles`, `Scenes`, `VoiceAssistant`, `SectionPreview`, `mockData`, `useDemoClock`), `src/ui/Button.jsx`, `src/ui/icons.jsx`. Tokens in `src/index.css` migrated to soft white/mint (names unchanged, so the shell and caregiver placeholder follow). `PatientLayout` widened. Details in `DESIGN.md`. Voice is a UI-only mock with `runCommand(id)` as the integration point. Demo clock: `?time=HH:MM`.
- **App shell done** (placeholders only): `src/app/` holds `ViewProvider`/`useView` (state toggle, persisted in `localStorage`, `?view=patient|caregiver` override), `ViewSwitcher` (radio group), `AppShell` (skip link, demo bar, fade between views, focus moves to the `h1`), `PatientLayout` (centred 40rem column) and `CaregiverLayout` (top bar under 768px, sidebar from 768px).
- `src/screens/patient/PatientHome.jsx`: greeting, date and three big cards (My day, Games, Photos). Each opens a "coming soon" page with a "Back to home" button.
- `src/screens/caregiver/CaregiverDashboard.jsx`: one scrolling page with Overview, Reminders and Activities sections of placeholder panels, linked from the nav by anchors.
- Removed unused template files: `src/App.css`, `src/assets/*`, `public/icons.svg`. `public/favicon.svg` stays (used by `index.html`).
- Verified: `npm run lint` clean, `npm run build` passes, Playwright CLI check of the view switch, persistence, focus handling and layouts at 375/768/1280px. `src/ui/` is not created yet.
- Feature folders (`src/features/*`) do not exist yet and were not touched. Feature owners plug in through each feature's `index.js` during integration.

## Open decisions
- [ ] Member 2–4 names.
- [ ] Event schema shared by reminders, activities and analytics (proposal: `{ id, type, timestamp, featureId, status, meta }`).
- [ ] Voice commands approach with Ishani: Web Speech `SpeechRecognition` (Chrome sends audio to a remote service), on-device WASM recognition, or a hybrid; command contract with the shell. See `DESIGN.md`.
- [x] Visual direction "Mint Daylight" approved; tokens migrated (2026-10-30).
- [x] Fonts: decided. Oswald Variable for headings and titles, Figtree Variable for body and interface (Fontsource, self-hosted). Proxima Nova and Sailors remain references only.
- [ ] Interaction videos in `design-references/` are unreviewed (pending keyframes or notes).
- [ ] Voice prompts: browser Web Speech API (`speechSynthesis`, on-device, no external API). Helper lives in `reminders/` and is exported for the album. To be confirmed.
- [ ] Shell follow-ups for the Lead: the page `<title>` is still "memory-lane"; patient section pages and the caregiver nav have no active-section highlight yet.
- [ ] Token review by the Lead: palette and system-font choice (swap in a webfont only if wanted).
- [ ] Baseline and alert thresholds (e.g. a drop of X% against the 7-day average).
- [ ] Whether to enable GitHub branch protection on `main` so that only the Lead can merge.
- [ ] Playwright and Recharts install timing (needs Lead approval for dependencies).

## Session log
- **2026-10-30:** Lead and Claude created `AGENTS.md`, `context.md`, `DESIGN.md` and `TASKS.md` from the agreed brief. No app code changed.
- **2026-10-30:** Verified the four docs. Requirements, ownership, feature boundaries and the session-end rule were present. **Git branching rules were missing**, so they were added to `AGENTS.md` as proposed defaults and summarised here. No app code changed.
- **2026-10-30:** Corrected the Git rules in `AGENTS.md`, `context.md` and `TASKS.md`: teammates push to their own feature branches, only the Lead merges to `main`, and Claude Code is read-only for Git. No app code changed.
- **2026-10-30:** Design-token task done. `src/index.css` now holds the `@theme` tokens and minimal base styles (see `DESIGN.md` for the token table). Text/background pairs were contrast-checked (patient text 7:1 or better). No dependencies added; no components or screens built.
- **2026-10-30:** Built the app shell and placeholder screens with the state toggle, one scrolling caregiver dashboard and minimal patient navigation. Removed verified-unused template assets. Feature folders untouched, no dependencies added. Lint and build pass.
- **2026-10-30:** Reviewed `design-references/` with Taste Skill and added a proposed visual direction ("Mint Daylight") to `DESIGN.md`: reference findings, palette hierarchy (mint and white primary, navy/turquoise/deep teal secondary), font comparison, mobile and desktop compositions, voice options, pattern separation. Proposal only: tokens in `src/index.css` are still the cream set. Videos pending. No app or feature code changed.
- **2026-10-30:** Built the Patient Home prototype (mobile first, two columns from 1024px) and migrated tokens to Mint Daylight. Verified with lint, build, a contrast script and Playwright CLI at 375, 768 and 1280 (Done, Remind me later, voice chips, album and games previews, `?time=` states, tab order, caregiver view unaffected). Feature folders, `package.json` and Git untouched. Known: on phones the open voice sheet can cover the highlighted card until closed; tablet shows the voice bar, not the panel.
- **2026-10-31:** Integrated the Memory Album (see Current status). Verified with lint, build and Playwright CLI at 375, 768 and 1280: drag, Next/Previous, keyboard (arrows, Home, End), open memory, Back button, browser Back/Forward, scroll and index restore, voice "Show photos", reduced motion (near-instant spring) and the no-WebGL fallback. Not verified: the reference video itself (cannot be played here), real audio narration (no files), real photos. Known: the voice assistant resets when entering a memory page (it re-mounts as a bottom bar); side cards are clipped by the panel edge by design.
- **2026-10-31 (later):** Built the Games gallery (see Current status). Verified lint, build, 1280/1024/768/375 layouts (no horizontal overflow; one row from 1024), hover scales only the hovered card, voice "Play a game", Memory Album open/back still restore scroll and focus. Not verified: real touch hardware (the CSS media gate was checked in the built CSS, not on a device); the tablet two-column layout is tall because the art is portrait.
- **2026-10-31 (colour pass):** Applied the approved colour refinement across both experiences. Verified lint, build, a contrast script (all patient and caregiver pairs pass; accent on sky is 6.91:1 but is not used as text there), screenshots at 375, 768 and 1280 for both views (no horizontal overflow), Games hover (only the hovered card scales), memory open/Back (scroll and focus restored) and the caregiver scroll-spy. Not verified: the voice chips again after the colour change, and the memory page at 375/768. The caregiver page is short, so the scroll-spy marks the last section when scrolled to the bottom.
- **2026-10-31 (album band):** The Memory Album section now has an edge-to-edge `tint-sky` background (clipped `box-shadow` on the section in `MemoryAlbumSection.jsx`) while its content stays centred at the page column width. Verified at 375, 768, 1280 and 1920px with no horizontal overflow; lint and build pass.
- **2026-10-31 (palette correction):** Removed the warm drift from the colour refinement using existing tokens only. Lane tints are now cool (sky, sage, mint, accent-soft); the caregiver Alerts panel is white with a deep-teal rule; the carousel's `dispersion` is 0 (no pink/cyan fringes); non-token hex values (`rose`, `sand`, `leaf`) were removed from `gameArt.js` and `demoArt.js`. The Memory Album band was already exactly `tint-sky` (#dcebf7, pixel-checked). A script confirms there is no hex outside `index.css` in `src/`. Left as approved: the Games covers still use `tint-butter` and `tint-peach` as card backgrounds and objects. Check these cards and decide whether to cool them.
- **2026-10-31 (album background):** The Memory Album band was too blue, so `MemoryAlbumSection.jsx` now uses `bg-sunken` (#e3f4ee) with a `var(--color-sunken)` edge-to-edge shadow instead of `tint-sky`. Technique, centred content, carousel and behaviour unchanged. The memory page's photo viewer still uses `tint-sky`. Lint and build pass; no horizontal overflow at 375, 768 and 1280.
- **2026-10-31 (typography):** Applied Oswald (headings, titles) and Figtree (everything else) across Patient Home, Games, Memory Album, Memory Detail and the Caregiver dashboard. Changes: fonts imported in `src/main.jsx`; `--font-sans` and `--font-heading` tokens plus an `h1` to `h4` base rule in `src/index.css`; `font-heading` added to the non-heading titles (Next up, lane, game and memory titles, caregiver wordmark); `.flex-carousel__title` uses Oswald. Verified in the browser: both families report `loaded` (latin subsets, two woff2 requests), `h1` and title classes compute to Oswald, body and buttons to Figtree. Lint and build pass; no horizontal overflow at 375, 768 and 1280 on Patient, Caregiver and the memory page; no clipping seen in the screenshots reviewed. Not changed: sizes, colours, layout, illustrations (Games art letters stay Arial). Headings look narrower than before at the same size; any size adjustment is a later decision.
- **2026-10-31 (section titles):** Games and Memory Album titles are now larger Oswald (`text-4xl` on phones = 36px, new `--text-section` 40px from md), identical to each other; Today's lane, other headings and card titles unchanged. The carousel subtitle and counter were switched back to Figtree (they had inherited Oswald from the caption title). Checked computed sizes and screenshots at 375, 768 and 1280: no overflow, no wrapping or clipping.
- **2026-10-31 (top bar):** In `AppShell.jsx` the demo bar's left text "Demo: switch between the two experiences" was replaced by the Memory Lane wordmark (Oswald, 24px, bold). The switcher, bar height, padding, colours and toggle are unchanged. Verified at 375, 768 and 1280 (bar heights 105/69/69 as before, no overflow, toggle switches views). The caregiver sidebar also still shows a Memory Lane wordmark, so the name appears twice on desktop caregiver; left as is.
