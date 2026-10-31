import { MATCHING_DRAW } from './matchingArt'
import { SCENE_BODIES } from './differenceScenes'
import { PUZZLE_BODIES } from './puzzleArt'
import { P } from './palette'
import { circle, group, path, rect, svgUri } from './svg'

// Portrait (3:4, 900 x 1200) covers for the three Games gallery cards. Not wired into the
// gallery yet (that is Phase 3): `coverArt` is ready for `games/gameCards.js` to use.
const W = 900
const H = 1200

// A nested <svg> clips its contents, so it works as a "window" onto part of a drawing.
const crop = (x, y, w, h, viewBox, body) =>
  `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${viewBox}">${body}</svg>`

// Matching Pairs: a 2 x 3 grid of cards, three turned over to show an object.
function pairsCover() {
  const faces = [
    { show: 'apple', fill: P.sky },
    { show: null },
    { show: null },
    { show: 'teacup', fill: P.mint },
    { show: 'apple', fill: P.sky },
    { show: 'teacup', fill: P.mint },
  ]
  let body = rect(0, 0, W, H, P.sage)
  faces.forEach((card, i) => {
    const x = 80 + (i % 2) * 380
    const y = 130 + Math.floor(i / 2) * 330
    body += rect(x, y, 360, 300, card.show ? card.fill : P.accentSoft, 40, card.show ? P.accent : P.lineStrong, 6)
    if (card.show) {
      body += group(`translate(${x + 80} ${y + 40}) scale(1.0)`, MATCHING_DRAW[card.show]())
    } else {
      body +=
        circle(x + 180, y + 150, 60, P.white, P.lineStrong, 5) +
        circle(x + 180, y + 150, 24, P.accent)
    }
  })
  return body
}

// Spot the Difference: the same garden twice, one above the other (no hint of the answers).
function differenceCover() {
  const frame = (y, v) =>
    rect(70, y - 10, 760, 560, P.white, 36, P.lineStrong, 6) +
    crop(90, y + 10, 720, 520, '0 0 800 600', SCENE_BODIES.garden(v))
  return rect(0, 0, W, H, P.sky) + frame(50, 'a') + frame(630, 'b')
}

// Picture Puzzle: a lakeside picture in four pieces, one piece lifted out and tilted.
function puzzleCover() {
  const TW = 370
  const TH = 278
  const tile = (col, row, x, y, rot = 0) =>
    group(
      `rotate(${rot} ${x + TW / 2} ${y + TH / 2})`,
      rect(x - 7, y - 7, TW + 14, TH + 14, P.white, 24, P.lineStrong, 5) +
        crop(x, y, TW, TH, `${col * 400} ${row * 300} 400 300`, PUZZLE_BODIES.lake()),
    )
  const x0 = 80
  const x1 = 80 + TW + 24
  const y0 = 130
  const y1 = 130 + TH + 24
  return (
    rect(0, 0, W, H, P.mint) +
    tile(0, 0, x0, y0) +
    tile(1, 0, x1, y0) +
    tile(0, 1, x0, y1) +
    rect(x1, y1, TW, TH, P.accentSoft, 24, P.lineStrong, 5) +
    path(`M${x1 + TW / 2 - 40} ${y1 + TH / 2} h80 M${x1 + TW / 2} ${y1 + TH / 2 - 40} v80`, 'none', P.lineStrong, 8) +
    tile(1, 1, 280, 800, -6)
  )
}

export const coverArt = {
  pairs: svgUri(W, H, pairsCover()),
  difference: svgUri(W, H, differenceCover()),
  puzzle: svgUri(W, H, puzzleCover()),
}
