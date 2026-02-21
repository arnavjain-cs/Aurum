'use client'

import { useState } from 'react'
import { Zap, Loader2 } from 'lucide-react'
import type { SimulationState } from '@/src/lib/simulation/types'
import { ALL_PRESETS } from '@/lib/eventPresets'
import { runEventSimulation, type EventHistory } from '@/lib/eventRunner'

export interface EventPanelProps {
  currentState: SimulationState
  onEventHistoryReady: (history: EventHistory) => void
  activePresetId?: string | null
}

export default function EventPanel({
  currentState,
  onEventHistoryReady,
  activePresetId,
}: EventPanelProps) {
  const [computing, setComputing] = useState(false)
  const [progress, setProgress] = useState<{ tick: number; total: number } | null>(null)

  const handleEventClick = async (presetId: string) => {
    if (computing) return

    const preset = ALL_PRESETS.find(p => p.id === presetId)
    if (!preset) return

    setComputing(true)
    setProgress({ tick: 0, total: 10 })

    try {
      // Trigger grid alert call
      fetch('http://localhost:8000/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Grid alert: ${preset.name} detected in regional grid`,
        }),
      }).catch(err => console.error('Alert call failed:', err))

      const states = await runEventSimulation(currentState, preset, (tick, total) => {
        setProgress({ tick, total })
      })

      onEventHistoryReady({
        presetId,
        presetName: preset.name,
        startTime: Date.now(),
        states,
        isComputing: false,
      })
    } finally {
      setComputing(false)
      setProgress(null)
    }
  }

  return (
    <div
      className="pointer-events-auto flex w-64 flex-col gap-4 rounded-xl border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur-sm"
      aria-label="Event simulation panel"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Zap size={14} className="text-white/60" />
        <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
          Simulate Event
        </span>
      </div>

      {/* Progress indicator */}
      {computing && progress && (
        <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
          <Loader2 size={14} className="animate-spin text-white/60" />
          <span className="font-mono text-xs text-white/60">
            Computing T+{progress.tick}/{progress.total}
          </span>
        </div>
      )}

      {/* Event preset buttons */}
      <div className="flex flex-col gap-2">
        {ALL_PRESETS.map(preset => {
          const isActive = activePresetId === preset.id
          return (
            <button
              key={preset.id}
              onClick={() => handleEventClick(preset.id)}
              disabled={computing}
              className={`group relative flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                isActive
                  ? 'border-white/30 bg-white/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className="text-base">{preset.icon}</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-white/90">
                  {preset.name}
                </span>
                <span className="text-xs text-white/40">
                  {preset.description}
                </span>
              </div>
              {isActive && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-2 w-2 rounded-full bg-white/60" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Progress bar */}
      {progress && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white/60 transition-all duration-200"
            style={{ width: `${(progress.tick / progress.total) * 100}%` }}
          />
        </div>
      )}

      {/* Hint text */}
      <p className="text-xs text-white/30">
        Select an event to simulate grid stress scenarios
      </p>
    </div>
  )
}
