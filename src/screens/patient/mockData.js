// Fictional, simulated data for the Patient Home prototype. No real patient data.
export const PATIENT = {
  name: 'Mr. Sharma',
  // Caregiver shown on the SOS assistance screen. The number is a placeholder, not a callable
  // number: the Call button appears only when `phone` is a valid number (7 to 15 digits), for
  // example '+91 98765 43210'. Replace it here when a real demo number is available.
  caregiver: { name: 'Ananya', phone: '+91 XXXXX XXXXX', isDemo: true },
}

// Demo clock: a stable "now" so the lane looks the same every review.
// Override with ?time=HH:MM in the URL.
export const DEMO_TIME = '10:40'

// Each item is also a Reminder (shared contract, see features/reminders): `type` is 'medicine' or
// 'routine'. `leftOpen` items stay "Still to do" when their time has passed (never "missed").
export const SCHEDULE = [
  { id: 'tablets-am', type: 'medicine', time: '08:00', title: 'Morning tablets', icon: 'pill', note: 'With a glass of water' },
  { id: 'breakfast', type: 'routine', time: '09:00', title: 'Breakfast', icon: 'bowl', note: 'Something warm and tasty' },
  { id: 'water', type: 'routine', time: '10:00', title: 'A glass of water', icon: 'cup', note: 'Whenever you are ready', leftOpen: true },
  { id: 'garden', type: 'routine', time: '11:00', title: 'A walk in the garden', icon: 'tree', note: 'Take your time' },
  { id: 'lunch', type: 'routine', time: '12:30', title: 'Lunch', icon: 'bowl', note: 'Sit down and enjoy it' },
  { id: 'call', type: 'routine', time: '14:00', title: 'Call Ananya', icon: 'phone', note: 'Your daughter would love to hear from you' },
  { id: 'tea', type: 'routine', time: '15:30', title: 'Afternoon tea', icon: 'cup', note: 'And a little rest' },
  { id: 'dinner', type: 'routine', time: '18:00', title: 'Dinner', icon: 'bowl', note: 'A quiet meal' },
  { id: 'tablets-pm', type: 'medicine', time: '20:30', title: 'Evening tablets', icon: 'pill', note: 'Then a calm evening' },
]

// On-screen equivalents of the voice commands.
export const COMMANDS = [
  { id: 'next', label: "What's next?" },
  { id: 'reminders', label: 'Read my reminders' },
  { id: 'photos', label: 'Show photos' },
  { id: 'games', label: 'Play a game' },
]
