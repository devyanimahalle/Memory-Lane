// Spot the Difference scenes. Each scene is two drawn pictures (art/differenceScenes.js) that
// differ in exactly five places; the position, label and hint of every difference are defined
// next to the drawing, so the pictures and this data cannot disagree.
import { SCENE_ART } from '../../art/differenceScenes'

export const SCENES = [
  {
    id: 'garden',
    title: 'Garden',
    instruction: 'Five things are different in the second picture. Take your time to find them.',
    ...SCENE_ART.garden,
  },
  {
    id: 'tea-table',
    title: 'Tea table',
    instruction: 'Five things are different in the second picture. Look slowly, there is no rush.',
    ...SCENE_ART.tea,
  },
  {
    id: 'seaside',
    title: 'Seaside',
    instruction: 'Five things are different in the second picture. Enjoy looking for them.',
    ...SCENE_ART.seaside,
  },
]
