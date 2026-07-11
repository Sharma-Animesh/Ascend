import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute, OnboardingRoute, ProtectedRoute, PublicOnlyRoute } from './components/routing'
import { AppLayout } from './components/layout/AppLayout'
import { Loader } from './components/system/Loader'

const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const Reset = lazy(() => import('./pages/auth/Reset'))
const Awakening = lazy(() => import('./pages/Awakening'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const QuestPlayer = lazy(() => import('./pages/QuestPlayer'))
const Stats = lazy(() => import('./pages/Stats'))
const Progress = lazy(() => import('./pages/Progress'))
const Exercises = lazy(() => import('./pages/Exercises'))
const ExerciseDetail = lazy(() => import('./pages/ExerciseDetail'))
const Nutrition = lazy(() => import('./pages/Nutrition'))
const Goals = lazy(() => import('./pages/Goals'))
const ProfilePage = lazy(() => import('./pages/Profile'))
const AdminHome = lazy(() => import('./pages/admin/AdminHome'))
const AdminExercises = lazy(() => import('./pages/admin/AdminExercises'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'))

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset" element={<Reset />} />
        </Route>

        <Route element={<OnboardingRoute />}>
          <Route path="/awakening" element={<Awakening />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="quests/:id" element={<QuestPlayer />} />
            <Route path="stats" element={<Stats />} />
            <Route path="progress" element={<Progress />} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="exercises/:id" element={<ExerciseDetail />} />
            <Route path="nutrition" element={<Nutrition />} />
            <Route path="goals" element={<Goals />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route element={<AdminRoute />}>
              <Route path="admin" element={<AdminHome />} />
              <Route path="admin/exercises" element={<AdminExercises />} />
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/announcements" element={<AdminAnnouncements />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
