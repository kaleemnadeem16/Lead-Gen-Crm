import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppShell } from '@/components/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { TeamPage } from '@/pages/TeamPage'
import { RunsPage } from '@/pages/RunsPage'
import { RunDetailPage } from '@/pages/RunDetailPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="/runs"      element={<RunsPage />} />
          <Route path="/runs/:id"  element={<RunDetailPage />} />
          <Route path="/leads"     element={<PlaceholderPage />} />
          <Route path="/outreach"  element={<PlaceholderPage />} />
          <Route path="/analytics" element={<PlaceholderPage />} />
          <Route path="/ai"        element={<PlaceholderPage />} />
          <Route path="/team"      element={<TeamPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
