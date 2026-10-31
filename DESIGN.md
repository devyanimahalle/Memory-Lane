# DESIGN.md — Memory Lane

Owned by the Lead. Propose changes in `TASKS.md` → **Requests**.

## Principles
- **Calm:** warm, soft and uncluttered. Nothing flashes, nothing rushes.
- **One thing at a time:** each patient screen has one clear primary action.
- **Non-judgmental:** no "wrong", "failed", "missed!", scores or timers on patient screens.
- **Familiar:** real-feeling photos, plain words, consistent placement.

## Accessibility (non-negotiable)
- Patient text contrast aims for 7:1 (AAA). Caregiver UI meets at least AA (4.5:1).
- Patient body text is 20px or larger. Headings are 32px or larger.
- Touch targets are at least 56×56px on patient screens and 44px on caregiver screens.
- Focus rings are always visible. Everything works by keyboard. Images have real `alt` text.
- Icons always come with a text label. Colour is never the only signal.
- Honour `prefers-reduced-motion`.

## Tokens
Defined in `src/index.css` with Tailwind v4 `@theme` (Lead only). Use the utilities (`bg-canvas`, `text-ink`, `bg-accent`, `rounded-lg`, `shadow-card`, `text-lead`, `min-h-touch-lg`); never hardcode values.
| Group | Tokens |
|---|---|
| Surfaces | `canvas` (warm cream page), `surface` (cards), `sunken`, `line`, `line-strong` (control borders, 3.8:1) |
| Text | `ink` (14.6:1), `ink-soft` (8.4:1), `ink-faint` (5.7:1, caregiver meta text only) |
| Accent | `accent`, `accent-strong`, `accent-soft`, `on-accent`: calm teal for primary actions |
| Positive | `gentle`, `gentle-ink`, `gentle-soft`, `on-gentle`: soft green for "done" |
| Alerts | `attention`, `attention-ink`, `attention-soft`: muted amber, never alarm red (the SOS button is the one exception, see "SOS assistance": `sos`, `sos-strong`) |
| Focus | `focus`: 3px ring, applied globally to `:focus-visible` |
| Charts | `chart-1` to `chart-4` for Recharts series |
| Type | `font-sans` (Figtree Variable) for body and interface, `font-heading` (Oswald Variable) for headings and titles, both self-hosted via Fontsource; `text-caption` 14, `text-body` 16 (caregiver), `text-lead` 20 (patient body), `text-title` 32, `text-display` 44 |
| Spacing | Tailwind 4px base, plus `touch` (44px), `touch-lg` (56px), `gutter`, `gutter-lg` |
| Radii | `sm` 8, `md` 12, `lg` 20, `xl` 28 |
| Shadows | `soft`, `card`, `raised`: warm-tinted and low contrast |
| Motion | `ease-gentle`, `duration-quick/gentle/slow` (200/300/400ms) |

**Type:** two scales on one family. **Patient** uses `lead`/`title`/`display`; **Caregiver** uses `caption`/`body`.

## Motion (Motion for React)
- Use gentle fades and small slides, 200–400ms, ease-out.
- No bouncing, flashing, auto-advancing or time pressure in games.
- With reduced motion, use opacity changes only, or no animation.

## Layout modes
- **Patient:** full-screen, big cards, a large greeting with the time and date, and at most 3–4 choices (Reminders, Games, Photos).
- **Caregiver:** a dashboard grid with a 7-day overview, reminder and activity tracking, and an alerts panel. Charts use Recharts later and follow the same tokens.

## Copy tone
| Context | Do | Don't |
|---|---|---|
| Reminder | "Time for your morning tablets. Take your time." | "You missed your medicine!" |
| Game end | "That was lovely. Shall we play again?" | "Score: 3/10" |
| Album prompt | "This is Sarah at the beach. Do you remember that day?" | "Who is this? Guess!" |
| Caregiver alert | "Engagement is lower than usual for 2 days." | "Patient declining" |


---

# Visual direction ("Mint Daylight"): approved, tokens applied

