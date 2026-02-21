'use client'

import { useEffect } from 'react'
import type { SimulationState } from '@/src/lib/simulation/types'
import HealthPanel, { type HealthMetrics } from '@/components/HealthPanel'
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics'

interface PowerBalanceProps {
  simulationState: SimulationState
  onMetricsChange: (metrics: HealthMetrics) => void
}

/**
 * PowerBalance — displays live power grid health metrics.
 *
 * Real-time behaviour:
 *  - Ticks every 2.5 s with realistic sinusoidal drift + gaussian noise so
 *    numbers visibly change like a real SCADA dashboard.
 *  - Immediately reflects simulated events (heat wave, generator outage, storm)
 *    the moment they are applied to simulationState.
 */
export default function PowerBalance({ simulationState, onMetricsChange }: PowerBalanceProps) {
  const liveMetrics = useRealtimeMetrics(simulationState)

  // Propagate live metrics up so parent/map can react
  useEffect(() => {
    onMetricsChange(liveMetrics)
  }, [liveMetrics, onMetricsChange])

  return (
    <div className="pointer-events-auto">
      <HealthPanel metrics={liveMetrics} />
    </div>
  )
}
