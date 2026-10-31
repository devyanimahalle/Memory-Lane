# AGENTS.md — CogniCare

Rules for every human and AI agent working in this repo.

## Session protocol (mandatory)
1. **Before working:** read `context.md` first, then `TASKS.md`. Read `DESIGN.md` before any UI work.
2. **Before ending every session:** update **both** `context.md` (status, decisions, session log) and `TASKS.md` (task status). No exceptions.

## Project
CogniCare is a 24-hour hackathon prototype for dementia care. It has a gentle companion for patients and a dashboard for remote caregivers. See `context.md` for the full brief.

## Stack and commands
- React 19 + Vite 8, **JavaScript (JSX)**, Tailwind CSS v4 (`@tailwindcss/vite`), Motion for React (`motion`), oxlint.
- Playwright for testing (not set up yet). Recharts for analytics (added later).
- `npm run dev` starts the dev server · `npm run build` builds for production · `npm run lint` runs oxlint.

## Ownership. Edit only your own area.
| Area | Path | Owner |
|---|---|---|
| App shell, routing, providers | `src/app/` | Lead |
| Design system components | `src/ui/` | Lead |
| Shared visual components (OGL `FlexCarousel`) | `src/components/` | Lead |
| Global styles and tokens | `src/index.css` | Lead |
| Patient home | `src/screens/patient/` | Lead |
| Caregiver dashboard UI and integration | `src/screens/caregiver/` | Lead |
| Reminders, routine tracking, voice prompts | `src/features/reminders/` | Member 2 |
| Cognitive games, memory album | `src/features/activities/` | Member 3 |
| Simulated data, analytics, alerts | `src/features/analytics/` | Member 4 |
| QA and Playwright tests | `tests/` | Member 4 |

- **Do not modify** the app shell, `src/index.css`/global styles, `src/ui/`, configs or `package.json` dependencies without Lead approval.
- Need a change in someone else's area? Note it in `TASKS.md` under **Requests** and tell the owner.

## Git workflow
**Humans**
- Teammates create, commit and push to their **own feature branches** (`<area>/<short-task>`, e.g. `reminders/medicine-card`; areas: `lead`, `reminders`, `activities`, `analytics`, `qa`), branched from the latest `main`.
- **Only the product lead merges into `main`.** Teammates never push to or merge into `main`; they ask the Lead to review and merge.
- Run `npm run lint` and `npm run build` before asking for a merge. Keep branches short-lived and changes inside your own area.
- `context.md` and `TASKS.md` are shared: keep edits small to avoid conflicts.

**Claude Code (and any AI agent): read-only Git**
- **NEVER** run Git write operations: no `add`/`commit`, `push`, `merge`, `rebase`, `reset`, `stash`, `checkout`/`switch` that changes branches, or branch creation or deletion.
- Allowed: inspect with `git status`, `git diff`, `git log`, `git show`, `git branch` (list only).
- Leave all changes uncommitted in the working tree, ready for human review. Say what changed and suggest a branch name and commit message for the human to use.

## Hard constraints
- **Simulated data only.** No real patient data, external APIs, hardware integrations or medical diagnosis.
- The experience must be calm, accessible and non-judgmental (see `DESIGN.md`).
- Alerts describe changes from the person's own baseline. They never diagnose.
- **Approved exceptions (Lead, 2026-10-31), prototype only:** (1) location sharing reads the patient's browser geolocation, only after the patient says yes on the patient screen, and stores it in this browser only; (2) the caregiver map loads OpenStreetMap tiles through Leaflet (the one added dependency); (3) the voice assistant may use the browser's speech recognition, only after the patient says yes (Chrome may send audio to its speech service). Address search (Nominatim) is not used. Nothing is ever sent to another device or browser.

## Code conventions
- Function components with hooks. Plain JS, no TypeScript.
- Style with Tailwind utilities and the design tokens from `DESIGN.md`. No hardcoded colours, and no new global CSS.
- Animate with `motion/react` and respect `prefers-reduced-motion`.
- Each feature exposes its public API through `src/features/<name>/index.js`. Do not deep-import across features.
- Keep `npm run lint` and `npm run build` passing before handing off.
