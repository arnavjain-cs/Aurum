'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Clock, Play, Pause, RotateCcw } from 'lucide-react'
import type { SimulationState } from '@/src/lib/simulation/types'
import type { EventHistory } from '@/lib/eventRunner'
import type { HealthMetrics } from './HealthPanel'
import { calculateHealthMetrics } from '@/lib/sharedMetrics'

export interface TimelinePanelProps {
  eventHistory: EventHistory
  onTimelineChange: (state: SimulationState, tick: number) => void
  onMetricsUpdate?: (metrics: HealthMetrics) => void
}

export default function TimelinePanel({
  eventHistory,
  onTimelineChange,
  onMetricsUpdate,
}: TimelinePanelProps) {
  const [activeTickIndex, setActiveTickIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(0)

  const updateTick = useCallback(
    (tick: number) => {
      setActiveTickIndex(tick)
      const state = eventHistory.states[tick]
      onTimelineChange(state, tick)
      if (onMetricsUpdate) {
        onMetricsUpdate(calculateHealthMetrics(state))
      }
    },
    [eventHistory, onTimelineChange, onMetricsUpdate]
  )

  useEffect(() => {
    updateTick(0)
  }, [eventHistory, updateTick])

  // Use requestAnimationFrame for smoother playback
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }

    lastUpdateRef.current = performance.now()
    
    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastUpdateRef.current
      
      // Update every 800ms
      if (elapsed >= 800) {
        lastUpdateRef.current = timestamp
        setActiveTickIndex(prev => {
          const next = prev + 1
          if (next > 10) {
            setIsPlaying(false)
            return prev
          }
          const state = eventHistory.states[next]
          onTimelineChange(state, next)
          if (onMetricsUpdate) {
            onMetricsUpdate(calculateHealthMetrics(state))
          }
          return next
        })
      }
      
      rafRef.current = requestAnimationFrame(animate)
    }
    
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [isPlaying, eventHistory, onTimelineChange, onMetricsUpdate])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tick = parseInt(e.target.value, 10)
    setIsPlaying(false)
    updateTick(tick)
  }

  const handlePlayPause = () => {
    if (activeTickIndex >= 10) {
      updateTick(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handleReset = () => {
    setIsPlaying(false)
    updateTick(0)
  }

  const currentState = eventHistory.states[activeTickIndex]
  const trippedCount = currentState.trippedEdges.size
  const avgUtil =
    currentState.utilizations.size > 0
      ? (
          Array.from(currentState.utilizations.values()).reduce((a, b) => a + b, 0) /
          currentState.utilizations.size
        ).toFixed(2)
      : '0.00'

  return (
    <div
      className="pointer-events-auto flex w-[480px] flex-col gap-3 rounded-xl border border-white/10 bg-black/95 p-4 shadow-2xl backdrop-blur-sm"
      aria-label="Timeline scrubber"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-white/60" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Timeline
          </span>
          <span className="ml-2 rounded bg-white/10 px-2 py-0.5 font-mono text-xs text-white/60">
            {eventHistory.presetName}
          </span>
        </div>
        <span className="font-mono text-sm font-bold tabular-nums text-white/90">
          T+{activeTickIndex} min
        </span>
      </div>

      {/* Controls and slider */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePlayPause}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          onClick={handleReset}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
          aria-label="Reset"
        >
          <RotateCcw size={14} />
        </button>

        <div className="relative flex-1">
          <input
            type="range"
            min={0}
            max={10}
            value={activeTickIndex}
            onChange={handleSliderChange}
            className="timeline-slider h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10"
          />
          <div className="mt-1 flex justify-between px-1 text-[10px] font-mono text-white/30">
            <span>T+0</span>
            <span>T+5</span>
            <span>T+10</span>
          </div>
        </div>
      </div>

      {/* Status display */}
      <div className="flex gap-4 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-white/40">Tripped</span>
          <span className="font-mono text-sm font-bold tabular-nums text-white/90">
            {trippedCount}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-white/40">Avg Util</span>
          <span className="font-mono text-sm font-bold tabular-nums text-white/90">{avgUtil}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-white/40">Blackout Risk</span>
          <span
            className={`font-mono text-sm font-bold tabular-nums ${
              currentState.blackoutProbability > 0.2
                ? 'text-red-400'
                : currentState.blackoutProbability > 0.08
                ? 'text-amber-400'
                : 'text-white/90'
            }`}
          >
            {(currentState.blackoutProbability * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Custom slider styles */}
      <style>{`
        .timeline-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.3);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .timeline-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.3);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  )
}
