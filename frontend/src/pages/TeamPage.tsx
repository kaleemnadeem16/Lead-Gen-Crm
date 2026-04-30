import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  teamApi,
  ALL_ROLES,
  ALL_PERMISSIONS,
  PERMISSION_LABELS,
  type Member,
  type InviteMemberPayload,
} from '@/api/team'
import { useAuthStore } from '@/stores/authStore'

// ─── Shared style tokens ──────────────────────────────────────────────────────

const inputCls = 'w-full bg-elevated border border-line rounded-lg px-3 py-2 text-sm text-fg-1 placeholder-fg-3 focus:outline-none focus:ring-1 focus:ring-fg-3 transition-colors'
const btnPrimary = 'bg-fg-1 hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed text-base text-sm font-medium px-4 py-2 rounded-lg transition-opacity'
const btnSecondary = 'bg-elevated hover:bg-line border border-line text-fg-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors'

// ─── Role badge ───────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin:       'Admin',
  member:      'Member',
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-elevated border border-line text-fg-2">
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}

// ─── Invite modal ─────────────────────────────────────────────────────────────

function InviteModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<InviteMemberPayload>({ name: '', email: '', role: 'member' })
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: teamApi.invite,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team'] }); onClose() },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Failed to invite member.'),
  })

  const set = (k: keyof InviteMemberPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-base font-semibold text-fg-1 mb-4">Invite Team Member</h2>
      {error && <ErrorBanner message={error} />}

      <div className="space-y-3">
        <Field label="Full name">
          <input value={form.name} onChange={set('name')} placeholder="Jane Smith" className={inputCls} required autoFocus />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email} onChange={set('email')} placeholder="jane@x1techs.com" className={inputCls} required />
        </Field>
        <Field label="Role">
          <select value={form.role} onChange={set('role')} className={inputCls}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
      </div>

      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className={`${btnSecondary} flex-1`}>Cancel</button>
        <button
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending || !form.name || !form.email}
          className={`${btnPrimary} flex-1`}
        >
          {mutation.isPending ? 'Inviting…' : 'Invite'}
        </button>
      </div>
    </Overlay>
  )
}

// ─── Edit member drawer ───────────────────────────────────────────────────────

