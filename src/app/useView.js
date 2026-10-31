import { useContext } from 'react'
import { ViewContext } from './ViewContext'

export function useView() {
  const value = useContext(ViewContext)
  if (!value) throw new Error('useView must be used inside <ViewProvider>')
  return value
}
