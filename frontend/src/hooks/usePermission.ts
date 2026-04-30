import { useAuthStore } from '@/stores/authStore'

export function usePermission(permission: string): boolean {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  if (user.roles.includes('super_admin')) return true
  return user.permissions.includes(permission)
}

export function useRole(...roles: string[]): boolean {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  return roles.some((r) => user.roles.includes(r))
}

export function useIsAdmin(): boolean {
  return useRole('super_admin', 'admin')
}