Status: **approved by the Lead; tokens applied in `src/index.css` and used by the Patient Home prototype.** Font is still open (system stack in use). Based on `design-references/`, treated as inspiration, not specification. The token table near the top of this file still lists the old cream values: **where it disagrees with this section, this section and `src/index.css` win.** Applied token values: `canvas` #f7fbfa, `sunken` (mint) #e3f4ee, `ink` (navy) #12293a, `accent` (deep turquoise) #08565d, `turquoise` #0e9ba0 (decorative only), `deep` #0e3a44, tints `tint-sage/sky/peach/butter`. All text pairs were contrast-checked (patient text 7:1 or better); resting shadows are nearly removed.

## References reviewed
| File | Takeaway |
|---|---|
| `brand/` (Centra Pharmacy board, AI-generated mockup) | Mint, turquoise, navy and deep teal. Bento tile composition, quarter-circle geometry, short confident tagline. The clinical pharmacy feel is dropped |
| `typography/` (Proxima Nova + Sailors) | Friendly humanist lowercase against a big condensed display. Kept as the **typographic reference** only |
| `patient-ui/` screenshots (mobile) | One question per card, vertical day timeline, big pill buttons, "Remind me later", tinted category tiles. Problems: dark header, white text on orange/yellow (about 2:1), red blob, "Yes/No", "1/5 Completed", percentages, tiny text |
| `caregiver-ui/` screenshot (desktop) | Greeting banner, KPI cards, pill lists with badges, dark analytics card. Problems: rainbow donut, indigo, marketplace content, coins and dollar stats, search bar |
| `interactions/*.mp4`, `patient-ui/*.mp4` | **Pending.** Videos can't be inspected here, so no findings are drawn from them. Provide a few keyframe screenshots or a short description of each to unblock |

No source code was supplied (images and videos only), so there is nothing to reuse or assess for code compatibility. All references are third-party work: no logos, illustrations or copy are reused.

## Direction: "Mint Daylight" (the Lane)
- **Idea:** the product name, a *lane*, becomes the **timeline**. The patient's day is a gentle path of stops, and the caregiver's week is the same path with seven stops.
- **Live thing:** the voice button ("Ask me"). "What's next?" highlights the next stop on the lane and reads it aloud.
- **Surface and shape:** pill buttons (decided once), 20-28px card radius, surfaces separated by tone steps. Resting shadows are reduced; shadows stay for raised or pressed states.
- **Taste Skill rules applied as app-screen rules:** no gradients or glows, no rainbow charts, no icon-in-tinted-square cards, no eyebrows or tiny caps, no invented vanity numbers. The references break several of these, which is why they are inspiration only.

### Palette hierarchy
| Tier | Colours | Use |
|---|---|---|
| **Primary** | **Soft mint and soft white** | Page and card ground (soft white), tinted surfaces and brand wash (mint). **Not cream:** the current cream `canvas`/`sunken` tokens are superseded once this is approved |
| **Secondary** | Turquoise, navy, deep teal | Turquoise for actions and highlights, navy for headings and ink-level emphasis, deep teal for the caregiver analytics card and strong panels |
| **Supporting** | Four soft category tints, muted amber | Category tiles (colour is never the only cue), caregiver alerts. No alarm red |

Exact values come from the token-migration task and are contrast-checked as before (patient text 7:1 or better). `src/index.css` is unchanged by this proposal.

### Typography (decided and implemented 2026-10-31)
- **Oswald Variable** (`font-heading`): `h1` to `h4` (global base rule) and short titles that are not heading elements (Next up and lane titles, game and memory card titles, the carousel caption title, the caregiver wordmark). Sentence case, never for running text.
- **Figtree Variable** (`font-sans`, the default): body text, descriptions, buttons, navigation, chips, times, notes and all supporting interface text.
- **Section titles:** the Games and Memory Album titles on Patient Home use `text-section` (40px from 768px, 36px on phones) in Oswald, larger than "Today's lane" (32px) and well above card titles (20px). Page title stays largest (44px). Other headings are unchanged.
- **Source:** `@fontsource-variable/oswald` and `@fontsource-variable/figtree` (SIL OFL), imported in `src/main.jsx` (`wght.css`). Self-hosted, no external requests; the browser downloads only the latin subset unless other scripts are needed. System fonts remain as fallbacks. Sizes, weights and spacing are unchanged from the system-font version.
- **Supersedes** the earlier note "no condensed text for patients": Oswald is condensed, so keep it to short headings and titles. The Proxima Nova and Sailors references stay as inspiration only.
- **Known gap:** the letters inside the Games "Find the word" SVG art use Arial, because an image loaded from a data URI cannot use page fonts. The real cover art will replace it.