function EditMemberDrawer({ member, onClose }: { member: Member; onClose: () => void }) {
  const qc = useQueryClient()
  const currentUser   = useAuthStore((s) => s.user)
  const isSuperAdmin  = currentUser?.roles.includes('super_admin') ?? false

  const [roles, setRoles]             = useState<string[]>(member.roles)
  const [permissions, setPermissions] = useState<string[]>(member.permissions)
  const [error, setError]             = useState('')

  const rolesMutation = useMutation({
    mutationFn: (r: string[]) => teamApi.syncRoles(member.id, r),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] }),
    onError: (err: any) => setError(err.response?.data?.message ?? 'Failed to update roles.'),
  })

  const permsMutation = useMutation({
    mutationFn: (p: string[]) => teamApi.syncPermissions(member.id, p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] }),
    onError: (err: any) => setError(err.response?.data?.message ?? 'Failed to update permissions.'),
  })

  const removeMutation = useMutation({
    mutationFn: () => teamApi.remove(member.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team'] }); onClose() },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Failed to remove member.'),
  })

  const isSelf           = currentUser?.id === member.id
  const targetIsSA       = member.roles.includes('super_admin')
  const canEdit          = isSuperAdmin || (!targetIsSA && !isSelf)

  const toggleRole = (role: string) =>
    setRoles((r) => r.includes(role) ? r.filter((x) => x !== role) : [...r, role])

  const togglePerm = (perm: string) =>
    setPermissions((p) => p.includes(perm) ? p.filter((x) => x !== perm) : [...p, perm])

  return (
    <Overlay onClose={onClose} wide>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-fg-1">{member.name}</h2>
          <p className="text-xs text-fg-3 mt-0.5">{member.email}</p>
        </div>
        {!isSelf && canEdit && (
          <button
            onClick={() => { if (confirm(`Remove ${member.name}?`)) removeMutation.mutate() }}
            disabled={removeMutation.isPending}
            className="text-xs text-red-500 hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Roles */}
      <section className="mb-5">
        <h3 className="text-xs font-medium text-fg-3 uppercase tracking-wide mb-2">Roles</h3>
        <div className="space-y-1.5">
          {ALL_ROLES.map((role) => {
            const disabled = !canEdit || (role === 'super_admin' && !isSuperAdmin)
            return (
              <label key={role} className={`flex items-center gap-2.5 text-sm ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={() => !disabled && toggleRole(role)}
                  disabled={disabled}
                  className="accent-fg-1"
                />
                <span className="capitalize text-fg-1">{role.replace('_', ' ')}</span>
              </label>
            )
          })}
        </div>
        {canEdit && (
          <button
            onClick={() => rolesMutation.mutate(roles)}
            disabled={rolesMutation.isPending}
            className={`${btnPrimary} mt-3 text-xs px-3 py-1.5`}
          >
            {rolesMutation.isPending ? 'Saving…' : 'Save roles'}
          </button>
        )}
      </section>

      {/* Permissions */}
      <section>
        <h3 className="text-xs font-medium text-fg-3 uppercase tracking-wide mb-1">Direct Permission Overrides</h3>
        <p className="text-xs text-fg-3 mb-2">Granted on top of role defaults.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {ALL_PERMISSIONS.map((perm) => (
            <label key={perm} className={`flex items-center gap-2 text-xs ${!canEdit ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={permissions.includes(perm)}
                onChange={() => canEdit && togglePerm(perm)}
                disabled={!canEdit}
                className="accent-fg-1"
              />
              <span className="text-fg-2">{PERMISSION_LABELS[perm]}</span>
            </label>
          ))}
        </div>
        {canEdit && (
          <button
            onClick={() => permsMutation.mutate(permissions)}
            disabled={permsMutation.isPending}
            className={`${btnPrimary} mt-3 text-xs px-3 py-1.5`}
          >
            {permsMutation.isPending ? 'Saving…' : 'Save permissions'}
          </button>
        )}
      </section>
    </Overlay>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function TeamPage() {
  const [showInvite, setShowInvite] = useState(false)
  const [editMember, setEditMember] = useState<Member | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['team'],
    queryFn: () => teamApi.list().then((r) => r.data.data),
  })

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-fg-1">Team Management</h2>
          <p className="text-sm text-fg-2 mt-1">Manage roles and module access for your team.</p>
        </div>
        <button onClick={() => setShowInvite(true)} className={btnPrimary}>
          + Invite
        </button>
      </div>

      {isLoading && <div className="text-sm text-fg-3 py-12 text-center">Loading members…</div>}
      {isError   && <div className="text-sm text-red-500 py-12 text-center">Failed to load members.</div>}

      {data && (
        <div className="bg-surface border border-line rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-line">
                  {['Name', 'Email', 'Roles', 'Permissions', ''].map((h) => (
                    <th key={h} className="text-left text-xs text-fg-3 font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((member) => (
                  <tr key={member.id} className="border-b border-line last:border-0 hover:bg-elevated/50 transition-colors">
                    <td className="px-5 py-3.5 text-fg-1 font-medium whitespace-nowrap">{member.name}</td>
                    <td className="px-5 py-3.5 text-fg-2">{member.email}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {member.roles.length > 0
                          ? member.roles.map((r) => <RoleBadge key={r} role={r} />)
                          : <span className="text-xs text-fg-3">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-fg-3 text-xs">
                      {member.permissions.length > 0 ? `${member.permissions.length} overrides` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setEditMember(member)}
                        className="text-xs text-fg-2 hover:text-fg-1 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
      {editMember && <EditMemberDrawer member={editMember} onClose={() => setEditMember(null)} />}
    </div>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Overlay({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 py-4" onClick={onClose}>
      <div
        className={`bg-surface border border-line rounded-xl p-5 md:p-6 w-full ${wide ? 'max-w-lg' : 'max-w-sm'} max-h-[90dvh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-fg-2 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2 mb-3">
      {message}
    </div>
  )
}
