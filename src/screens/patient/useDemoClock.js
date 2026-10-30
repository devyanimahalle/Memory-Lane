import { useState } from 'react'
import { DEMO_TIME } from './mockData'

// "HH:MM" -> minutes since midnight, or null when invalid.
export function parseTime(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value ?? '')
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

// "14:00" -> "2:00 pm"
export function formatTime(value) {
  const total = typeof value === 'number' ? value : parseTime(value)
  const hours = Math.floor(total / 60)
  const minutes = String(total % 60).padStart(2, '0')
  const suffix = hours < 12 ? 'am' : 'pm'
  return `${hours % 12 || 12}:${minutes} ${suffix}`
}

// Minutes since midnight for the demo "now". Fixed per page load.
export function useDemoClock() {
  const [minutes] = useState(() => {
    const fromQuery = new URLSearchParams(window.location.search).get('time')
    return parseTime(fromQuery) ?? parseTime(DEMO_TIME)
  })
  return minutes
}
