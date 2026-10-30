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
| Alerts | `attention`, `attention-ink`, `attention-soft`: muted amber, never alarm red |
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

## Games gallery (built)
- Full-width section directly above the Memory Album: three portrait (3:4) image-led cards, white surface, `border-line`, navy title, one-line blurb, "Play" label. Phones: one column, image beside text. Tablets: two columns. From 1024px: one row of three.
- Hover (hover-capable devices only): only the hovered card scales to 1.05 and sits forward (z-index 10), 300ms. No blur, shrinking, width change or carousel. Disabled on touch and under reduced motion; keyboard focus shows the ring only.

## Colour usage (applied 2026-10-31)
Existing Mint Daylight tokens only; no new hues. The chart-3 purple is a chart-series token and is not used for UI.
- **One dark anchor per screen:** Patient Home = the deep teal Ask me panel; Caregiver = the deep header band. Nothing else is dark.
- **Patient:** greeting on soft mint; Next up is white with an 8px `accent` left rule and an `accent-soft` time chip; Games keep their tinted art; the Memory Album section sits on `sunken` (mint) and the memory page's photo viewer on `tint-sky`.
- **Today's lane tints (category, not state, cool only):** medicine = `tint-sky`, meals = `tint-sage`, outdoors = `sunken` (mint), tea, water and calls = `accent-soft`. Done = `gentle`, Next = `accent`. State stays in words and icons.
- **Caregiver:** `sunken` sidebar with an active item (`accent-soft`, 4px `accent` left bar, `aria-current`); panels are white with a 4px top rule per section (Overview `accent`, Reminders `turquoise`, Activities `gentle`, Alerts `deep`). No yellow or amber fills; the `attention` tokens stay defined for later use.
- **Memory Album band:** the `sunken` (mint, #e3f4ee) background runs edge to edge across the viewport; the album content stays centred in the normal page column. It is done with a clipped `box-shadow` on the section (no `w-screen`; the shadow colour is `var(--color-sunken)`), so it adds no horizontal scroll.
- **Shell:** the top bar shows the **Memory Lane** wordmark on the left (Oswald, 24px, bold, navy) and the view switcher on the right; the demo bar is white so it does not compete with the page mint.
- **Rules:** tints mean category and are never whole-page washes; no gradients, glows, red, yellow or pink fills added by the UI. **No hex outside `src/index.css`**, except token mirrors in the drawn data-URI art (`gameArt.js`, `demoArt.js`), which only use token values. The carousel's RGB fringe (`dispersion`) is off.
- **Contrast:** checked with a node script over the new pairs; patient text 7:1 or better (ink on tints 12:1 or better), non-text marks 3:1 or better.

## Open decisions
- [x] Font: Oswald (headings) and Figtree (body), implemented 2026-10-31.
- [ ] Voice recognition approach (A, B or C) with Ishani.
- [ ] Interaction videos: supply keyframes or notes. (The album look was built from the written brief and the carousel code, so check it against the video.)
