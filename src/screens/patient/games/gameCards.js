import { gameArt } from './gameArt'

// The three games shown in the Patient Home gallery. Presentation data only: the games
// themselves come from the activities feature (Member 3 / Richa).
//
// Integration point: GamesSection calls `onSelect(game)` with one of these entries. Wire
// that in PatientHome (or add a `route` / `Page` field here) when the real game pages exist.
// Cover art: replace `gameArt(...)` with a portrait (3:4) image, e.g. `/games/<id>/cover.jpg`.
export const GAMES = [
  {
    id: 'pairs',
    title: 'Match the pairs',
    blurb: 'Turn over the cards and find the twins.',
    cover: { src: gameArt('pairs'), alt: 'Cards laid out in a grid, two of them turned over' },
  },
  {
    id: 'picture',
    title: 'Pick the picture',
    blurb: 'Choose the one that belongs.',
    cover: { src: gameArt('picture'), alt: 'A garden picture with three choices below it' },
  },
  {
    id: 'word',
    title: 'Find the word',
    blurb: 'Put the letters in place, at your pace.',
    cover: { src: gameArt('word'), alt: 'Six letter tiles spelling a word' },
  },
]
