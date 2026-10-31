// Flat, drawn stand-ins for memory photographs (4:3). They are generated as SVG data
// URIs so the album works without any image files. The real photos replace them
// (see demoMemories.js). Hex values mirror the Mint Daylight tokens in src/index.css;
// data URIs cannot read CSS variables.
const C = {
  sky: '#dcebf7',
  mint: '#e3f4ee',
  sage: '#ddf0e4',
  peach: '#fbe3d6',
  butter: '#f8edc6',
  white: '#ffffff',
  navy: '#12293a',
  deep: '#0e3a44',
  accent: '#08565d',
  turquoise: '#0e9ba0',
  green: '#2a6e47',
  leaf: '#ddf0e4',
  amber: '#8a5300',
  sand: '#e3f4ee',
  rose: '#ffffff',
}

const W = 1200
const H = 900

const rect = (x, y, w, h, fill, rx = 0) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`
const circle = (x, y, r, fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`
const ellipse = (x, y, rx, ry, fill) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`
const person = (x, y, s, body, head = C.rose) =>
  circle(x, y - 70 * s, 26 * s, head) + rect(x - 30 * s, y - 40 * s, 60 * s, 110 * s, body, 30 * s)

// Each scene takes a variant (0 to 2) so one memory can show three different "photos".
const SCENES = {
  seaside: (v) =>
    rect(0, 0, W, H, v === 1 ? C.butter : C.sky) +
    circle([900, 780, 300][v], [200, 330, 170][v], 90, v === 1 ? C.peach : C.butter) +
    rect(0, 470, W, 170, C.turquoise + (v === 1 ? '88' : '66')) +
    rect(0, 640, W, 260, C.sand) +
    (v === 2
      ? ellipse(600, 520, 160, 40, C.white) + rect(594, 470, 12, 60, C.navy) + ellipse(600, 470, 140, 70, C.rose)
      : person(480, 720, 1.5, C.accent) + person(680, 750, 1.2, C.amber)),
  garden: (v) =>
    rect(0, 0, W, H, C.sky) +
    circle([220, 900, 600][v], 150, 80, C.butter) +
    ellipse(600, 900, 900, 380, C.sage) +
    rect([800, 300, 600][v], 330, 34, 240, C.navy) +
    circle([817, 317, 617][v], 270, 150, C.green) +
    [0, 1, 2, 3, 4, 5]
      .map((i) => circle(120 + i * 190 + v * 30, 760 + (i % 2) * 50, 22, i % 2 ? C.peach : C.butter))
      .join(''),
  lunch: (v) =>
    rect(0, 0, W, H, C.butter) +
    rect([120, 800, 460][v], 110, 280, 300, C.sky, 24) +
    rect(0, 560, W, 340, C.mint) +
    ellipse(400, 690, 190, 54, C.white) +
    ellipse(820, 690, 190, 54, C.white) +
    (v === 1
      ? circle(600, 640, 80, C.amber) + rect(560, 650, 80, 40, C.amber, 14)
      : circle(400, 670, 60, C.rose) + circle(820, 670, 60, C.leaf)) +
    rect(560, 520, 80, 90, C.accent, 18),
  birthday: (v) =>
    rect(0, 0, W, H, C.peach) +
    [0, 1, 2].map((i) => circle(220 + i * 380 + v * 40, 220 + (i % 2) * 70, 70, [C.turquoise, C.butter, C.leaf][i])).join('') +
    rect(0, 640, W, 260, C.mint) +
    rect(390, 470, 420, 190, C.white, 28) +
    rect(390, 470, 420, 60, [C.rose, C.turquoise, C.butter][v], 28) +
    [470, 560, 650, 740]
      .map((x) => rect(x, 400, 14, 70, C.navy, 6) + circle(x + 7, 388, 16, C.butter))
      .join(''),
  baking: (v) =>
    rect(0, 0, W, H, C.sage) +
    rect(120, 150, 960, 40, C.sand, 10) +
    [0, 1, 2, 3].map((i) => rect(180 + i * 220, 60, 110, 110, [C.peach, C.butter, C.white, C.sky][(i + v) % 4], 20)).join('') +
    rect(0, 600, W, 300, C.sand) +
    ellipse(520, 620, 250, 90, C.white) +
    ellipse(520, 590, 210, 60, v === 2 ? C.rose : C.butter) +
    rect(790, 560, 280, 36, C.amber, 18) +
    person(930, 480, 1.2, C.accent),
  autumn: (v) =>
    rect(0, 0, W, H, v === 1 ? C.peach : C.butter) +
    rect(0, 540, W, 360, C.sage) +
    rect(0, 640, W, 120, C.sand) +
    [200, 520, 900]
      .map((x, i) => rect(x, 260, 30, 300, C.navy) + circle(x + 15, 250, 120 - i * 14, [C.amber, C.rose, C.leaf][(i + v) % 3]))
      .join('') +
    rect(380, 560, 360, 26, C.deep, 8) +
    rect(400, 586, 20, 70, C.deep) +
    rect(700, 586, 20, 70, C.deep),
}

export function art(scene, variant = 0) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    SCENES[scene](variant) +
    '</svg>'
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
