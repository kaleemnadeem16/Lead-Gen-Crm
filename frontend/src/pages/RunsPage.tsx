import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { runsApi, type RunsFilters, type TriggerPayload } from '@/api/runs'
import { usePermission } from '@/hooks/usePermission'

const inputCls = 'bg-elevated border border-line rounded-lg px-3 py-2 text-sm text-fg-1 placeholder-fg-3 focus:outline-none focus:ring-1 focus:ring-fg-3 transition-colors'
const btnPrimary = 'bg-fg-1 hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed text-base text-sm font-medium px-4 py-2 rounded-lg transition-opacity'
const btnSecondary = 'bg-elevated hover:bg-line border border-line text-fg-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors'

const STATUS_COLORS: Record<string, string> = {
  running:  'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30',
  complete: 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30',
  failed:   'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-elevated text-fg-2 border border-line'}`}>
      {status === 'running' && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
      )}
      {status}
    </span>
  )
}

function TriggerModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<TriggerPayload>({
    business_type: '',
    location: '',
    max_results: 20,
    min_lead_score: 6,
    ai_model: 'gpt-4o-mini',
  })
  const [error, setError] = useState<string | null>(null)

  const { mutate, isPending } = useMutation({
    mutationFn: () => runsApi.trigger(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['runs'] }); onClose() },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Failed to trigger run.'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 py-4">
      <div className="bg-surface border border-line rounded-xl p-5 md:p-6 w-full max-w-md max-h-[90dvh] overflow-y-auto">
        <h2 className="text-base font-semibold text-fg-1 mb-5">Trigger Lead Gen Run</h2>

        <form onSubmit={(e) => { e.preventDefault(); setError(null); mutate() }} className="space-y-4">
          <div>
            <label className="block text-xs text-fg-2 mb-1">Business Type</label>
            <input required className={inputCls + ' w-full'} placeholder="e.g. plumbers"
              value={form.business_type} onChange={(e) => setForm({ ...form, business_type: e.target.value })} />
          </div>

          <div>
            <label className="block text-xs text-fg-2 mb-1">Location</label>
            <input required className={inputCls + ' w-full'} placeholder="e.g. Austin, TX"
              value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-fg-2 mb-1">Max Results</label>
              <input type="number" min={1} max={100} className={inputCls + ' w-full'}
                value={form.max_results}
                onChange={(e) => setForm({ ...form, max_results: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-xs text-fg-2 mb-1">Min Lead Score</label>
              <input type="number" min={1} max={10} className={inputCls + ' w-full'}
                value={form.min_lead_score}
                onChange={(e) => setForm({ ...form, min_lead_score: Number(e.target.value) })} />
            </div>
          </div>

          <div>
            <label className="block text-xs text-fg-2 mb-1">AI Model</label>
            <select className={inputCls + ' w-full'} value={form.ai_model}
              onChange={(e) => setForm({ ...form, ai_model: e.target.value })}>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4-turbo">gpt-4-turbo</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className={`${btnSecondary} flex-1`}>Cancel</button>
            <button type="submit" disabled={isPending} className={`${btnPrimary} flex-1`}>
              {isPending ? 'Starting…' : 'Start Run'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function RunsPage() {
  const canTrigger = usePermission('workflows.trigger')
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters]     = useState<RunsFilters>({ per_page: 20 })
  const [page, setPage]           = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['runs', { ...filters, page }],
    queryFn: () => runsApi.list({ ...filters, page }),
    select: (res) => res.data,
  })

  const runs     = data?.data ?? []
  const meta     = data?.meta
  const total    = meta?.total ?? 0
  const lastPage = meta?.last_page ?? 1

  const setFilter = (key: keyof RunsFilters, value: string) => {
    setPage(1)
    setFilters((f) => ({ ...f, [key]: value || undefined }))
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-fg-1">Run History</h1>
          <p className="text-sm text-fg-2 mt-0.5">{total} total runs</p>
        </div>
        {canTrigger && (
          <button onClick={() => setShowModal(true)} className={btnPrimary}>
            + New Run
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search…"
          className={`${inputCls} w-full sm:w-64`}
          onChange={(e) => setFilter('search', e.target.value)}
        />
        <select className={`${inputCls} flex-1 sm:flex-none`} onChange={(e) => setFilter('status', e.target.value)}>
          <option value="">All statuses</option>
          <option value="running">Running</option>
          <option value="complete">Complete</option>
          <option value="failed">Failed</option>
        </select>
        <input type="date" className={inputCls} onChange={(e) => setFilter('date_from', e.target.value)} />
        <input type="date" className={inputCls} onChange={(e) => setFilter('date_to', e.target.value)} />
      </div>

      {/* Table */}
      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-line">
                {['Business Type', 'Location', 'Status', 'Found', 'Qualified', 'Avg Score', 'Triggered By', 'Started', 'Duration'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-fg-3 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-fg-3">Loading…</td></tr>
              ) : runs.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-fg-3">No runs found.</td></tr>
              ) : runs.map((run) => (
                <tr key={run.id} className="border-b border-line last:border-0 hover:bg-elevated/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/runs/${run.id}`} className="text-fg-1 hover:text-fg-2 font-medium underline underline-offset-2 decoration-line">
                      {run.business_type}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-fg-2 whitespace-nowrap">{run.location}</td>
                  <td className="px-4 py-3"><StatusBadge status={run.status} /></td>
                  <td className="px-4 py-3 text-fg-2">{run.total_found ?? '—'}</td>
                  <td className="px-4 py-3 text-fg-2">{run.qualified_leads ?? '—'}</td>
                  <td className="px-4 py-3 text-fg-2">
                    {run.avg_priority_score != null ? run.avg_priority_score.toFixed(1) : '—'}
                  </td>
                  <td className="px-4 py-3 text-fg-3">{run.triggered_by ?? '—'}</td>
                  <td className="px-4 py-3 text-fg-3 whitespace-nowrap">{new Date(run.started_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-fg-3">{run.duration_seconds != null ? `${run.duration_seconds}s` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-between text-sm text-fg-2">
          <span>Page {page} of {lastPage}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className={`${btnSecondary} disabled:opacity-40`}>Previous</button>
            <button disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}
              className={`${btnSecondary} disabled:opacity-40`}>Next</button>
          </div>
        </div>
      )}

      {showModal && <TriggerModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
