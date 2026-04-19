'use client'

import { LogOut, Loader2 } from 'lucide-react'
import { signOutAction } from '@/app/actions/gamification'
import { useState } from 'react'

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await signOutAction()
  }

  return (
    <button 
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-zinc-500 transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
    >
      {isLoggingOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  )
}
