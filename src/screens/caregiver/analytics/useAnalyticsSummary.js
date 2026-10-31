import { useMemo } from 'react'
import { getAnalyticsSummary } from '../../../features/analytics'

// The only place the caregiver screens read analytics from (simulated data for now).
export function useAnalyticsSummary() {
  return useMemo(() => getAnalyticsSummary(), [])
}
