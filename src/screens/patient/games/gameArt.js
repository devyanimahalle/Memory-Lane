// Flat, drawn stand-in cover art for the Games gallery (portrait, 3:4), generated as SVG data
// URIs so the gallery works without image files. Real artwork replaces them (see gameCards.js).
// Hex values mirror the Mint Daylight tokens in src/index.css; data URIs cannot read CSS variables.
const C = {
  sky: '#dcebf7',
  mint: '#e3f4ee',
  sage: '#ddf0e4',
  peach: '#fbe3d6',
  butter: '#f8edc6',
  white: '#ffffff',
  navy: '#12293a',
  accent: '#08565d',
  turquoise: '#0e9ba0',
  green: '#2a6e47',
  amber: '#8a5300',
}

const W = 900
const H = 1200

const rect = (x, y, w, h, fill, rx = 0) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`
const circle = (x, y, r, fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`
const text = (x, y, size, fill, value) =>
  `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="700" text-anchor="middle" fill="${fill}">${value}</text>`

// Matching pairs: a 2 x 3 grid of cards, two of them turned over.
function pairs() {
  const fills = [C.white, C.white, C.peach, C.white, C.white, C.butter]
  let body = rect(0, 0, W, H, C.sky)
  fills.forEach((fill, i) => {
    const x = 90 + (i % 2) * 380
    const y = 150 + Math.floor(i / 2) * 330
    body += rect(x, y, 340, 290, fill, 36)
    if (fill === C.peach) body += circle(x + 170, y + 145, 80, C.turquoise)
    else if (fill === C.butter) body += circle(x + 170, y + 145, 80, C.turquoise)
    else body += rect(x + 70, y + 70, 200, 150, C.mint, 24)
  })
  return body
}

// Pick the picture: a framed scene with three small choices underneath.
function picture() {
  return (
    rect(0, 0, W, H, C.sage) +
    rect(110, 130, 680, 640, C.white, 40) +
    rect(150, 170, 600, 560, C.sky, 24) +
    circle(600, 320, 70, C.butter) +
    rect(150, 560, 600, 170, C.sage) +
    rect(380, 440, 26, 160, C.navy) +
    circle(393, 410, 100, C.green) +
    [0, 1, 2].map((i) => rect(110 + i * 235, 850, 210, 210, i === 1 ? C.peach : C.white, 32)).join('') +
    circle(215, 955, 54, C.turquoise) +
    circle(450, 955, 54, C.green) +
    circle(685, 955, 54, C.accent)
  )
}

// Find the word: a row of letter tiles.
function word() {
  const letters = ['G', 'A', 'R', 'D', 'E', 'N']
  return (
    rect(0, 0, W, H, C.butter) +
    letters
      .map((letter, i) => {
        const x = 90 + (i % 3) * 245
        const y = 230 + Math.floor(i / 3) * 290
        return (
          rect(x, y, 215, 245, i === 2 ? C.peach : C.white, 32) +
          text(x + 107, y + 165, 130, C.navy, letter)
        )
      })
      .join('') +
    rect(90, 860, 720, 90, C.white, 45) +
    rect(130, 890, 300, 30, C.turquoise, 15)
  )
}

const SCENES = { pairs, picture, word }

export function gameArt(scene) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${SCENES[scene]()}</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
