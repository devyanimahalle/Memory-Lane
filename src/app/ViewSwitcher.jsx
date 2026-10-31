import { useSos } from './sos/useSos'
import { useView } from './useView'

const OPTIONS = [
  { value: 'patient', label: 'Patient view' },
  { value: 'caregiver', label: 'Caregiver view' },
]

export function ViewSwitcher() {
  const { view, setView } = useView()
  const { current } = useSos()
  const waiting = current?.status === 'sent' // an SOS the caregiver has not acknowledged yet

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="sr-only">Choose which view to show</legend>
      <div className="inline-flex rounded-lg bg-sunken p-1">
        {OPTIONS.map(({ value, label }) => (
          <label key={value} className="relative cursor-pointer">
            <input
              type="radio"
              name="view"
              value={value}
              checked={view === value}
              onChange={() => setView(value)}
              className="peer sr-only"
            />
            <span className="flex min-h-touch items-center rounded-md px-4 text-body font-medium text-ink-soft transition-colors duration-quick ease-gentle peer-checked:bg-accent peer-checked:text-on-accent peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus">
              {label}
              {value === 'caregiver' && waiting && (
                <>
                  <span aria-hidden="true" className="ml-2 rounded-full bg-sos px-2 text-caption font-bold text-on-accent">
                    SOS
                  </span>
                  <span className="sr-only">, SOS alert waiting</span>
                </>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
