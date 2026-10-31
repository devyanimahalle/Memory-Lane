import { P } from './palette'
import { circle, ellipse, line, path, poly, rect, svgUri } from './svg'

// Matching Pairs card faces: 16 familiar objects, each drawn in a 200 x 200 box on a transparent
// background (the card supplies the tint). Flat token fills, a few ink details.
export const MATCHING_DRAW = {
  apple: () =>
    circle(76, 118, 50, P.gentle) +
    circle(124, 118, 50, P.gentle) +
    rect(96, 44, 9, 34, P.amber, 4) +
    ellipse(132, 52, 28, 13, P.turquoise, -25) +
    ellipse(62, 100, 9, 18, P.sage, 25),

  bananas: () =>
    path('M44 56 Q58 164 150 150 Q162 138 150 128 Q94 128 66 48 Z', P.butter, P.amber, 6) +
    path('M72 44 Q92 154 172 128 Q182 114 168 108 Q112 116 92 40 Z', P.butter, P.amber, 6) +
    rect(46, 36, 38, 16, P.amber, 7),

  orange: () =>
    circle(100, 116, 64, P.orange) +
    ellipse(124, 48, 28, 13, P.gentle, -20) +
    rect(97, 48, 7, 14, P.amber, 3) +
    ellipse(78, 96, 12, 22, P.peach, 25) +
    [[110, 130], [136, 112], [92, 140], [126, 150]].map(([x, y]) => circle(x, y, 3.5, P.amber)).join(''),

  grapes:
    () =>
      [[62, 92], [100, 92], [138, 92], [80, 126], [120, 126], [100, 160]]
        .map(([x, y]) => circle(x, y, 21, P.purple) + circle(x - 7, y - 7, 5, P.sky))
        .join('') +
      rect(97, 38, 7, 34, P.amber, 3) +
      ellipse(132, 54, 30, 14, P.gentle, -20),

  strawberries: () =>
    path('M100 178 C34 138 40 80 100 76 C160 80 166 138 100 178 Z', P.orange) +
    [[76, 108], [124, 106], [100, 128], [72, 140], [128, 140], [100, 156]]
      .map(([x, y]) => ellipse(x, y, 4, 7, P.butter))
      .join('') +
    poly('56 84 80 68 100 82 120 68 144 84 122 96 100 90 78 96', P.gentle) +
    rect(97, 44, 7, 28, P.gentle, 3),

  cat: () =>
    ellipse(100, 160, 52, 36, P.inkSoft) +
    poly('44 96 50 34 92 66', P.inkSoft) +
    poly('156 96 150 34 108 66', P.inkSoft) +
    poly('54 84 57 50 80 68', P.peach) +
    poly('146 84 143 50 120 68', P.peach) +
    ellipse(100, 108, 62, 52, P.inkSoft) +
    ellipse(76, 104, 10, 13, P.butter) +
    ellipse(124, 104, 10, 13, P.butter) +
    ellipse(76, 104, 3.5, 10, P.ink) +
    ellipse(124, 104, 3.5, 10, P.ink) +
    poly('92 124 108 124 100 134', P.peach) +
    line(28, 120, 66, 126, P.white, 4) +
    line(28, 138, 66, 132, P.white, 4) +
    line(172, 120, 134, 126, P.white, 4) +
    line(172, 138, 134, 132, P.white, 4),

  puppy: () =>
    ellipse(48, 104, 22, 48, P.amber, 14) +
    ellipse(152, 104, 22, 48, P.amber, -14) +
    circle(100, 106, 58, P.orange) +
    ellipse(100, 132, 32, 25, P.peach) +
    circle(76, 94, 8, P.ink) +
    circle(124, 94, 8, P.ink) +
    circle(79, 91, 2.5, P.white) +
    circle(127, 91, 2.5, P.white) +
    ellipse(100, 118, 12, 9, P.ink) +
    path('M100 126 L100 138 M86 140 Q100 152 114 140', 'none', P.ink, 4) +
    ellipse(100, 154, 10, 12, P.peach),

  robin: () =>
    line(20, 166, 180, 160, P.amber, 9) +
    line(92, 154, 92, 168, P.ink, 5) +
    line(114, 154, 114, 166, P.ink, 5) +
    circle(100, 108, 54, P.amber) +
    ellipse(106, 128, 38, 34, P.orange) +
    poly('148 96 180 104 148 114', P.butter, P.amber, 3) +
    circle(124, 90, 8, P.white) +
    circle(126, 90, 4, P.ink) +
    ellipse(68, 118, 24, 13, P.inkSoft, 28),

  rabbit: () =>
    ellipse(76, 58, 17, 50, P.white, -8, P.lineStrong, 5) +
    ellipse(124, 58, 17, 50, P.white, 8, P.lineStrong, 5) +
    ellipse(76, 60, 7, 34, P.peach, -8) +
    ellipse(124, 60, 7, 34, P.peach, 8) +
    circle(100, 126, 52, P.white, P.lineStrong, 5) +
    circle(82, 118, 6, P.ink) +
    circle(118, 118, 6, P.ink) +
    poly('92 134 108 134 100 145', P.orange) +
    path('M100 145 L100 153 M90 156 Q100 162 110 156', 'none', P.inkSoft, 4) +
    circle(66, 138, 9, P.peach) +
    circle(134, 138, 9, P.peach),

  butterfly: () =>
    ellipse(64, 80, 40, 32, P.turquoise, -25) +
    ellipse(136, 80, 40, 32, P.turquoise, 25) +
    ellipse(72, 130, 30, 26, P.purple, 25) +
    ellipse(128, 130, 30, 26, P.purple, -25) +
    circle(60, 78, 10, P.butter) +
    circle(140, 78, 10, P.butter) +
    circle(70, 130, 7, P.butter) +
    circle(130, 130, 7, P.butter) +
    ellipse(100, 108, 8, 46, P.ink) +
    path('M96 64 Q84 38 68 34 M104 64 Q116 38 132 34', 'none', P.ink, 4),

  teacup: () =>
    path('M148 94 Q186 92 180 124 Q174 148 140 142', 'none', P.lineStrong, 9) +
    path('M38 86 L162 86 Q160 152 100 156 Q40 152 38 86 Z', P.white, P.lineStrong, 5) +
    path('M40 108 L160 108 Q158 114 156 120 L44 120 Q42 114 40 108 Z', P.turquoise) +
    ellipse(100, 162, 72, 13, P.sky, 0, P.lineStrong, 5) +
    ellipse(100, 90, 60, 9, P.orange) +
    path('M80 70 Q70 54 82 40 M104 70 Q94 54 106 36 M126 70 Q116 54 128 42', 'none', P.inkSoft, 5),

  bread: () =>
    path('M24 114 Q24 52 100 52 Q176 52 176 114 L176 152 Q176 164 164 164 L36 164 Q24 164 24 152 Z', P.orange, P.amber, 5) +
    path('M60 68 L80 112 M98 60 L118 112 M136 68 L152 108', 'none', P.peach, 8) +
    path('M24 130 Q100 146 176 130', 'none', P.amber, 4),

  cake: () =>
    rect(30, 118, 140, 52, P.orange, 12) +
    rect(48, 78, 104, 46, P.peach, 12, P.orange, 4) +
    path('M30 124 Q50 146 70 124 Q90 146 110 124 Q130 146 150 124 Q160 138 170 124', P.white) +
    rect(96, 46, 9, 32, P.turquoise, 3) +
    path('M100 20 Q114 36 100 46 Q86 36 100 20 Z', P.butter, P.amber, 3) +
    circle(66, 100, 5, P.purple) +
    circle(100, 104, 5, P.purple) +
    circle(134, 100, 5, P.purple),

  clock: () =>
    circle(100, 100, 78, P.white, P.ink, 9) +
    [0, 90, 180, 270]
      .map((a) => `<g transform="rotate(${a} 100 100)">${line(100, 36, 100, 50, P.ink, 7)}</g>`)
      .join('') +
    [30, 60, 120, 150, 210, 240, 300, 330]
      .map((a) => `<g transform="rotate(${a} 100 100)">${line(100, 36, 100, 43, P.inkSoft, 4)}</g>`)
      .join('') +
    line(100, 100, 100, 56, P.ink, 8) +
    line(100, 100, 132, 118, P.accent, 7) +
    circle(100, 100, 8, P.ink),

  sunflower: () =>
    rect(97, 120, 7, 70, P.gentle, 3) +
    ellipse(132, 164, 26, 11, P.gentle, -28) +
    Array.from({ length: 12 }, (_, i) =>
      `<g transform="rotate(${i * 30} 100 96)">${ellipse(100, 42, 14, 32, P.butter, 0, P.amber, 3)}</g>`,
    ).join('') +
    circle(100, 96, 31, P.amber) +
    circle(100, 96, 14, P.orange),

  rose: () =>
    rect(97, 124, 7, 66, P.gentle, 3) +
    ellipse(130, 164, 26, 11, P.gentle, -30) +
    ellipse(70, 150, 24, 10, P.gentle, 30) +
    circle(100, 94, 56, P.peach, P.orange, 5) +
    circle(100, 94, 38, P.peach, P.orange, 5) +
    path('M78 94 a22 22 0 1 1 22 22', 'none', P.orange, 5) +
    path('M90 94 a10 10 0 1 1 10 10', 'none', P.orange, 5),
}

export const matchingArt = Object.fromEntries(
  Object.entries(MATCHING_DRAW).map(([id, draw]) => [id, svgUri(200, 200, draw())]),
)
