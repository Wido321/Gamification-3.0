import { getMyProfileAction, getMyResponsesAction } from '@/app/actions/gamification'
import { redirect } from 'next/navigation'
import { User, Activity, History } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const { success: authSuccess, data: profile } = await getMyProfileAction()

  if (!authSuccess || !profile) {
    redirect('/auth/login')
  }

  const { success: historySuccess, data: history } = await getMyResponsesAction()

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex items-center gap-4 border-b border-white/10 pb-6">
        <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/30">
          <User className="w-8 h-8 text-purple-500" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase neon-text-purple">Operative Profile</h1>
          <p className="text-zinc-500 font-mono text-sm mt-1">ID: {profile.id}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cyber-card p-6 border-white/5 bg-black/40 text-center space-y-2">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-4">Current Rank</p>
          <div className="text-4xl font-black text-white capitalize neon-text-cyan">{profile.rank}</div>
        </div>
        <div className="cyber-card p-6 border-white/5 bg-black/40 text-center space-y-2">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-4">Total Experience</p>
          <div className="text-4xl font-black text-purple-400">{profile.xp} <span className="text-lg text-zinc-500">XP</span></div>
        </div>
        <div className="cyber-card p-6 border-white/5 bg-black/40 text-center space-y-2">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-4">Aura Power</p>
          <div className="text-4xl font-black text-yellow-500">{profile.aura_points}</div>
        </div>
      </div>

      <div className="cyber-card p-6 border-white/5 bg-black/40 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-widest uppercase">
          <History className="text-cyan-400" /> Action Log
        </h2>

        {!historySuccess || history?.length === 0 ? (
          <p className="text-zinc-500 text-sm font-mono text-center p-8 bg-black/50 rounded-xl border border-white/5">No activity recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((record: any) => (
              <div key={record.id} className="p-4 rounded-xl border border-white/5 bg-black/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all">
                <div>
                  <div className="flex gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{record.difficulty}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                      record.result === 'excellent' ? 'bg-purple-900/50 text-purple-400' :
                      record.result === 'correct' ? 'bg-green-900/50 text-green-400' :
                      record.result === 'partial' ? 'bg-yellow-900/50 text-yellow-500' :
                      'bg-red-900/50 text-red-500'
                    }`}>
                      {record.result}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-2">{new Date(record.created_at).toLocaleString()}</p>
                </div>
                
                <div className="text-right flex items-center gap-6">
                  <div>
                    <p className="text-xl font-black text-white">+{record.xp_awarded}</p>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">XP</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-yellow-500">+{record.aura_awarded}</p>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Aura</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
