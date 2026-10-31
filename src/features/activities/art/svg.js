import { P } from './palette'

// Small flat-shape helpers shared by every game illustration, so they all speak one visual
// language: flat token fills, rounded forms, a few ink details (eyes, lines), no gradients.
const stroke = (colour, width) =>
  colour ? ` stroke="${colour}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"` : ''

export const rect = (x, y, w, h, fill, rx = 0, line, lw = 4) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${stroke(line, lw)}/>`

export const circle = (x, y, r, fill, line, lw = 4) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"${stroke(line, lw)}/>`

export const ellipse = (x, y, rx, ry, fill, rot = 0, line, lw = 4) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${rot} ${x} ${y})"${stroke(line, lw)}/>`

export const path = (d, fill = 'none', line, lw = 4) =>
  `<path d="${d}" fill="${fill}"${stroke(line, lw)}/>`

export const line = (x1, y1, x2, y2, colour, lw = 4) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colour}" stroke-width="${lw}" stroke-linecap="round"/>`

export const poly = (points, fill, lineColour, lw = 4) =>
  `<polygon points="${points}" fill="${fill}"${stroke(lineColour, lw)}/>`

export const group = (transform, body) => `<g transform="${transform}">${body}</g>`

// Six round petals around a centre.
export function flower(cx, cy, r, petal, centre, line) {
  const spots = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3
    return circle(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.62, petal, line, 3)
  })
  return spots.join('') + circle(cx, cy, r * 0.55, centre)
}

// A puffy white cloud centred on (cx, cy); `s` scales it.
export const cloud = (cx, cy, s = 1) =>
  group(
    `translate(${cx} ${cy}) scale(${s})`,
    ellipse(0, 10, 90, 30, P.white) + circle(-30, -6, 34, P.white) + circle(18, -16, 42, P.white) + circle(54, 4, 26, P.white),
  )

// A small flying bird (two curved wings).
export const bird = (cx, cy, s = 1, colour = P.ink) =>
  group(
    `translate(${cx} ${cy}) scale(${s})`,
    path('M-34 6 Q-17 -24 0 4 Q17 -24 34 6', 'none', colour, 7),
  )

// A rounded tree: trunk plus a cluster of leaf circles.
export function tree(cx, baseY, h, crown = P.gentle, trunk = P.amber) {
  const w = h * 0.12
  return (
    rect(cx - w / 2, baseY - h * 0.55, w, h * 0.55, trunk, w / 3) +
    circle(cx, baseY - h * 0.7, h * 0.3, crown) +
    circle(cx - h * 0.2, baseY - h * 0.55, h * 0.2, crown) +
    circle(cx + h * 0.2, baseY - h * 0.55, h * 0.2, crown)
  )
}

export function svgUri(width, height, body) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${body}</svg>`
  // Also escape ( ) and ' so the URI is safe inside an unquoted CSS url(...), as the puzzle uses.
  const encoded = encodeURIComponent(svg).replace(/[()']/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
  return `data:image/svg+xml;utf8,${encoded}`
}
