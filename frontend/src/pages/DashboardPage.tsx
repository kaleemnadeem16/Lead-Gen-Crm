import { useAuthStore } from '@/stores/authStore'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-fg-1">Welcome back, {user?.name?.split(' ')[0]}</h2>
        <p className="text-sm text-fg-2 mt-1">Here's what's happening with your leads.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { label: 'Total Leads',   value: '—', sub: 'from all runs' },
          { label: 'New This Week', value: '—', sub: 'uncontacted' },
          { label: 'In Pipeline',   value: '—', sub: 'active deals' },
          { label: 'Closed Won',    value: '—', sub: 'all time' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-surface border border-line rounded-xl p-4 md:p-5">
            <p className="text-xs text-fg-3 mb-1">{label}</p>
            <p className="text-2xl font-semibold text-fg-1">{value}</p>
            <p className="text-xs text-fg-3 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Coming soon panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {[
          { title: 'Recent Runs',       desc: 'Latest lead gen workflow executions' },
          { title: 'Hot Leads',         desc: 'Top scoring uncontacted leads' },
          { title: 'Follow-ups Due',    desc: 'Leads with overdue next follow-up' },
          { title: 'Outreach Activity', desc: 'Emails sent & replies this week' },
        ].map(({ title, desc }) => (
          <div key={title} className="bg-surface border border-line rounded-xl p-4 md:p-5">
            <h3 className="text-sm font-medium text-fg-1 mb-1">{title}</h3>
            <p className="text-xs text-fg-3 mb-4">{desc}</p>
            <div className="flex items-center justify-center h-20 text-xs text-fg-3 border border-dashed border-line rounded-lg">
              Coming in Phase 2
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
