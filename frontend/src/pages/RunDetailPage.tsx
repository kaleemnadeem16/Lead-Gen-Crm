import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { runsApi, type TopLead } from '@/api/runs'

const CHANNEL_LABELS: Record<string, string> = {
  email:   'Email',
  phone:   'Phone',
  sms:     'SMS',
  website: 'Website Form',
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-elevated border border-line rounded-xl px-4 py-4">
      <p className="text-xs text-fg-3 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-semibold text-fg-1">{value ?? '—'}</p>
    </div>
  )
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return <span className="text-fg-3">—</span>
  const color = score >= 8 ? 'text-green-500' : score >= 5 ? 'text-yellow-500' : 'text-red-500'
  return <span className={`font-semibold ${color}`}>{score}</span>
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    running:  'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    complete: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30',
    failed:   'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-medium border ${colors[status] ?? 'bg-elevated text-fg-2 border-line'}`}>
      {status === 'running' && <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />}
      {status}
    </span>
  )
}

function LeadStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new:          'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    contacted:    'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    qualified:    'bg-green-500/15 text-green-600 dark:text-green-400',
    disqualified: 'bg-elevated text-fg-3',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? 'bg-elevated text-fg-3'}`}>
      {status}
    </span>
  )
}

export function RunDetailPage() {
  const { id } = useParams<{ id: string }>()
  const runId = Number(id)
  const qc    = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['run', runId],
    queryFn: () => runsApi.show(runId),
    select: (res) => res.data,
  })

  const run      = data?.run
  const topLeads: TopLead[] = data?.top_leads ?? []

  useEffect(() => {
    if (run?.status !== 'running') return
    const interval = setInterval(async () => {
      try {
        const { data: poll } = await runsApi.poll(runId)
        if (poll.status !== 'running') {
          clearInterval(interval)
          qc.invalidateQueries({ queryKey: ['run', runId] })
          qc.invalidateQueries({ queryKey: ['runs'] })
        } else {
          qc.setQueryData(['run', runId], (old: any) => {
            if (!old) return old
            return { data: { ...old.data, run: { ...old.data.run, ...poll } } }
          })
        }
      } catch {}
    }, 4000)
    return () => clearInterval(interval)
  }, [run?.status, runId, qc])

  if (isLoading) return <div className="flex items-center justify-center h-64 text-fg-3">Loading run…</div>

  if (isError || !run) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-fg-2">Run not found.</p>
        <Link to="/runs" className="text-sm text-fg-2 hover:text-fg-1 underline underline-offset-2">← Back to runs</Link>
      </div>
    )
  }

  const duration = run.duration_seconds != null
    ? run.duration_seconds < 60 ? `${run.duration_seconds}s` : `${Math.floor(run.duration_seconds / 60)}m ${run.duration_seconds % 60}s`
    : null

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <Link to="/runs" className="text-sm text-fg-3 hover:text-fg-2 transition-colors">← Run History</Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mt-2">
          <div>
            <h1 className="text-xl font-semibold text-fg-1">{run.business_type} — {run.location}</h1>
            <p className="text-sm text-fg-2 mt-0.5">
              Run #{run.id} · {new Date(run.started_at).toLocaleString()}
              {run.triggered_by && ` · ${run.triggered_by}`}
            </p>
          </div>
          <StatusBadge status={run.status} />
        </div>
      </div>

      {/* Error */}
      {run.error_message && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 text-sm text-red-600 dark:text-red-400">
          <span className="font-medium">Error: </span>{run.error_message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Places Found"    value={run.total_found} />
        <StatCard label="Details Fetched" value={run.details_fetched} />
        <StatCard label="Enriched"        value={run.enriched} />
        <StatCard label="Analyzed"        value={run.total_analyzed} />
        <StatCard label="Qualified Leads" value={run.qualified_leads} />
        <StatCard label="Avg Priority"    value={run.avg_priority_score?.toFixed(1)} />
        <StatCard label="Top Score"       value={run.top_score} />
        <StatCard label="Duration"        value={duration} />
      </div>

      {/* Config pills */}
      <div className="flex flex-wrap gap-2">
        {run.ai_model && (
          <span className="px-3 py-1 rounded-full bg-elevated border border-line text-xs text-fg-2">
            Model: {run.ai_model}
          </span>
        )}
        {run.min_lead_score != null && (
          <span className="px-3 py-1 rounded-full bg-elevated border border-line text-xs text-fg-2">
            Min score: {run.min_lead_score}
          </span>
        )}
        {run.api_calls_used != null && (
          <span className="px-3 py-1 rounded-full bg-elevated border border-line text-xs text-fg-2">
            API calls: {run.api_calls_used}
          </span>
        )}
      </div>

      {/* Top Leads */}
      <div>
        <h2 className="text-base font-semibold text-fg-1 mb-3">
          Top Leads {topLeads.length > 0 && <span className="text-fg-3 font-normal text-sm">({topLeads.length})</span>}
        </h2>

        {topLeads.length === 0 ? (
          <div className="bg-surface border border-line rounded-xl px-5 py-8 text-center text-fg-3 text-sm">
            {run.status === 'running' ? 'Waiting for leads…' : 'No qualified leads for this run.'}
          </div>
        ) : (
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-line">
                    {['Business', 'Phone', 'Website', 'Rating', 'Priority', 'Channel', 'Status'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-fg-3 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topLeads.map((lead) => (
                    <tr key={lead.crm_lead_id} className="border-b border-line last:border-0 hover:bg-elevated/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-fg-1">{lead.business_name ?? '—'}</td>
                      <td className="px-4 py-3 text-fg-2">{lead.phone_number ?? '—'}</td>
                      <td className="px-4 py-3">
                        {lead.website_url ? (
                          <a href={lead.website_url} target="_blank" rel="noopener noreferrer"
                            className="text-fg-1 hover:text-fg-2 underline underline-offset-2 decoration-line truncate max-w-[160px] block">
                            {lead.website_url.replace(/^https?:\/\//, '')}
                          </a>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-fg-2">{lead.rating ?? '—'}</td>
                      <td className="px-4 py-3"><ScoreBadge score={lead.priority_score} /></td>
                      <td className="px-4 py-3 text-fg-2">
                        {lead.preferred_channel ? (CHANNEL_LABELS[lead.preferred_channel] ?? lead.preferred_channel) : '—'}
                      </td>
                      <td className="px-4 py-3"><LeadStatusBadge status={lead.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
