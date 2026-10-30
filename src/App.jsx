import { ViewProvider } from './app/ViewProvider'
import { AppShell } from './app/AppShell'

export default function App() {
  return (
    <ViewProvider>
      <AppShell />
    </ViewProvider>
  )
}
