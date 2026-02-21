'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState, useMemo } from 'react'
import { type HealthMetrics } from '@/components/HealthPanel'
import MapOverlay from '@/components/MapOverlay'
import PowerBalance from '@/components/PowerBalance'
import SimulateEvents from '@/components/SimulateEvents'
import type { EventHistory } from '@/lib/eventRunner'
import type { SimulationState } from '@/src/lib/simulation/types'
import { createInitialState } from '@/src/lib/simulation/state'
import { detectViolations } from '@/lib/constraintDetection'
import { generateActions } from '@/lib/actionGeneration'
import { rankActions } from '@/lib/actionRanking'
import { type AppliedActionResult } from '@/lib/actionApplier'

// Lazy import remaining panels for client-side only
const TimelinePanel = dynamic(() => import('@/components/TimelinePanel'), { ssr: false })
const RecommendationsPanel = dynamic(
  () => import('@/components/RecommendationsPanel'),
  { ssr: false }
)
const ProofModePanel = dynamic(() => import('@/components/ProofModePanel'), { ssr: false })

const SIMULATION_SEED = 1

export default function HomePage() {
  const [metrics, setMetrics] = useState<HealthMetrics>({
    totalLoadMW: 0,
    totalGenerationMW: 0,
    reserveMarginPct: 0,
    criticalLineCount: 0,
    blackoutProbabilityPct: 0,
  })
  const [eventHistory, setEventHistory] = useState<EventHistory | null>(null)
  const [currentTick, setCurrentTick] = useState(0)
  const [simulationState, setSimulationState] = useState<SimulationState>(() =>
    createInitialState(SIMULATION_SEED)
  )
  const [lastActionResult, setLastActionResult] = useState<AppliedActionResult | null>(null)

  // Generate recommendations when state changes
  const recommendations = useMemo(() => {
    if (!simulationState) return []
    
    const violations = detectViolations(simulationState)
    if (violations.length === 0) return []
    
    const actions = generateActions(simulationState, violations)
    const ranked = rankActions(actions, violations, simulationState)
    
    return ranked
  }, [simulationState])

  const handleEventHistoryReady = useCallback((history: EventHistory) => {
    setEventHistory(history)
    setCurrentTick(0)
  }, [])

  const handleTimelineChange = useCallback((state: SimulationState, tick: number) => {
    setCurrentTick(tick)
    setSimulationState(state)
  }, [])

  const handleActionApplied = useCallback(
    (result: AppliedActionResult) => {
      setLastActionResult(result)
      setSimulationState(result.afterState)
      if (eventHistory) {
        const newStates = [...eventHistory.states]
        newStates[currentTick] = result.afterState
        setEventHistory({
          ...eventHistory,
          states: newStates,
        })
      }
    },
    [eventHistory, currentTick]
  )

  return (
    <main className="relative h-full w-full overflow-hidden bg-black">
      {/* Full-screen map with overlay - MapOverlay component */}
      <MapOverlay
        eventHistory={eventHistory}
        currentTick={currentTick}
        onMetricsReady={setMetrics}
      />

      {/* Left HUD overlay — pointer-events-none wrapper so map stays interactive */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col gap-3">
        {/* PowerBalance component - Shows live grid health metrics */}
        <PowerBalance
          simulationState={simulationState}
          onMetricsChange={setMetrics}
        />

        {/* SimulateEvents component - Event simulation controls */}
        <SimulateEvents
          currentState={simulationState}
          onEventHistoryReady={handleEventHistoryReady}
          activePresetId={eventHistory?.presetId}
        />

        <ProofModePanel
          lastActionResult={lastActionResult}
          eventHistory={eventHistory}
        />
      </div>

      {/* Right HUD overlay — Recommendations */}
      <div className="pointer-events-none absolute right-4 top-4 z-10 flex flex-col gap-3">
        {recommendations.length > 0 && (
          <RecommendationsPanel
            key={eventHistory?.presetId ?? 'default'}
            currentState={simulationState}
            recommendations={recommendations}
            onActionApplied={handleActionApplied}
          />
        )}
      </div>

      {/* Timeline panel — bottom center */}
      {eventHistory && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
          <TimelinePanel
            eventHistory={eventHistory}
            onTimelineChange={handleTimelineChange}
            onMetricsUpdate={setMetrics}
          />
        </div>
      )}
    </main>
  )
}
