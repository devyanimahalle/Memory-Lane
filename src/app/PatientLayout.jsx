// Patient frame: a calm, centred column, up to about 64rem. The screen switches to
// two columns from 1024px; below that the voice control is a fixed bottom bar.
// Bottom padding on phones keeps the fixed voice control from covering content.
// Content comes from src/screens/patient.
export function PatientLayout({ children }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-40 md:px-gutter md:pt-gutter-lg lg:pb-gutter-lg">
      {children}
    </div>
  )
}
