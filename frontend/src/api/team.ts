import { client } from './client'
import type { User } from './auth'

export interface Member extends User {}

export interface MemberListResponse {
  data: Member[]
}

export interface InviteMemberPayload {
  name: string
  email: string
  role?: string
  timezone?: string
}

export const teamApi = {
  list: () => client.get<MemberListResponse>('/team/members'),

  invite: (payload: InviteMemberPayload) =>
    client.post<{ data: Member }>('/team/members', payload),

  remove: (userId: number) =>
    client.delete(`/team/members/${userId}`),

  syncRoles: (userId: number, roles: string[]) =>
    client.put<{ data: { id: number; roles: string[] } }>(`/team/members/${userId}/roles`, { roles }),

  syncPermissions: (userId: number, permissions: string[]) =>
    client.put<{ data: { id: number; permissions: string[] } }>(
      `/team/members/${userId}/permissions`,
      { permissions },
    ),
}

export const ALL_ROLES = ['super_admin', 'admin', 'member'] as const

export const ALL_PERMISSIONS = [
  'leads.view', 'leads.edit', 'leads.assign',
  'workflows.view', 'workflows.trigger',
  'outreach.view', 'outreach.draft', 'outreach.send',
  'analytics.view',
  'ai.chat',
  'templates.manage',
  'team.manage',
] as const

export const PERMISSION_LABELS: Record<string, string> = {
  'leads.view':         'View Leads',
  'leads.edit':         'Edit Leads',
  'leads.assign':       'Assign Leads',
  'workflows.view':     'View Runs',
  'workflows.trigger':  'Trigger Runs',
  'outreach.view':      'View Outreach',
  'outreach.draft':     'Draft Emails',
  'outreach.send':      'Send Emails',
  'analytics.view':     'View Analytics',
  'ai.chat':            'AI Assistant',
  'templates.manage':   'Manage Templates',
  'team.manage':        'Manage Team',
}
