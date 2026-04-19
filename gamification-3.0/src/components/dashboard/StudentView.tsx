'use client'

import { motion } from 'framer-motion'
import { RANK_THRESHOLDS } from '@/lib/validations'
import { Shield, Zap, Sparkles, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StudentView({ profile }: { profile: any }) {
  // Calculate progress
  const currentRankObj = RANK_THRESHOLDS.find(r => r.rank === profile.rank) || RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1]
  const currentIndex = RANK_THRESHOLDS.findIndex(r => r.rank === currentRankObj.rank)
  const nextRankObj = currentIndex > 0 ? RANK_THRESHOLDS[currentIndex - 1] : null

  const baseXP = currentRankObj.xp
  const targetXP = nextRankObj ? nextRankObj.xp : baseXP
  const progressPercent = nextRankObj 
    ? Math.min(100, Math.max(0, ((profile.xp - baseXP) / (targetXP - baseXP)) * 100))
    : 100

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            OPERATIVE: <span className="text-cyan-400 [text-shadow:0_0_15px_rgba(6,182,212,0.5)]">{profile.full_name}</span>
          </h1>
          <p className="text-zinc-500 font-mono text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Neural Link Active
          </p>
        </div>
      </motion.header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* RANK CARD */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="cyber-card md:col-span-2 p-8 flex flex-col justify-between neon-border-purple"
        >
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="text-purple-400 h-6 w-6" />
                <h2 className="text-xl font-bold text-zinc-400 tracking-widest uppercase">Current Rank</h2>
              </div>
              <p className="text-5xl font-black text-white [text-shadow:0_0_20px_rgba(139,92,246,0.5)] uppercase tracking-tighter">
                {profile.rank}
              </p>
            </div>
            
            <div className="text-right">
              <h2 className="text-sm font-bold text-zinc-500 tracking-widest uppercase mb-1">Total Experience</h2>
              <p className="text-3xl font-mono text-white flex items-center justify-end gap-1">
                {profile.xp} <span className="text-purple-500 text-lg">XP</span>
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-zinc-400 mb-2">
              <span>{baseXP} XP</span>
              <span className="text-white font-bold">{nextRankObj ? `NEXT: ${nextRankObj.rank}` : 'MAX LEVEL'}</span>
              <span>{nextRankObj ? `${targetXP} XP` : 'MAX'}</span>
            </div>
            <div className="cyber-progress h-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                className="cyber-progress-fill" 
              />
            </div>
          </div>
        </motion.div>

        {/* AURA CARD */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="cyber-card p-8 flex flex-col items-center justify-center text-center neon-border-cyan relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <Sparkles className="w-12 h-12 text-cyan-400 mb-4 [filter:drop-shadow(0_0_10px_rgba(6,182,212,0.8))]" />
          
          <h2 className="text-sm font-bold text-zinc-400 tracking-widest uppercase mb-2">Aura Points</h2>
          <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-cyan-600 [filter:drop-shadow(0_0_20px_rgba(6,182,212,0.3))]">
            {profile.aura_points}
          </p>
          <p className="text-xs text-zinc-500 font-mono mt-4">Multiplier: x0.3</p>
        </motion.div>
      </div>

      {/* History Feed Shell (We'll populate this later) */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="cyber-card p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-5 w-5 text-zinc-400" />
          <h2 className="text-lg font-bold text-white tracking-widest uppercase">Combat Log</h2>
        </div>
        
        <div className="border border-white/5 rounded-xl bg-black/20 p-8 text-center text-zinc-500 font-mono">
          Fetching recent evaluation history...
        </div>
      </motion.div>
    </div>
  )
}