## Compositions (mobile and desktop weighted equally)
| Screen | Mobile (375) | Desktop / tablet |
|---|---|---|
| **Patient home** | Greeting, one big "Next up" card (Done / Remind me later), 2x2 tinted tiles (My day, Games, Photos, Ask me), then "Today's lane" as a vertical timeline | Centred column of about 64rem, never stretched. Left: Next up and the lane. Right: the tile grid, with Ask me as a labelled panel. 56px targets and patient type scale kept |
| **Memory album** | Full-width photo, caption, "Tell me about this" voice prompt, large Previous/Next | Large photo with the caption and voice prompt in a panel beside it |
| **Game** | One card at a time, large targets, no timer or score | Same card centred at a comfortable width |
| **Caregiver** | Alert card first, greeting summary, 2-up KPI cards, full-width 7-day chart, reminders list, activity breakdown. Top nav with anchors | Sidebar, greeting banner, row of 4 KPI cards with sparklines, deep-teal engagement chart with baseline band (2/3), alerts list (1/3), reminders timeline, activity breakdown |

**Lane states:** done (soft green), now (turquoise), later (neutral). Nothing is red or "missed"; an unfinished stop reads "Still to do".

## Voice commands (agreed requirement, owned by Ishani)
Voice is a full requirement with spoken **input and output**. This document covers the UI and the technical options. Ishani implements, and no feature folder is touched here.

**UI states:** a persistent, labelled mic button with idle, listening (soft ring; opacity-only under reduced motion), understood, speaking and error states, plus a live caption. Every command has an on-screen equivalent. Starter commands: What's next, Read my reminders, Show photos, Play a game, Go home.

| Option | Pros | Cons / privacy |
|---|---|---|
| A. Web Speech `SpeechRecognition` | No dependency; quick to demo | Chrome sends audio to a remote service (conflicts with "no external APIs"); Safari varies; no Firefox |
| B. On-device recognition (e.g. Vosk or Whisper via a WASM build) | Audio stays on the device | Large download and load time, extra dependency; licences and sizes to verify |
| C. Hybrid | On-device if feasible; otherwise A with a consent notice, push-to-talk, nothing stored, and on-screen buttons for everything | More work to coordinate |

