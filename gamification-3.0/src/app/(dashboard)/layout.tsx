import { Shield, LayoutDashboard, User, Trophy, ScrollText, Store, Settings } from 'lucide-react'
import Link from 'next/link'
import { LogoutButton } from '@/components/dashboard/LogoutButton'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = [
    { icon: LayoutDashboard, label: 'Home', href: '/dashboard' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
    { icon: Trophy, label: 'Leaderboard', href: '/dashboard/leaderboard' },
    { icon: ScrollText, label: 'Quests', href: '/dashboard/quests' },
    { icon: Store, label: 'Store', href: '/dashboard/store' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ]

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="flex h-full flex-col p-6">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <Shield size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">GAMIFY 3.0</span>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-zinc-500 transition-all hover:bg-white/5 hover:text-white"
              >
                <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                {item.label}
              </Link>
            ))}
          </nav>

          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  )
}
