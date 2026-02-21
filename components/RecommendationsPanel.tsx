'use client'

import { useState } from 'react'
import { Lightbulb, Loader2, ChevronRight } from 'lucide-react'
import type { SimulationState } from '@/src/lib/simulation/types'
import type { RankedAction } from '@/lib/actionRanking'
import { applyAction, type AppliedActionResult } from '@/lib/actionApplier'

export interface RecommendationsPanelProps {
  currentState: SimulationState
  recommendations: RankedAction[]
  onActionApplied: (result: AppliedActionResult) => void
}

const DIFFICULTY_STYLES = {
  easy:   'bg-green-500/20 text-green-300 border-green-500/30',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  hard:   'bg-red-500/20 text-red-300 border-red-500/30',
}

const TYPE_LABELS: Record<string, string> = {
  'battery-discharge': 'Battery',
  'load-shed':         'Load Shed',
  'reroute':           'Reroute',
}

export default function RecommendationsPanel({
  currentState,
  recommendations,
  onActionApplied,
}: RecommendationsPanelProps) {
  // Freeze the queue at mount time — never update from props
  const [queue] = useState<RankedAction[]>(() => recommendations.slice(0, 5))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [applying, setApplying] = useState(false)

  const VISIBLE = 3
  const total = queue.length
  const visible = queue.slice(currentIdx, currentIdx + VISIBLE)
  const allDone = currentIdx >= total

  const handleApply = async (rec: RankedAction) => {
    if (applying) return
    setApplying(true)
    try {
      const result = applyAction(currentState, rec)
      onActionApplied(result)
      setCurrentIdx(i => i + 1)
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="pointer-events-auto flex w-72 flex-col gap-3 rounded-xl border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Lightbulb size={14} className="text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Recommendations
          </span>
        </div>
      </div>

      {allDone ? (
        <div className="flex flex-col items-center gap-2 py-3 text-center">
          <p className="text-xs font-medium text-white/60">All suggestions applied</p>
          <p className="text-[10px] text-white/30">Run a new event to get fresh recommendations</p>
        </div>
      ) : visible.length > 0 ? (
        <div className="flex flex-col gap-2">
          {visible.map((rec) => (
            <div
              key={rec.id}
              className="flex flex-col gap-2 rounded-lg border border-gray-500/50 bg-white/5 p-3"
            >
              {/* Badges + description */}
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${DIFFICULTY_STYLES[rec.difficulty]}`}
                >
                  {rec.difficulty}
                </span>
                <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/40">
                  {TYPE_LABELS[rec.type] ?? rec.type}
                </span>
              </div>

              <p className="text-sm font-medium leading-snug text-white/90">{rec.description}</p>

              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-mono text-white/40">
                  ~{Math.round(rec.estimatedViolationReduction)} MW reduction
                </p>
                <button
                  onClick={() => handleApply(rec)}
                  disabled={applying}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    applying
                      ? 'cursor-wait border-white/10 bg-white/5 text-white/40'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                  } disabled:cursor-not-allowed`}
                >
                  {applying ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <>
                      <span>Apply</span>
                      <ChevronRight size={11} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/40">No recommendations available</p>
      )}
    </div>
  )
}
