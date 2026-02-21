/**
 * GridShield OS — Shared Metrics Calculation
 * Centralized metrics computation to avoid duplication across components.
 */

import type { SimulationState } from '../src/lib/simulation/types'
import type { HealthMetrics } from '../components/HealthPanel'

/**
 * Calculate health metrics from simulation state.
 * This is the single source of truth for metrics calculation.
 */
export function calculateHealthMetrics(state: SimulationState): HealthMetrics {
  let criticalLineCount = 0
  
  for (const [edgeId, edge] of state.graph.edges) {
    const util = state.utilizations.get(edgeId) ?? 0
    const isTripped = edge.state === 'tripped' || state.trippedEdges.has(edgeId)
    if (isTripped || util > 0.9) {
      criticalLineCount++
    }
  }

  return {
    totalLoadMW: state.totalLoadMW,
    totalGenerationMW: state.totalGenerationMW,
    reserveMarginPct: state.reserveMarginPct,
    criticalLineCount,
    blackoutProbabilityPct: state.blackoutProbability * 100,
  }
}
