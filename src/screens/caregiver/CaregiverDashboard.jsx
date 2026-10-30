// Top-rule colours (Mint Daylight tokens), one per section; the Alerts panel uses deep teal.
const RULES = {
  accent: 'bg-accent',
  turquoise: 'bg-turquoise',
  gentle: 'bg-gentle',
  deep: 'bg-deep',
}

// Placeholder panels. Real data comes from the analytics/reminders/activities features.
function Panel({ title, rule = 'accent', children }) {
  return (
    <div
      className="relative overflow-hidden rounded-lg bg-surface p-gutter pt-[calc(var(--spacing-gutter)+0.25rem)] shadow-card"
    >
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${RULES[rule]}`} />
      <h3 className="text-body font-bold">{title}</h3>
      <p className="mt-2 text-body text-ink-soft">{children}</p>
    </div>
  )
}

function Section({ id, title, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <h2 id={`${id}-title`} className="mb-4 text-title font-bold">
        {title}
      </h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  )
}

export function CaregiverDashboard() {
  return (
    <div className="flex flex-col gap-gutter-lg">
      <header className="rounded-xl bg-deep px-6 py-8 text-on-deep md:px-10">
        <h1 tabIndex={-1} className="text-display font-bold">
          Caregiver dashboard
        </h1>
        <p className="mt-2 text-body text-on-deep-soft">
          A calm overview of the last 7 days, using simulated data.
        </p>
      </header>

      <Section id="overview" title="Overview">
        <Panel title="Engagement, last 7 days" rule="accent">
          Chart placeholder. Coming from analytics.
        </Panel>
        <Panel title="Alerts" rule="deep">
          Alerts placeholder. Changes from the usual baseline will appear here.
        </Panel>
      </Section>

      <Section id="reminders" title="Reminders">
        <Panel title="Today" rule="turquoise">
          Reminder tracking placeholder.
        </Panel>
        <Panel title="This week" rule="turquoise">
          Completed and missed reminders placeholder.
        </Panel>
      </Section>

      <Section id="activities" title="Activities">
        <Panel title="Games" rule="gentle">
          Game activity placeholder.
        </Panel>
        <Panel title="Photo album" rule="gentle">
          Album activity placeholder.
        </Panel>
      </Section>
    </div>
  )
}
