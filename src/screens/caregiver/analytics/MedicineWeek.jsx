import { DayStrip } from './DayStrip'
import { daysWithDataText } from './format'

// Weekly medicine totals plus one cell per day (confirmed/scheduled).
export function MedicineWeek({ weekly, daily }) {
  if (weekly.daysWithData === 0) {
    return <p>No complete days yet, so there is nothing to total.</p>
  }

  const items = daily.map((d) => ({
    date: d.date,
    value: !d.isComplete
      ? null
      : d.medicineScheduled === 0
        ? 'None'
        : `${d.medicineConfirmed}/${d.medicineScheduled}`,
    tone: d.medicineMissed > 0 ? 'quiet' : 'good',
  }))

  return (
    <div>
      <p className="text-ink">
        <span className="font-heading text-title font-bold">
          {weekly.medicinePercent === null ? 'Not available' : `${weekly.medicinePercent}%`}
        </span>{' '}
        confirmed
      </p>
      <p className="mt-1">
        {weekly.medicineConfirmed} of {weekly.medicineScheduled} reminders confirmed across{' '}
        {daysWithDataText(weekly)} with data.
      </p>
      <div className="mt-3">
        <DayStrip items={items} label="Medicine reminders confirmed each day" />
      </div>
      <p className="mt-2 text-caption">
        Each cell shows confirmed out of scheduled. A dash means no data.
      </p>
    </div>
  )
}
