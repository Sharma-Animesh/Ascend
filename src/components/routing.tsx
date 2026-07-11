import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { Loader } from './system/Loader'

/** Requires a signed-in, onboarded user. */
export function ProtectedRoute() {
  const { session, profile, loading } = useAuth()
  if (loading) return <Loader />
  if (!session) return <Navigate to="/login" replace />
  if (profile && !profile.onboarded) return <Navigate to="/awakening" replace />
  return <Outlet />
}

/** Requires a signed-in user who has NOT completed onboarding (the Awakening). */
export function OnboardingRoute() {
  const { session, profile, loading } = useAuth()
  if (loading) return <Loader />
  if (!session) return <Navigate to="/login" replace />
  if (profile?.onboarded) return <Navigate to="/app" replace />
  return <Outlet />
}

/** Public pages: bounce signed-in users into the app. */
export function PublicOnlyRoute() {
  const { session, profile, loading } = useAuth()
  if (loading) return <Loader />
  if (session) return <Navigate to={profile && !profile.onboarded ? '/awakening' : '/app'} replace />
  return <Outlet />
}

/** Admin-only subtree (inside ProtectedRoute). */
export function AdminRoute() {
  const { profile, loading } = useAuth()
  if (loading) return <Loader />
  if (profile?.role !== 'admin') return <Navigate to="/app" replace />
  return <Outlet />
}
