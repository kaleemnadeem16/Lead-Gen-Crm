import { NavLink } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { useIsAdmin, usePermission } from '@/hooks/usePermission'

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const logout          = useAuthStore((s) => s.logout)
  const isAdmin         = useIsAdmin()
  const canViewRuns     = usePermission('workflows.view')
  const canViewLeads    = usePermission('leads.view')
  const canViewOutreach = usePermission('outreach.view')
  const canViewAnalytics= usePermission('analytics.view')
  const canUseAi        = usePermission('ai.chat')

  const navItems = [
    { to: '/',          label: 'Dashboard',      show: true },
    { to: '/runs',      label: 'Run History',     show: canViewRuns },
    { to: '/leads',     label: 'Lead Pipeline',   show: canViewLeads },
    { to: '/outreach',  label: 'Outreach Center', show: canViewOutreach },
    { to: '/analytics', label: 'Analytics',       show: canViewAnalytics },
    { to: '/ai',        label: 'AI Assistant',    show: canUseAi },
    { to: '/team',      label: 'Team',            show: isAdmin },
  ].filter((item) => item.show)

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
  }

  return (
    <aside className="h-full w-64 bg-surface border-r border-line flex flex-col">
      <div className="px-5 py-4 border-b border-line">
        <span className="text-base font-semibold tracking-tight text-fg-1">X1Techs CRM</span>
        <span className="ml-2 text-[10px] bg-elevated border border-line text-fg-2 px-1.5 py-0.5 rounded-full">
          dev
        </span>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-fg-1 text-base font-medium'
                  : 'text-fg-2 hover:text-fg-1 hover:bg-elevated'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-line">
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-fg-3 hover:text-fg-2 transition-colors py-1"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
