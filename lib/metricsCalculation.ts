/**
 * GridShield OS — Metrics Calculation for Proof Mode
 * Computes grid metrics for before/after comparison.
 */

import type { SimulationState } from '../src/lib/simulation/types'

export interface GridMetrics {
  totalLoad: number // MW
  totalGeneration: number // MW
  reserveMargin: number // % (0–100)
  criticalLineCount: number // count of lines with util > 0.9 or tripped
  blackoutProbability: number // % (0–100)
}

/**
 * Calculate key metrics from simulation state for proof-mode display.
 */
export function calculateMetrics(state: SimulationState): GridMetrics {
  const totalLoad = state.totalLoadMW ?? 0
  const totalGeneration = state.totalGenerationMW ?? 0
  const reserveMargin = state.reserveMarginPct ?? 0

  let criticalLineCount = 0
  for (const [edgeId, edge] of state.graph.edges) {
    const util = state.utilizations.get(edgeId) ?? 0
    const isTripped = edge.state === 'tripped' || state.trippedEdges.has(edgeId)
    if (isTripped || util > 0.9) {
      criticalLineCount++
    }
  }

  const blackoutProbability = (state.blackoutProbability ?? 0) * 100

  return {
    totalLoad: Math.round(totalLoad),
    totalGeneration: Math.round(totalGeneration),
    reserveMargin: Math.round(reserveMargin * 10) / 10,
    criticalLineCount,
    blackoutProbability: Math.round(blackoutProbability * 10) / 10,
  }
}

/**
 * Compare before and after metrics to determine improvement.
 */
export function metricsImproved(
  before: GridMetrics,
  after: GridMetrics
): {
  reserveMargin: boolean
  criticalLines: boolean
  blackoutProb: boolean
  overallImproved: boolean
} {
  const reserveMarginImproved = after.reserveMargin > before.reserveMargin
  const criticalLinesImproved = after.criticalLineCount < before.criticalLineCount
  const blackoutProbImproved = after.blackoutProbability < before.blackoutProbability

  return {
    reserveMargin: reserveMarginImproved,
    criticalLines: criticalLinesImproved,
    blackoutProb: blackoutProbImproved,
    overallImproved: criticalLinesImproved && blackoutProbImproved,
  }
}
