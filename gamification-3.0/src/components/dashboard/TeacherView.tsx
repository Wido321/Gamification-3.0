'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dice3D } from './Dice3D'
import { getStudentsAction, awardXPAction, recordDiceRollAction } from '@/app/actions/teacher'
import { Shield, Target, Award, Users, Loader2 } from 'lucide-react'
import type { DifficultyLevel, PerformanceResult } from '@/types/database'

type Student = {
  id: string; full_name: string; xp: number; aura_points: number;
  rank: string; selection_weight: number; role: string
}

export function TeacherView({ profile }: { profile: any }) {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRolling, setIsRolling] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  
  // Evaluation form state
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('normal')
  const [result, setResult] = useState<PerformanceResult>('correct')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchStudents = useCallback(async () => {
    setIsLoading(true)
    const { success, data } = await getStudentsAction()
    if (success && data) setStudents(data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const totalWeight = students.reduce((sum, s) => sum + s.selection_weight, 0)

  const handleRollDice = async () => {
    if (students.length === 0 || isRolling) return

    setIsRolling(true)
    setSelectedStudent(null)

    // Simulate 3 seconds of rolling
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Weighted random selection algorithm
    let random = Math.random() * totalWeight
    let chosen: Student | null = null
    
    for (const student of students) {
      if (random < student.selection_weight) {
        chosen = student
        break
      }
      random -= student.selection_weight
    }

    // Fallback if floating point weirdness
    if (!chosen) chosen = students[students.length - 1]

    setSelectedStudent(chosen)
    setIsRolling(false)

    // Log the roll (server action)
    await recordDiceRollAction({
      student_id: chosen.id,
      dice_result: Math.floor(Math.random() * 20) + 1, // Visual only
      action_type: 'oral_exam_selection'
    })
  }

  const handleAwardXP = async () => {
    if (!selectedStudent || isSubmitting) return
    setIsSubmitting(true)

    const res = await awardXPAction({
      student_id: selectedStudent.id,
      difficulty,
      result
    })

    if (res.success) {
      // Re-fetch students to get updated weights and XP
      await fetchStudents()
      setSelectedStudent(null)
    } else {
      alert("Error: " + res.error)
    }

    setIsSubmitting(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white neon-text-purple uppercase">
            Control Center
          </h1>
          <p className="text-zinc-500 font-mono text-sm mt-1">Authorized: {profile.full_name} [{profile.role}]</p>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFTSIDE: Roster */}
        <div className="lg:col-span-2 space-y-4">
          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="text-purple-400" />
                <h2 className="text-xl font-bold text-white tracking-widest uppercase">Active Roster</h2>
              </div>
              <p className="text-xs text-zinc-500 font-mono">Total Weight: {totalWeight.toFixed(2)}</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-500" /></div>
            ) : (
              <div className="space-y-2">
                {students.map((student) => {
                  const chance = ((student.selection_weight / totalWeight) * 100).toFixed(1)
                  const isTarget = selectedStudent?.id === student.id

                  return (
                    <div 
                      key={student.id} 
                      onClick={() => setSelectedStudent(student)}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        isTarget 
                        ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                        : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-white text-lg">{student.full_name}</p>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">{student.rank} • {student.xp} XP</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-cyan-400 font-bold">{chance}%</p>
                        <p className="text-[10px] text-zinc-600 uppercase">Select Chance</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHTSIDE: 3D Dice & Eval */}
        <div className="space-y-6">
          <div className="cyber-card p-6 neon-border-cyan flex flex-col items-center">
            <h2 className="text-sm font-bold text-cyan-400 tracking-widest uppercase mb-4 w-full text-center">Selection Algorithm</h2>
            <Dice3D isRolling={isRolling} />
            
            <button 
              onClick={handleRollDice} 
              disabled={isRolling || students.length === 0}
              className="mt-6 w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95"
            >
              {isRolling ? 'CALCULATING...' : 'ROLL THE DICE'}
            </button>
          </div>

          <AnimatePresence>
            {selectedStudent && !isRolling && (
              <motion.div 
                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                className="cyber-card p-6 neon-border-purple overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                  <Target className="text-purple-400" />
                  <div>
                    <h2 className="text-sm font-bold text-zinc-400 tracking-widest uppercase">Target Acquired</h2>
                    <p className="text-xl font-black text-white">{selectedStudent.full_name}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase font-bold mb-2 block">Difficulty</label>
                    <div className="flex gap-2">
                      {(['easy', 'normal', 'hard'] as const).map(d => (
                        <button 
                          key={d} 
                          onClick={() => setDifficulty(d)}
                          className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                            difficulty === d ? 'border-purple-500 bg-purple-500/20 text-purple-300' : 'border-white/10 text-zinc-500 hover:bg-white/5'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 uppercase font-bold mb-2 block">Result</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['wrong', 'partial', 'correct', 'excellent'] as const).map(r => (
                        <button 
                          key={r} 
                          onClick={() => setResult(r)}
                          className={`py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                            result === r ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300' : 'border-white/10 text-zinc-500 hover:bg-white/5'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleAwardXP}
                    disabled={isSubmitting}
                    className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Award className="w-5 h-5" />}
                    Confirm Evaluation
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
