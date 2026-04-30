import { useLocation } from 'react-router-dom'

const labels: Record<string, string> = {
  '/leads':     'Lead Pipeline',
  '/outreach':  'Outreach Center',
  '/analytics': 'Analytics',
  '/ai':        'AI Assistant',
  '/team':      'Team Management',
}

export function PlaceholderPage() {
  const { pathname } = useLocation()
  const label = labels[pathname] ?? 'This page'

  return (
    <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-96">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-fg-1 mb-2">{label}</h2>
        <p className="text-sm text-fg-3">This module is being built — check back soon.</p>
      </div>
    </div>
  )
}
