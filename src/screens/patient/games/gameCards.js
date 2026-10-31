import { GAME_COVERS, GAME_IDS } from '../../../features/activities'

// The three games shown in the Patient Home gallery, in Richa's original names. Presentation only:
// the games themselves come from the activities feature (src/features/activities/index.js).
// `GamesSection` calls `onSelect(game)` with one of these entries and `PatientHome` opens the
// game whose id matches. Covers are the portrait (3:4) illustrations from the activities art.
export const GAMES = [
  {
    id: GAME_IDS.matchingPairs,
    title: 'Matching Pairs',
    blurb: 'Turn over the cards and find the twins.',
    cover: { src: GAME_COVERS.pairs, alt: 'Cards laid out in a grid, some turned over to show an apple and a tea cup' },
  },
  {
    id: GAME_IDS.spotTheDifference,
    title: 'Spot the Difference',
    blurb: 'Look at two pictures and find what is different.',
    cover: { src: GAME_COVERS.difference, alt: 'The same garden drawn twice, one above the other' },
  },
  {
    id: GAME_IDS.picturePuzzle,
    title: 'Picture Puzzle',
    blurb: 'Put the pieces back together, at your pace.',
    cover: { src: GAME_COVERS.puzzle, alt: 'A lakeside picture cut into pieces, with one piece lifted out' },
  },
]
