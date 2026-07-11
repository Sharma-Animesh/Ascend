import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Dumbbell,
  Flame,
  LayoutDashboard,
  LineChart,
  LogOut,
  Megaphone,
  Radar,
  ShieldCheck,
  Target,
  UserCircle2,
  Users,
  Utensils,
} from 'lucide-react'
import { useAuth } from '../../store/auth'
import { rankById } from '../../lib/game'
import { LogoMark, LogoWordmark } from '../system/Logo'
import { XPBar } from '../system/XPBar'
import { LevelUpModal } from '../system/LevelUpModal'

const NAV = [
  { to: '/app', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/app/exercises', label: 'Library', icon: Dumbbell, end: false },
  { to: '/app/stats', label: 'Stats', icon: Radar, end: false },
  { to: '/app/nutrition', label: 'Fuel', icon: Utensils, end: false },
  { to: '/app/profile', label: 'Profile', icon: UserCircle2, end: false },
]

const SECONDARY = [
  { to: '/app/goals', label: 'Goals', icon: Target },
  { to: '/app/progress', label: 'Progress', icon: LineChart },
]

const ADMIN = [
  { to: '/app/admin', label: 'Overview', icon: ShieldCheck, end: true },
  { to: '/app/admin/exercises', label: 'Exercises', icon: Dumbbell, end: false },
  { to: '/app/admin/users', label: 'Hunters', icon: Users, end: false },
  { to: '/app/admin/announcements', label: 'Broadcasts', icon: Megaphone, end: false },
]

function SideLink({ to, label, icon: Icon, end = false }: { to: string; label: string; icon: typeof Radar; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-md px-3.5 py-2.5 text-[0.8rem] font-semibold tracking-[0.14em] uppercase transition-all ${
          isActive
            ? 'glow-border bg-sky-500/10 text-sky-200'
            : 'text-mute hover:bg-abyss hover:text-ink'
        }`
      }
    >
      <Icon size={17} />
      {label}
    </NavLink>
  )
}

export function AppLayout() {
  const { profile, character, signOut } = useAuth()
  const navigate = useNavigate()
  const rank = character ? rankById(character.rank) : null
  const isAdmin = profile?.role === 'admin'

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="grid-bg relative min-h-dvh bg-void">
      {/* ambient glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(56% 38% at 50% -6%, rgba(56,189,248,0.13), transparent 65%), radial-gradient(40% 30% at 88% 104%, rgba(139,92,246,0.1), transparent 60%)',
        }}
      />

      {/* ---------- Desktop sidebar ---------- */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line/60 bg-abyss/70 backdrop-blur-xl lg:flex">
        <div className="px-5 pt-6 pb-4">
          <LogoWordmark size={24} />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV.map((n) => (
            <SideLink key={n.to} {...n} />
          ))}
          <div className="pt-3 pb-1 pl-3 text-[0.6rem] font-bold tracking-[0.3em] text-mute/60 uppercase">Tracking</div>
          {SECONDARY.map((n) => (
            <SideLink key={n.to} {...n} />
          ))}
          {isAdmin && (
            <>
              <div className="pt-3 pb-1 pl-3 text-[0.6rem] font-bold tracking-[0.3em] text-gold/70 uppercase">System Admin</div>
              {ADMIN.map((n) => (
                <SideLink key={n.to} {...n} />
              ))}
            </>
          )}
        </nav>
        {character && (
          <div className="border-t border-line/60 p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="truncate text-sm font-bold text-ink">{profile?.display_name ?? 'Hunter'}</span>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="rounded p-1.5 text-mute transition hover:bg-abyss hover:text-red-300"
              >
                <LogOut size={15} />
              </button>
            </div>
            <div className="mb-2 flex items-center gap-2 text-[0.68rem] font-bold tracking-[0.2em] uppercase">
              <span style={{ color: rank?.color }}>{rank?.label}</span>
              <span className="text-mute">·</span>
              <span className="flex items-center gap-1 text-orange-300">
                <Flame size={12} /> {character.streak}
              </span>
            </div>
            <XPBar xp={character.xp} compact />
          </div>
        )}
      </aside>

      {/* ---------- Mobile top bar ---------- */}
      <header className="pt-safe sticky top-0 z-40 border-b border-line/60 bg-void/80 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between px-4 py-2.5">
          <LogoMark size={30} />
          {character && (
            <div className="flex items-center gap-3">
              <span
                className="rounded-full border px-2.5 py-0.5 font-display text-[0.62rem] font-bold tracking-[0.2em]"
                style={{ borderColor: `${rank?.color}66`, color: rank?.color }}
              >
                {rank?.label}
              </span>
              <span className="font-display text-[0.7rem] font-bold tracking-[0.15em] text-glow-soft">
                LV.{character.level}
              </span>
              <span className="flex items-center gap-1 text-[0.72rem] font-bold text-orange-300">
                <Flame size={13} />
                {character.streak}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ---------- Content ---------- */}
      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-4 pb-28 sm:px-6 lg:ml-64 lg:max-w-none lg:px-10 lg:pt-8 lg:pb-12 xl:max-w-6xl">
        <Outlet />
      </main>

      {/* ---------- Mobile bottom nav ---------- */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line/60 bg-abyss/85 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.58rem] font-bold tracking-[0.12em] uppercase transition-colors ${
                  isActive ? 'text-sky-300' : 'text-mute'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.8))' } : undefined} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <LevelUpModal />
    </div>
  )
}
