'use client'

import { useState } from 'react'
import { Lightbulb, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import type { SimulationState } from '@/src/lib/simulation/types'
import type { RankedAction } from '@/lib/actionRanking'
import { applyAction, type AppliedActionResult } from '@/lib/actionApplier'

export interface RecommendationsPanelProps {
  currentState: SimulationState
  recommendations: RankedAction[]
  onActionApplied: (result: AppliedActionResult) => void
}

export default function RecommendationsPanel({
  currentState,
  recommendations,
  onActionApplied,
}: RecommendationsPanelProps) {
  const [applying, setApplying] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<AppliedActionResult | null>(null)

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="pointer-events-auto flex w-64 flex-col gap-3 rounded-xl border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <Lightbulb size={14} className="text-white/60" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Recommendations
          </span>
        </div>
        <p className="text-xs text-white/40">No recommendations available</p>
      </div>
    )
  }

  const handleApply = async (action: RankedAction) => {
    setApplying(action.id)
    try {
      const result = applyAction(currentState, action)
      setLastResult(result)
      onActionApplied(result)
    } finally {
      setApplying(null)
    }
  }

  return (
    <div className="pointer-events-auto flex w-64 flex-col gap-3 rounded-xl border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <Lightbulb size={14} className="text-white/60" />
        <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
          Recommendations
        </span>
      </div>

      {/* Last result */}
      {lastResult && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
            lastResult.success
              ? 'border-green-500/30 bg-green-500/10'
              : 'border-amber-500/30 bg-amber-500/10'
          }`}
        >
          {lastResult.success ? (
            <CheckCircle2 size={14} className="text-green-400" />
          ) : (
            <AlertCircle size={14} className="text-amber-400" />
          )}
          <div className="flex flex-col">
            <span
              className={`font-medium ${
                lastResult.success ? 'text-green-300' : 'text-amber-300'
              }`}
            >
              {lastResult.success ? 'Success' : 'Limited Success'}
            </span>
            <span className="text-white/50">
              Violations: {lastResult.violationsBefore} → {lastResult.violationsAfter}
            </span>
          </div>
        </div>
      )}

      {/* Recommendations list */}
      <div className="flex flex-col gap-2">
        {recommendations.map((rec, idx) => {
          const isApplying = applying === rec.id
          const confidenceColor =
            rec.confidence === 'high'
              ? 'bg-green-500/20 text-green-300 border-green-500/30'
              : rec.confidence === 'medium'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-red-500/20 text-red-300 border-red-500/30'

          return (
            <div
              key={rec.id}
              className="flex flex-col gap-2 rounded-lg border border-white/5 bg-white/5 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-white/60">#{idx + 1}</span>
                    <span className="text-sm font-medium text-white/90">{rec.description}</span>
                  </div>
                  <div className="text-xs font-mono text-white/50">
                    ~{Math.round(rec.estimatedViolationReduction)} MW reduction
                  </div>
                </div>
                <div
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${confidenceColor}`}
                >
                  {rec.confidence}
                </div>
              </div>

              <button
                onClick={() => handleApply(rec)}
                disabled={isApplying || applying !== null}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  isApplying
                    ? 'border-white/10 bg-white/5 text-white/40 cursor-wait'
                    : 'border-white/20 bg-white/10 text-white/90 hover:bg-white/20'
                } disabled:cursor-not-allowed`}
              >
                {isApplying ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Applying...</span>
                  </>
                ) : (
                  <span>Apply</span>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Hint */}
      <p className="text-[10px] text-white/30">
        Recommendations update when event or timeline changes
      </p>
    </div>
  )
}
