import { LocationModule } from '../../features/location'
import { AlertList } from './analytics/AlertList'
import { DayStrip } from './analytics/DayStrip'
import { EngagementChart } from './analytics/EngagementChart'
import { MedicineWeek } from './analytics/MedicineWeek'
import { SosAlertPanel } from './sos/SosAlertPanel'
import { ManageTasks } from './tasks/ManageTasks'
import { TREND_TEXT, daysWithDataText, friendlyDate } from './analytics/format'
import { useAnalyticsSummary } from './analytics/useAnalyticsSummary'

// Top-rule colours (Mint Daylight tokens), one per section; the Alerts panel uses deep teal.
const RULES = {
  accent: 'bg-accent',
  turquoise: 'bg-turquoise',
  gentle: 'bg-gentle',
  deep: 'bg-deep',
}

function Panel({ title, rule = 'accent', children }) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-surface p-gutter pt-[calc(var(--spacing-gutter)+0.25rem)] shadow-card">
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${RULES[rule]}`} />
      <h3 className="text-body font-bold">{title}</h3>
      <div className="mt-2 text-body text-ink-soft">{children}</div>
    </div>
  )
}

function Section({ id, title, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <h2 id={`${id}-title`} className="mb-4 text-title font-bold">
        {title}
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  )
}

// Reminders "Today": the most recent day in the summary.
function TodayPanel({ daily }) {
  const today = daily[daily.length - 1]
  const lastComplete = [...daily].reverse().find((d) => d.isComplete)

  if (today?.isComplete) {
    return (
      <p>
        {friendlyDate(today.date)}: {today.medicineConfirmed} of {today.medicineScheduled} medicine
        reminders confirmed.
      </p>
    )
  }

  return (
    <div>
      <p>Today is still in progress, so nothing is counted yet.</p>
      {lastComplete && (
        <p className="mt-2">
          Latest complete day, {friendlyDate(lastComplete.date)}: {lastComplete.medicineConfirmed}{' '}
          of {lastComplete.medicineScheduled} medicine reminders confirmed.
        </p>
      )}
    </div>
  )
}

function ActivityPanel({ daily, weekly, baseline }) {
  if (weekly.daysWithData === 0) return <p>No complete days yet.</p>

  const items = daily.map((d) => ({
    date: d.date,
    value: d.engagement === null ? null : String(d.engagement),
    tone: d.isLowEngagement ? 'quiet' : 'good',
  }))
  const atOrAbove = daily.filter((d) => d.isComplete && !d.isLowEngagement).length

  return (
    <div>
      <p>
        {atOrAbove} of {weekly.daysWithData} days at or above the usual {baseline} a day. Total{' '}
        {weekly.totalEngagement} games, activities and album visits.
      </p>
      <div className="mt-3">
        <DayStrip items={items} label="Games, activities and album visits each day" />
      </div>
    </div>
  )
}

function MealsPanel({ daily, weekly }) {
  if (weekly.daysWithData === 0) return <p>No complete days yet.</p>

  const items = daily.map((d) => ({
    date: d.date,
    value: d.mealsLogged === null ? null : String(d.mealsLogged),
    tone: 'quiet',
  }))
  const total = daily.reduce((sum, d) => sum + (d.mealsLogged ?? 0), 0)

  return (
    <div>
      <p>
        {total} meals logged across {daysWithDataText(weekly)} with data.
      </p>
      <div className="mt-3">
        <DayStrip items={items} label="Meals logged each day" />
      </div>
    </div>
  )
}

export function CaregiverDashboard() {
  const summary = useAnalyticsSummary()
  const { daily, weekly, alerts, trend, baselinePerDay } = summary

  return (
    <div className="flex flex-col gap-gutter-lg">
      <header className="rounded-xl bg-deep px-6 py-8 text-on-deep md:px-10">
        <h1 tabIndex={-1} className="text-display font-bold">
          Caregiver dashboard
        </h1>
        <p className="mt-2 text-body text-on-deep-soft">
          {summary.patientName}: a calm overview of the last 7 days, using simulated data.
        </p>
      </header>

      <SosAlertPanel />

      <Section id="overview" title="Overview">
        <Panel title="Engagement, last 7 days" rule="accent">
          <EngagementChart daily={daily} baseline={baselinePerDay} />
          <p className="mt-3 text-ink">{TREND_TEXT[trend]}</p>
          <p className="mt-1">
            {weekly.averageEngagementPerDay === null
              ? 'No complete days yet.'
              : `Average ${weekly.averageEngagementPerDay} a day over ${daysWithDataText(weekly)} with data.`}
          </p>
        </Panel>
        <Panel title="Alerts" rule="deep">
          <AlertList alerts={alerts} />
        </Panel>
      </Section>

      <Section id="reminders" title="Reminders">
        <Panel title="Today" rule="turquoise">
          <TodayPanel daily={daily} />
        </Panel>
        <Panel title="This week" rule="turquoise">
          <MedicineWeek weekly={weekly} daily={daily} />
        </Panel>
      </Section>

      <ManageTasks />

      <Section id="activities" title="Activities">
        <Panel title="Activity this week" rule="gentle">
          <ActivityPanel daily={daily} weekly={weekly} baseline={baselinePerDay} />
        </Panel>
        <Panel title="Meals logged" rule="gentle">
          <MealsPanel daily={daily} weekly={weekly} />
        </Panel>
      </Section>

      <section id="safety" aria-labelledby="safety-title" className="scroll-mt-24">
        <h2 id="safety-title" className="mb-4 text-title font-bold">
          Location safety
        </h2>
        <LocationModule />
      </section>

      <p className="text-caption text-ink-faint">{summary.note}</p>
    </div>
  )
}
