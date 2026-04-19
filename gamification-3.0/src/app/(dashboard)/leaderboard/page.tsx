import { getLeaderboardAction, getMyProfileAction } from '@/app/actions/gamification'
import { redirect } from 'next/navigation'
import { Trophy, Medal, Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const { success: authSuccess, data: profile } = await getMyProfileAction()

  if (!authSuccess || !profile) {
    redirect('/auth/login')
  }

  const { success, data: leaderboard } = await getLeaderboardAction()

  if (!success) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-bold uppercase tracking-widest">Failed to load leaderboard data.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex items-center gap-4 border-b border-white/10 pb-6">
        <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/30">
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase neon-text-purple">Hall of Fame</h1>
          <p className="text-zinc-500 font-mono text-sm mt-1">Global Rankings across all students.</p>
        </div>
      </header>

      <div className="cyber-card p-6 border-white/5 bg-black/40">
        <div className="space-y-3">
          {leaderboard?.map((student: any, index: number) => {
            const isTop3 = index < 3
            const isMe = student.id === profile.id

            return (
              <div 
                key={student.id} 
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isMe ? 'bg-cyan-900/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 
                  isTop3 ? 'bg-black/80 border-yellow-500/20 hover:border-yellow-500/50' : 
                  'bg-black/40 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-black text-lg ${
                    index === 0 ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' :
                    index === 1 ? 'bg-gray-400 text-black shadow-[0_0_15px_rgba(156,163,175,0.5)]' :
                    index === 2 ? 'bg-amber-700 text-white shadow-[0_0_15px_rgba(180,83,9,0.5)]' :
                    'bg-white/5 text-zinc-500 border border-white/10'
                  }`}>
                    #{index + 1}
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {student.full_name}
                      {isMe && <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded uppercase tracking-widest ml-2">You</span>}
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mt-1">
                      <span className="uppercase tracking-widest text-purple-400">{student.rank}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-6">
                  <div>
                    <p className="text-2xl font-black text-white">{student.xp}</p>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Total XP</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-bold text-cyan-400 flex items-center justify-end gap-1">
                      <Star className="w-3 h-3" /> {student.aura_points}
                    </p>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Aura</p>
                  </div>
                </div>
              </div>
            )
          })}

          {leaderboard?.length === 0 && (
            <div className="text-center p-10 text-zinc-500 uppercase tracking-widest font-bold">
              No students found in the system.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
