// Fictional, simulated data for the Patient Home prototype. No real patient data.
export const PATIENT = { name: 'Margaret' }

// Demo clock: a stable "now" so the lane looks the same every review.
// Override with ?time=HH:MM in the URL.
export const DEMO_TIME = '10:40'

// `leftOpen` items stay "Still to do" when their time has passed (never "missed").
export const SCHEDULE = [
  { id: 'tablets-am', time: '08:00', title: 'Morning tablets', icon: 'pill', note: 'With a glass of water' },
  { id: 'breakfast', time: '09:00', title: 'Breakfast', icon: 'bowl', note: 'Something warm and tasty' },
  { id: 'water', time: '10:00', title: 'A glass of water', icon: 'cup', note: 'Whenever you are ready', leftOpen: true },
  { id: 'garden', time: '11:00', title: 'A walk in the garden', icon: 'tree', note: 'Take your time' },
  { id: 'lunch', time: '12:30', title: 'Lunch', icon: 'bowl', note: 'Sit down and enjoy it' },
  { id: 'call', time: '14:00', title: 'Call Sarah', icon: 'phone', note: 'Your daughter would love to hear from you' },
  { id: 'tea', time: '15:30', title: 'Afternoon tea', icon: 'cup', note: 'And a little rest' },
  { id: 'dinner', time: '18:00', title: 'Dinner', icon: 'bowl', note: 'A quiet meal' },
  { id: 'tablets-pm', time: '20:30', title: 'Evening tablets', icon: 'pill', note: 'Then a calm evening' },
]

// On-screen equivalents of the voice commands.
export const COMMANDS = [
  { id: 'next', label: "What's next?" },
  { id: 'reminders', label: 'Read my reminders' },
  { id: 'photos', label: 'Show photos' },
  { id: 'games', label: 'Play a game' },
]
