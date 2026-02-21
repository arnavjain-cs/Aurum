'use client'

import { useState } from 'react'
import HealthPanel, { type HealthMetrics } from '@/components/HealthPanel'

// Default health metrics — replaced by live values once Map initializes
const DEFAULT_METRICS: HealthMetrics = {
  totalLoadMW: 0,
  totalGenerationMW: 0,
  reserveMarginPct: 0,
  criticalLineCount: 0,
  blackoutProbabilityPct: 0,
}

interface PowerBalanceProps {
  onMetricsChange: (metrics: HealthMetrics) => void
}

/**
 * PowerBalance component - Displays power grid health metrics and balance
 * Team can modify metrics calculation, display format, and thresholds here
 */
export default function PowerBalance({ onMetricsChange }: PowerBalanceProps) {
  const [metrics, setMetrics] = useState<HealthMetrics>(DEFAULT_METRICS)

  const handleMetricsUpdate = (newMetrics: HealthMetrics) => {
    setMetrics(newMetrics)
    onMetricsChange(newMetrics)
  }

  // Expose metrics setter for external updates
  // This allows the parent to update metrics from map or simulation
  if (typeof window !== 'undefined') {
    ;(window as any).__updatePowerMetrics = handleMetricsUpdate
  }

  return (
    <div className="pointer-events-auto">
      <HealthPanel metrics={metrics} />
    </div>
  )
}
