'use client'

import { useState, useEffect } from 'react'
import { Activity, Database, Users, ShieldAlert, Terminal, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function DevView({ profile }: { profile: any }) {
  const [systemStats, setSystemStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSystemState = async () => {
      try {
        const supabase = createClient()
        
        // Parallel queries to fetch entire system footprint
        const [
          { count: userCount, error: userError },
          { count: historyCount, error: historyError },
          { data: recentRolls, error: rollsError }
        ] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('dice_history').select('*', { count: 'exact', head: true }),
          supabase.from('dice_history').select('*, users(full_name)').order('created_at', { ascending: false }).limit(5)
        ])

        if (userError || historyError || rollsError) {
          throw new Error("Failed to load system diagnostics.")
        }

        setSystemStats({
          users: userCount || 0,
          events: historyCount || 0,
          recentRolls: recentRolls || []
        })

      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSystemState()
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 font-mono">
      <header className="flex items-end justify-between border-b border-red-500/20 pb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-red-500 uppercase flex items-center gap-3">
            <Terminal /> SysAdmin Override
          </h1>
          <p className="text-red-400/60 text-sm mt-1">Authorized ID: {profile.id}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-red-500 uppercase">Status</p>
          <p className="text-green-400 font-bold">ONLINE & SECURED</p>
        </div>
      </header>
      
      {isLoading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-red-500 w-10 h-10" /></div>
      ) : error ? (
        <div className="p-6 bg-red-950/50 border border-red-500 rounded-xl text-red-400 flex items-center gap-4">
          <ShieldAlert /> ACCESS VIOLATION: {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div className="cyber-card p-6 border-red-500/20 bg-black/60 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Database className="w-32 h-32 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-red-400 tracking-widest uppercase mb-6 flex items-center gap-2">
                <Activity size={20} /> System Metrics
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-white/5 rounded-lg bg-black/40">
                  <p className="text-xs text-zinc-500 uppercase">Registered Entities</p>
                  <p className="text-3xl font-black text-white">{systemStats.users}</p>
                </div>
                <div className="p-4 border border-white/5 rounded-lg bg-black/40">
                  <p className="text-xs text-zinc-500 uppercase">Total Logged Events</p>
                  <p className="text-3xl font-black text-white">{systemStats.events}</p>
                </div>
              </div>
            </div>
            
            <div className="cyber-card p-6 border-red-500/20 bg-black/60">
              <h2 className="text-sm font-bold text-red-400 tracking-widest uppercase mb-4 flex items-center gap-2">
                <ShieldAlert size={16} /> Security Settings
              </h2>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li className="flex justify-between items-center p-2 border border-white/5 rounded"><span className="uppercase">Row Level Security</span> <span className="text-green-400">ENABLED</span></li>
                <li className="flex justify-between items-center p-2 border border-white/5 rounded"><span className="uppercase">State Persistence</span> <span className="text-green-400">REDIS/SUPABASE</span></li>
                <li className="flex justify-between items-center p-2 border border-white/5 rounded"><span className="uppercase">Server Authority</span> <span className="text-green-400">ACTIVE</span></li>
              </ul>
            </div>
          </div>

          <div className="cyber-card p-6 border-red-500/20 bg-black/60">
            <h2 className="text-xl font-bold text-red-400 tracking-widest uppercase mb-4 flex items-center gap-2">
              <Users size={20} /> Event Stream
            </h2>
            <div className="space-y-2">
              {systemStats.recentRolls.length === 0 ? (
                <p className="text-zinc-500 text-sm italic">No recent events logged.</p>
              ) : (
                systemStats.recentRolls.map((roll: any) => (
                  <div key={roll.id} className="p-3 border border-white/5 rounded-lg bg-black/40 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-red-400 font-bold">{roll.users?.full_name}</span>
                      <span className="text-zinc-500">{new Date(roll.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-zinc-300">
                      Action: <span className="text-white font-bold">{roll.action_type}</span> | Value: <span className="text-cyan-400 font-bold">{roll.dice_result}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
