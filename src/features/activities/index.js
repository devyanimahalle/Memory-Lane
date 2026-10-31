import { MatchingPairs } from './games/MatchingPairs/MatchingPairs.jsx'
import { FindDifference as SpotTheDifference } from './games/FindDifference/FindDifference.jsx'
import { PicturePuzzle } from './games/PicturePuzzle/PicturePuzzle.jsx'

// Public API of the activities feature. Other code imports from here, never from the
// individual files.
//
// Every game takes the same props:
//   onBack        called by "Back to games" / "Done for now"
//   onEngagement  called once per completed round with
//                 { id, type: 'game', action: 'completed', label, occurredAt, durationMinutes }
//   headingRef    optional ref for the game's h1 (so the screen can move focus to it)
export { MatchingPairs, SpotTheDifference, PicturePuzzle }

// Portrait (3:4) covers for the Games gallery: { pairs, difference, puzzle } data URIs.
export { coverArt as GAME_COVERS } from './art/covers.js'

// Game ids used by the Games gallery.
export const GAME_IDS = {
  matchingPairs: 'matching-pairs',
  spotTheDifference: 'spot-the-difference',
  picturePuzzle: 'picture-puzzle',
}

// The game component for each id, so a screen can open the one the person chose.
export const GAME_COMPONENTS = {
  [GAME_IDS.matchingPairs]: MatchingPairs,
  [GAME_IDS.spotTheDifference]: SpotTheDifference,
  [GAME_IDS.picturePuzzle]: PicturePuzzle,
}