**To agree with Ishani:** the option, the accepted phrases, where the command registry lives, how the shell receives a command (a small callback or event contract exported from the feature's `index.js`), and the UI states above.

## Pattern separation
- **Reusable (adopt nearly as is):** bento tile grid, greeting banner, dotted timeline, pill buttons and count badges, tinted category tiles, dark analytics card, "Remind me later".
- **Adaptations:** the palette (see tiers above), type, Yes/No to **Done / Not yet**, rings and percentages to calm phrases, donut to a single-hue chart with a baseline band, indigo to deep teal.
- **Unique to Memory Lane:** the Lane timeline motif, voice commands, the album with spoken prompts, a simulated 7-day baseline with "vs usual" alerts, non-judgmental copy.

## Patient Home prototype (built)
`src/screens/patient/` with shared `src/ui/Button.jsx` and `src/ui/icons.jsx`. Mock data only.
- **Mobile (375):** greeting field with the quarter-circle motif, one "Next up" card (Done / Remind me later), two tinted tiles (Games, Memory Album with a picture strip), then "Today's lane". "Ask me" is a fixed bottom pill that opens a caption sheet with command chips.
- **Tablet (768 to 1023):** same single column, content up to 64rem, the voice bar capped at 36rem.
- **Desktop (1024 and up):** greeting band, then two columns: Next up and the lane on the left, a sticky deep-teal "Ask me" panel with the command chips and the two tiles on the right.
- **Lane states:** Done (green check), Next (turquoise), Later (mint), Still to do (outlined). State is always icon plus words, never colour alone.
- **Voice:** UI-only mock (idle, listening, understood, speaking). It never uses the microphone or speech APIs. `runCommand(id)` in `PatientHome.jsx` is the hook the voice feature can call.
- **Review states:** `?time=HH:MM` changes the demo clock (default 10:40), for example `?view=patient&time=21:30`.

## Memory Album (built)
- **Section:** full width, last on Patient Home, on a mint panel with a navy heading. Under the carousel: Previous, Next and **Open this memory** pills (the canvas is aria-hidden, so these are the accessible path; the region also supports arrow keys, Home, End and Enter).
- **Carousel:** the shared OGL `FlexCarousel`, `arch` preset, so the original lens shader still produces the wave and the curl at the sides. The lens is sized from the measured container so the centre card stays clean. Side cards recede (smaller, fading into the mint), angle away (keystone) and curl. Cards are square on phones and 4:3 from 520px. Captions are navy at patient scale (title 24px, subtitle 18px).
- **Detail page:** Back to home, h1, "when. who.", a photo viewer (large photo, caption, thumbnails at 80x64px, Previous/Next photo) beside an "About this memory" card with the description and a **Read to me** pill (or Play narration when a recording exists). Single column on phones, 7/5 columns from 1024px. A bottom "Ask me" bar stays available.
- **Motion:** tap or Next/Previous springs; fade intro; under reduced motion the spring is near-instant, the intro is a fade and the liquid effect is off.
- **Assets:** photos live in `public/memories/<id>/cover.jpg`, `01.jpg`, and so on, plus optional `narration.mp3`; see the header of `memories/demoMemories.js`.

## Games gallery and game pages (built)
- **Gallery:** full-width section directly above the Memory Album: three portrait (3:4) image-led cards, white surface, `border-line`, navy title, one-line blurb, "Play" label. Titles are Richa's original names: **Matching Pairs**, **Spot the Difference**, **Picture Puzzle**. Phones: one column, image beside text. Tablets: two columns. From 1024px: one row of three.
- **Hover** (hover-capable devices only): only the hovered card scales to 1.05 and sits forward (z-index 10), 300ms. No blur, shrinking, width change or carousel. Disabled on touch and under reduced motion; keyboard focus shows the ring only.
- **Opening a game:** a card opens its game as a full page inside Patient Home (`game` view, hash `#game-<id>`), like a memory page: "Back to games" pill, Oswald h1 (focused on entry), intro line, the game, and the "Ask me" bar. Back (button, "Done for now", browser or phone) returns to the gallery with the scroll position restored and the card focused.
- **Game pages (all three):** choices are pill groups (selected = filled with a tick), 56px minimum targets, a "Sound on/off" pill (remembered on the device), kind messages in an `aria-live` status line, and no scores, timers or "wrong". Progress is gentle text only ("3 pairs found so far"). Completion is a soft green panel with Play again, a next step and Done for now. Matching Pairs: 4, 8, 12 or 16 cards; a mismatch turns back after about a second; the 16-card phone grid uses 16px names and no per-card hint. Spot the Difference: tap either picture, or use the arrow keys and Enter on the second; a gentle hint can be shown. Picture Puzzle: tap two pieces to swap, arrow keys move between pieces, "Show the full picture" for help.
- **Illustration language** (`src/features/activities/art/`): flat token fills, rounded shapes, a few ink details, no gradients, no outlines on large shapes. Colours are read from `src/index.css` at build time (`palette.js`), so the art can only use existing tokens. Cards: 16 familiar objects. Scenes: garden, tea table and seaside, each with exactly 5 differences. Puzzles: garden, lakeside, tea time and a sleepy cat, drawn so each piece is recognisable at 12 pieces.
- **Engagement:** each completed round is reported once and kept on the device by `games/engagementLog.js`; it is not shown to the patient.

## Game pages: "Dark Midnight" (built 2026-10-31)
Only the three game pages (Matching Pairs, Spot the Difference, Picture Puzzle) use this treatment. Patient Home, the Games gallery and its cards, the Memory Album, the memory page, the caregiver dashboard, the top demo bar and the global tokens are unchanged. Existing tokens only: no new hex, gradients, fonts or dependencies. `ink` (navy, #12293a) is the approved navy and is used here as a background; no token was missing.
- **Ratio:** navy dominant, mint and turquoise as accents, off-white text, dark teal for the game surfaces. The navy runs edge to edge behind the game with the Memory Album's clipped box-shadow band (`GameFrame` in `features/activities/GameBits.jsx`), covering the layout padding above and everything below.
- **Roles:** ground `ink`; text `on-deep` (headings, labels, pill text), `on-deep-soft` (intro, "so far" text), `sunken` (kind messages); game surfaces `accent` (face-down cards, completion panel, hint banner; `deep` was too close to the navy at 1.22:1, `accent` is 1.78:1 and each surface also carries text, an icon or a clear shape); pressable fills `sunken` with `ink` text (selected pill, primary button, Ask me); resting outlines `line-strong`; selected or hovered edges `turquoise`; revealed cards `surface` (white), matched cards `sunken` with a tick.
- **Restraint:** borders are used only where they mark something important: the resting outline of pills and buttons (3.1:1), the turquoise edge on a revealed card, a hovered control and the focus ring. Cards, panels and pictures are separated by fill, not outlines. Revealed cards are one white surface instead of five different tints.
- **Artwork unchanged:** every illustration keeps its original light background; the picture frames have no border and the navy gaps separate the puzzle pieces.
- **Focus:** inside the frame the focus ring is off-white (14.2:1); the global blue ring would be 1.9:1 on navy. It is scoped to the frame with a more specific selector, so the global rule is untouched.
- **Buttons:** three additive `Button` variants, `dark`, `dark-secondary`, `dark-quiet` (nothing existing changed), used through `GameButton` in `GameBits.jsx`.
- **Ask me bar:** `VoiceAssistant` has a `tone` prop. `tone="dark"` (bar variant, passed only by the game view in `PatientHome`) gives a navy bar, a mint "Ask me" button and a navy sheet with a `line-strong` edge; the default light look is unchanged everywhere else.
- **Contrast (WCAG, checked with a script over every pair):** off-white on navy 14.2:1, `on-deep-soft` on navy 10.6:1, mint on navy 13.1:1, ink on mint 13.1:1, ink on white 15.0:1, `on-deep` on `accent` 8.0:1, `on-deep-soft` on `accent` 6.0:1, mint icon on `accent` 7.4:1, `line-strong` outline on navy 3.1:1, `turquoise` on navy 4.4:1.

## SOS assistance (built 2026-10-31, simulated)
A global SOS button, a confirmation, a full-page assistance screen for a person nearby, and a caregiver alert. Everything is simulated in the browser: no backend, SMS, push or API.
- **Colour (the one exception to "no alarm red"):** two tokens, `--color-sos` #c8443a and `--color-sos-strong` #a63229 (hover), used only for the SOS button, the SOS rule and icon on the caregiver alert, and the "SOS" badge on the view switcher. White text on `sos` is 4.8:1 and on `sos-strong` 6.8:1; `sos` on white is 4.8:1. Everything else keeps the existing palette.
- **Button (every patient page):** lives in `PatientLayout`, so it appears on Patient Home (including the Games gallery and Memory Album sections), the memory page and the three games, and stays through navigation. It is a compact 56px circle with the life-buoy icon and the visible word "SOS" inside it, `sos` fill, white text, 2px white ring (clear on the navy game pages too) and a white inner focus ring plus the global outline. At every width it is `position: fixed` to the right edge of the viewport (8px in, or the right safe-area inset if larger) and centred vertically, so it stays in the same place while scrolling and does not depend on any page content. A slow soft ring (2.4s, scale and fade, never flashing) draws the eye; it stops on hover and focus and is removed under reduced motion.
- **Right gutter:** so the button never covers content, `PatientLayout` reserves `4.5rem` plus the right safe-area inset as right padding (from 73.5rem wide the page margins already clear it, so the normal gutter returns), and on phones the Ask me bar and its open sheet keep the same room. Nothing sits under the button at 375, 768 or 1280px, and there is no horizontal scroll.
- **Confirmation:** a native modal `<dialog>` (focus trapped, Esc cancels): "Do you need help now?", "We will tell your caregiver, Ananya, and show a message for people nearby." Buttons "Yes, ask for help" and "No, go back" (focused by default).
- **Assistance screen (Mint Daylight, not Dark Midnight):** shown in place of the patient pages (they are hidden, not unmounted, so a game and the scroll position survive). `canvas` ground, `sunken` heading card, white cards, large type (heading 48px, then 72px from 768px; body 32px). Heading "I need a little help.", "My name is Mr. Sharma.", a short note to a person nearby ("I may find some things hard to remember. Please stay with me, speak slowly and kindly..."), three numbered steps, the caregiver card (name, number, Call button) and a status panel with a tick: "Ananya has been told." or "Ananya has seen this alert (at 11:28 AM).", always with "This is a demo, so no real message has been sent." No medical claims, and no assumption that the person is lost or distressed. It has no close button; Esc, the browser Back button and a reload do not dismiss it.
- **Caregiver contact:** `PATIENT.caregiver` in `screens/patient/mockData.js` (`name: 'Ananya'`, `phone: '+91 XXXXX XXXXX'`, `isDemo: true`). The number is a placeholder: no `tel:` link is rendered unless `phone` has 7 to 15 digits (an optional leading +, spaces, dashes and brackets allowed), then a large "Call Ananya" link appears with "Demo number, not a real person."
- **Caregiver alert:** a panel at the top of the caregiver dashboard (nothing is shown until an SOS exists): "SOS from Mr. Sharma", alert time, "Patient was using" the app context with the note "This is where they were in the app, not their physical location", status ("Waiting for you to acknowledge" or "Seen at ..."), "I have seen this", "Mark as resolved" (inline confirm: "Yes, mark resolved" or "Keep open"), the last few resolved alerts, and "Clear demo alerts" (inline confirm) as the labelled demo reset. A small "SOS" badge appears on the "Caregiver view" option of the view switcher while an alert is waiting.
- **Patient context:** recorded at the moment of SOS: Patient Home, Games gallery, Memory Album (Home sections, chosen by which section is under the middle of the viewport), Memory detail with its title, Matching Pairs, Spot the Difference or Picture Puzzle. It is the app context, never a physical location.
- **State and sync:** one small store (`src/app/sos/sosStore.js`, read through `useSos`), saved in `localStorage` (`memory-lane:sos`). An alert goes sent, acknowledged, resolved. There is no expiry: it stays active until the caregiver resolves it or the demo reset is used, and a reload never resolves it. Only one alert can be active, so a double press or repeated render cannot create a duplicate. Only the caregiver side can resolve, so the patient cannot end an active SOS by accident; on resolve the patient returns to the page and scroll position they were on, and a short notice says it has been closed.
- **Browser Back and Forward:** while an SOS is active a guard entry (same URL, same state plus `sos: true`) sits on top of the history (`src/app/sos/historyGuard.js`, mounted once above the view switch by `SosHistoryGuard` in `AppShell`). Back or Forward, a reload, and switching to the caregiver view and back all leave the assistance screen, the hidden patient page, the URL and the scroll position unchanged; `PatientHome` ignores `popstate` while an SOS is active. When the alert is resolved the guard entry is popped, so the patient returns to the original page and scroll position and one press of Back to games or Back to home works as before.
- **Limitation:** tabs and windows of the same browser origin stay in step through the shared store and the `storage` event. This does not reach other devices or other browsers, and nothing is ever sent; the caregiver panel and the patient screen both say so.

## Reminders, voice and location sharing (built 2026-10-31)
- **Reminders:** Patient Home keeps NextUpCard and DayLane. The 9 lane items are Reminders (shared contract: `{ id, type, title, scheduledAt, status: pending | taken | snoozed, completedAt, note }`) run through Ishani's logic in `features/reminders`. Done marks taken (confirmed or completed event), Remind me later snoozes (viewed event, "I will remind you again in 15 minutes."), and each event is sent once to the engagement log (`memory-lane:engagement`, `meta.source: 'reminders'`).
- **Voice:** replies are spoken with the on-device speech engine (a "Voice replies on/off" button, remembered). Listening is off until the patient taps "Allow listening" on a short notice that says the browser may send speech to its own speech service; without it, or where the browser cannot listen, the on-screen chips do the same things. Whole-phrase commands only ("I've done this", "Remind me later", "Read my reminders", "Stop", "What's next", "Show photos", "Play a game").
- **Location sharing (patient side):** a "Location sharing" card at the end of Patient Home. Browser location belongs to the device the browser runs on, so sharing starts there: "Share my location" opens a dialog ("Share my location with Ananya?") and only "Yes, share my location" starts the browser watcher; "Stop sharing" ends it. Nothing starts automatically and a reload does not restart it. Denied, unavailable and unsupported states give a plain message.
- **Location safety (caregiver side):** a "Location safety" section (`#safety`, in the sidebar nav) from Ishani's dashboard, adapted: it only displays what the patient shared in the same browser (position, distance from home, safe-zone status, GPS accuracy, stale flag after 60 s, movement history, safe-zone history) and lets the caregiver set home (map click or the patient's latest position), radius presets or a custom radius, and a caregiver contact. Readings below 50 m accuracy are ignored for safe-zone checks. The caregiver's own device is never tracked.
- **Disclosures (on both screens):** this is a browser-local simulation. Readings, history and safe-zone entries live in this browser's `localStorage`; the caregiver page updates live only in the same browser (storage events); there is no cross-device or cross-browser tracking; no real notification or message is ever sent; monitoring runs only while the patient page is open; the map loads tiles from OpenStreetMap.
- **Styling:** Ishani's `location.css` keeps its `.ml-*` scope but uses only existing tokens (colours, `--font-heading`, `--font-sans`); reds became the amber `attention` tokens; emoji headings and "dispatched" wording were removed.

## Daily tasks (built 2026-10-31)
- **One model:** tasks are the Reminder contract (`{ id, type: medicine | routine, title, scheduledAt, status: pending | taken | snoozed, completedAt, note }`) in one shared store, saved in this browser's `localStorage` and synced live between tabs of the same browser. They are not synchronised across devices or people, and both screens say so.
- **Patient "My daily tasks"** (Patient Home, below Today's lane and Next up, above Games): heading in Oswald at section size, an "Add a task" pill, today's tasks as cards in time order under To do and Done. A card: time chip, status chip with icon and words (To do, Later, Still to do, Done; never red), title, details, then "I have done this", "Remind me later", "Edit", "Delete" (all 56px). The form is short: What is the task, Details (optional), Time, in a modal dialog. Delete asks "Delete this task? Yes, delete it / Keep it". Medicine asks "Did you take it?" (Yes, I took it / Not yet) first, also from Next up; a spoken "I've done this" never marks medicine.
- **Caregiver "Manage patient tasks"** (`#tasks`, nav "Patient tasks"): a white panel with the accent rule, a summary row (Pending, Completed, Snoozed, Missed), "Add a task for the patient", tasks grouped by day (Today, then dates) with Medicine or Routine chip and a status chip (Missed is amber, never red), Edit and Delete (inline Yes/Keep), a completion history, a confirmed "Reset demo tasks", and the prototype disclosure. The form adds Date and a Medicine or Routine choice. The caregiver has no control that marks a task done.
- **Rules:** editing never changes the id, status or completion time and sends no event; only the patient's done and later send EngagementEvents, once each; medicine is never marked taken automatically.

## Colour usage (applied 2026-10-31)
Existing Mint Daylight tokens only; no new hues. The chart-3 purple is a chart-series token and is not used for UI.
- **One dark anchor per screen:** Patient Home = the deep teal Ask me panel; Caregiver = the deep header band. Nothing else is dark.
- **Patient:** greeting on soft mint; Next up is white with an 8px `accent` left rule and an `accent-soft` time chip; Games keep their tinted art; the Memory Album section sits on `sunken` (mint) and the memory page's photo viewer on `tint-sky`.
- **Today's lane tints (category, not state, cool only):** medicine = `tint-sky`, meals = `tint-sage`, outdoors = `sunken` (mint), tea, water and calls = `accent-soft`. Done = `gentle`, Next = `accent`. State stays in words and icons.
- **Caregiver:** `sunken` sidebar with an active item (`accent-soft`, 4px `accent` left bar, `aria-current`); panels are white with a 4px top rule per section (Overview `accent`, Reminders `turquoise`, Activities `gentle`, Alerts `deep`). No yellow or amber fills; the `attention` tokens stay defined for later use.
- **Memory Album band:** the `sunken` (mint, #e3f4ee) background runs edge to edge across the viewport; the album content stays centred in the normal page column. It is done with a clipped `box-shadow` on the section (no `w-screen`; the shadow colour is `var(--color-sunken)`), so it adds no horizontal scroll.
- **Shell:** the top bar shows the **Memory Lane** wordmark on the left (Oswald, 24px, bold, navy) and the view switcher on the right; the demo bar is white so it does not compete with the page mint.
- **Rules:** tints mean category and are never whole-page washes; no gradients, glows, red, yellow or pink fills added by the UI. **No hex outside `src/index.css`**, except token mirrors in the drawn data-URI art (`demoArt.js`, and the activities art, which reads its colours from `index.css`), which only use token values. The carousel's RGB fringe (`dispersion`) is off.
- **Contrast:** checked with a node script over the new pairs; patient text 7:1 or better (ink on tints 12:1 or better), non-text marks 3:1 or better.

## Caregiver analytics (built 2026-10-31)
- Data comes only from `getAnalyticsSummary()` via `src/features/analytics/index.js`, read in `src/screens/caregiver/analytics/useAnalyticsSummary.js`. The demo patient is **Mr. Sharma** in both experiences.
- **Engagement chart:** seven CSS bars (no chart library), `accent` at or above the usual routine, `turquoise` below it, a dashed "Usual: 3 a day" line, value labels, and a hidden table for screen readers. Days with no data are dashed placeholders with a dash, never zero bars.
- **Alerts:** white panel with a deep-teal rule; each item has a small "Medicine" or "Routine" chip and the module's own message with the date shown as "Wed 28 Oct". Empty state: "Nothing unusual compared with the usual routine."
- **Reminders and Activities:** Today (latest day; "still in progress" when incomplete), This week (70% confirmed plus a 7-day strip of confirmed/scheduled), Activity this week and Meals logged (7-day strips). No data shows a dash and "No data" for assistive tech; null totals say "Not available".
- Panels sit in one column until 1024px so the seven-day charts stay readable.

## Memory Detail: personal memory management (built 2026-10-31)
- **Page:** Back to home, title, then on desktop a 7/5 split (photos left; About and Voice notes right), single column on phones in the order photos, About, Voice notes. A footnote says content is saved on this device only.
- **Photos:** viewer with thumbnails and Previous/Next, **Add photos** (several at once; very large pictures are downsized to 2048px), **Remove this photo** with an inline Keep/Remove step. The built-in stand-in photos can be removed too. Empty state: "No photos yet."
- **Description:** view mode with **Edit description**; edit mode with a labelled text area, Save and Cancel (Escape cancels); **Restore original text** appears once edited. **Read to me** reads the saved text sentence by sentence with Pause, Resume and Stop.
- **Voice notes:** **Record a voice note** (microphone), timer, Pause, Resume, Stop, then listen back and Save, Record again or Discard. Saved notes list newest first with Play/Pause, length and Delete (Keep/Delete step). Only one sound plays at a time.
- **Look:** existing tokens only; no red (confirmations use the primary and secondary pills); Oswald for card titles and the timer, Figtree for the rest; the recording dot only pulses when motion is allowed and state is always also stated in words.
- **Carousel cover:** the first photo added to a memory becomes its carousel cover.
- **Failure messages (plain language):** storage unavailable (changes lost on close), not enough space, microphone blocked, no microphone, microphone busy, recording not supported or page not secure, picture not readable or too large.

## Open decisions

- [x] Font: Oswald (headings) and Figtree (body), implemented 2026-10-31.
- [ ] Voice recognition approach (A, B or C) with Ishani.
- [ ] Interaction videos: supply keyframes or notes. (The album look was built from the written brief and the carousel code, so check it against the video.)
