# CogniCare

A 24-hour hackathon prototype for dementia care: a gentle daily companion for the patient and a calm
dashboard for remote caregivers. Everything is simulated and runs in the browser; nothing is sent to
other devices.

## Run it
- `npm install`
- `npm run dev` starts the dev server (`?view=caregiver` opens the caregiver view; `?time=HH:MM` sets the demo clock)
- `npm run build` builds for production, `npm run lint` runs oxlint

## Stack
React 19, Vite, Tailwind CSS v4, Motion for React, Leaflet (caregiver map). JavaScript (JSX).

## Project notes
See `AGENTS.md` (rules and ownership), `context.md` (status and decisions), `DESIGN.md` (design system)
and `TASKS.md` (work in progress).
