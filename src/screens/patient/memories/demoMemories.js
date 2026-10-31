// Temporary demo memories for the Patient Home album. All people and places are fictional.
//
// FUTURE LOCAL ASSETS
// Real photos go in `public/memories/<memory-id>/` and are referenced from the root:
//   public/memories/seaside/cover.jpg   ->  src: '/memories/seaside/cover.jpg'
//   public/memories/seaside/01.jpg      ->  src: '/memories/seaside/01.jpg'
//   public/memories/seaside/narration.mp3  (optional) -> audio: { src: '/memories/seaside/narration.mp3' }
// To switch a memory over, replace `art(...)` with `local('seaside', 'cover.jpg')` below.
// Shape of a memory:
//   { id, title, when, people, description, cover: {src, alt}, photos: [{src, alt, caption}], audio?: {src} }
import { art } from './demoArt'

// Path of a future local asset under public/memories/.
export const local = (id, file) => `/memories/${id}/${file}`

function memory({ id, scene, title, when, people, description, shots, audio = null }) {
  const photos = shots.map(([caption, alt], variant) => ({
    src: art(scene, variant),
    alt,
    caption,
  }))
  return { id, title, when, people, description, cover: photos[0], photos, audio }
}

export const MEMORIES = [
  memory({
    id: 'seaside',
    scene: 'seaside',
    title: 'A day at the seaside',
    when: 'A sunny summer',
    people: 'With Ananya',
    description:
      'You and Ananya spent the whole afternoon by the sea. You paddled at the water’s edge, shared a picnic on the sand and watched the sun sink low. Ananya still talks about how much you laughed that day.',
    shots: [
      ['Paddling at the water’s edge', 'Two people standing on a sandy beach beside a calm blue sea'],
      ['The sun going down', 'A golden evening sky over the sea'],
      ['Shade and a picnic', 'A beach umbrella on the sand'],
    ],
  }),
  memory({
    id: 'garden',
    scene: 'garden',
    title: 'Spring in our garden',
    when: 'Every spring',
    people: 'At home',
    description:
      'The garden always woke up in spring. The big tree came into leaf and the little flowers along the path opened one by one. It was your favourite place to sit with a cup of tea.',
    shots: [
      ['The big tree in leaf', 'A large green tree on a grassy hill under a blue sky'],
      ['A new morning', 'The garden in soft morning light'],
      ['Flowers along the path', 'Small yellow and peach flowers in the grass'],
    ],
  }),
  memory({
    id: 'lunch',
    scene: 'lunch',
    title: 'Sunday lunch together',
    when: 'Most Sundays',
    people: 'With the family',
    description:
      'Sunday lunch was the heart of the week. Everyone sat around the table, the kitchen smelled wonderful and there was always a second helping waiting. You made the best gravy in the family.',
    shots: [
      ['Everyone around the table', 'A table set with two plates beside a sunny window'],
      ['The roast, ready to carve', 'A roast dinner in the middle of the table'],
      ['A quiet moment after lunch', 'A table with plates and a vase of flowers'],
    ],
  }),
  memory({
    id: 'birthday',
    scene: 'birthday',
    title: 'A birthday to remember',
    when: 'One happy birthday',
    people: 'With friends and family',
    description:
      'The whole house was full of balloons and chatter. There was a cake with candles to blow out and a lot of singing. You said it was the best birthday you could remember.',
    shots: [
      ['Blowing out the candles', 'A birthday cake with four lit candles and balloons behind it'],
      ['Balloons for everyone', 'Colourful balloons floating above a table'],
      ['The first slice', 'A birthday cake with pink icing'],
    ],
  }),
  memory({
    id: 'baking',
    scene: 'baking',
    title: 'Baking day in the kitchen',
    when: 'Saturday mornings',
    people: 'With the grandchildren',
    description:
      'Saturday mornings meant flour on the counter and little hands helping. You showed everyone how to roll the pastry and the kitchen filled with the smell of fresh baking.',
    shots: [
      ['Rolling the pastry', 'A person at a kitchen counter with a rolling pin and a bowl'],
      ['Jars on the shelf', 'A kitchen shelf with coloured jars'],
      ['Fresh from the oven', 'A bowl of baking with pink icing on a counter'],
    ],
  }),
  memory({
    id: 'autumn',
    scene: 'autumn',
    title: 'An autumn walk in the park',
    when: 'A golden October',
    people: 'With Ananya',
    description:
      'The leaves had turned gold and orange, and the path was soft underfoot. You and Ananya sat on the bench for a while and listened to the park. It was peaceful.',
    shots: [
      ['Golden leaves overhead', 'Tall trees with orange and gold leaves above a park path'],
      ['A peach-coloured sky', 'A park bench under trees in a warm evening light'],
      ['The bench by the path', 'A wooden bench beside a quiet park path'],
    ],
  }),
]
