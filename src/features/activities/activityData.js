import { matchingArt } from './art/matchingArt'

// Familiar things for Matching Pairs. `image` is the drawn card face (art/matchingArt.js); if it is
// ever null the card shows a plain token-coloured tile with the name. `tone` is a key of TONES.
export const matchingItems = [
  { id: 'apple', name: 'Green apple', category: 'Fruits', tone: 'white', image: matchingArt.apple },
  { id: 'bananas', name: 'Bananas', category: 'Fruits', tone: 'sky', image: matchingArt.bananas },
  { id: 'orange', name: 'Orange', category: 'Fruits', tone: 'mint', image: matchingArt.orange },
  { id: 'grapes', name: 'Grapes', category: 'Fruits', tone: 'sage', image: matchingArt.grapes },
  { id: 'strawberries', name: 'Strawberry', category: 'Fruits', tone: 'white', image: matchingArt.strawberries },
  { id: 'cat', name: 'Cat', category: 'Animals', tone: 'sky', image: matchingArt.cat },
  { id: 'puppy', name: 'Puppy', category: 'Animals', tone: 'sage', image: matchingArt.puppy },
  { id: 'robin', name: 'Robin', category: 'Animals', tone: 'sky', image: matchingArt.robin },
  { id: 'rabbit', name: 'Rabbit', category: 'Animals', tone: 'teal', image: matchingArt.rabbit },
  { id: 'butterfly', name: 'Butterfly', category: 'Animals', tone: 'white', image: matchingArt.butterfly },
  { id: 'teacup', name: 'Tea cup', category: 'Comforts', tone: 'mint', image: matchingArt.teacup },
  { id: 'bread', name: 'Fresh bread', category: 'Comforts', tone: 'sky', image: matchingArt.bread },
  { id: 'cake', name: 'Birthday cake', category: 'Comforts', tone: 'sage', image: matchingArt.cake },
  { id: 'clock', name: 'Wall clock', category: 'Comforts', tone: 'mint', image: matchingArt.clock },
  { id: 'sunflower', name: 'Sunflower', category: 'Nature', tone: 'sky', image: matchingArt.sunflower },
  { id: 'rose', name: 'Rose', category: 'Nature', tone: 'white', image: matchingArt.rose },
]
