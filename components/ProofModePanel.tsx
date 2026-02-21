'use client'

import { useState } from 'react'
import { Camera, X, LayoutGrid, Play } from 'lucide-react'
import type { AppliedActionResult } from '@/lib/actionApplier'
import type { EventHistory } from '@/lib/eventRunner'
import SplitMapView from './SplitMapView'
import ReplayAnimation from './ReplayAnimation'

export interface ProofModePanelProps {
  lastActionResult: AppliedActionResult | null
  eventHistory?: EventHistory | null
}

export default function ProofModePanel({
  lastActionResult,
  eventHistory,
}: ProofModePanelProps) {
  const [showProofMode, setShowProofMode] = useState(false)
  const [view, setView] = useState<'split' | 'replay'>('split')

  if (!lastActionResult) {
    return (
      <div className="pointer-events-auto flex w-64 flex-col gap-2 rounded-xl border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <Camera size={14} className="text-white/60" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Proof Mode
          </span>
        </div>
        <p className="text-xs text-white/40">Apply a recommendation to view before/after proof</p>
      </div>
    )
  }

  if (showProofMode) {
    const canReplay = eventHistory && eventHistory.states.length > 0
    return (
      <div className="pointer-events-auto fixed inset-0 z-50 flex flex-col bg-black">
        <div className="flex items-center justify-between border-b border-white/10 bg-black/95 px-4 py-2">
          <h3 className="text-sm font-semibold text-white/90">
            Proof Mode: Before / After
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
              <button
                onClick={() => setView('split')}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs ${
                  view === 'split' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white/80'
                }`}
              >
                <LayoutGrid size={12} />
                Split
              </button>
              {canReplay && (
                <button
                  onClick={() => setView('replay')}
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs ${
                    view === 'replay' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  <Play size={12} />
                  Replay
                </button>
              )}
            </div>
            <button
              onClick={() => setShowProofMode(false)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10"
              aria-label="Close proof mode"
            >
              <X size={14} />
              <span>Close</span>
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          {view === 'split' ? (
            <SplitMapView
              beforeState={lastActionResult.beforeState}
              afterState={lastActionResult.afterState}
            />
          ) : canReplay ? (
            <ReplayAnimation
              eventHistory={eventHistory}
              beforeState={lastActionResult.beforeState}
              afterState={lastActionResult.afterState}
            />
          ) : (
            <SplitMapView
              beforeState={lastActionResult.beforeState}
              afterState={lastActionResult.afterState}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-auto flex w-64 flex-col gap-3 rounded-xl border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <Camera size={14} className="text-white/60" />
        <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
          Proof Mode
        </span>
      </div>
      <button
        onClick={() => setShowProofMode(true)}
        className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/20"
      >
        View Before/After Proof
      </button>
      <p className="text-[10px] text-white/40">
        Side-by-side view: crisis state vs. after mitigation
      </p>
    </div>
  )
}
