/**
 * GridShield OS — Action Ranking and Formatting
 * Ranks mitigation actions using multi-objective scoring and formats for UI.
 */

import type { MitigationAction } from './actionGeneration'
import type { Violation } from './constraintDetection'
import type { SimulationState } from '../src/lib/simulation/types'
import { calculateCustomerImpact } from './customerImpact'

export interface RankedAction extends MitigationAction {
  score: number
  violationReductionScore: number // 0–1, fraction of violations resolved
  customerImpactScore: number // 0–1, fraction of customers affected
  confidenceScore: number // 0–1, 1 = high, 0.5 = medium, 0.2 = low
}

/**
 * Rank actions using composite scoring function.
 * Returns top 3 actions sorted by score (lower is better).
 */
export function rankActions(
  actions: MitigationAction[],
  violations: Violation[],
  state: SimulationState
): RankedAction[] {
  const totalViolationMW = violations.reduce(
    (sum, v) => sum + Math.max(v.estimatedMWShorfall, 10),
    0
  )

  const ranked = actions
    .filter(a => a.feasibility !== 'infeasible')
    .map(action => {
      // 1. Violation reduction score (0–1, higher = better)
      const violationScore = Math.min(
        1,
        action.estimatedViolationReduction / (totalViolationMW || 1)
      )

      // 2. Customer impact score (0–1, higher = worse for customer)
      let customerScore = 0
      if (action.type === 'load-shed' && action.nodeId) {
        const impact = calculateCustomerImpact(state.graph, action.nodeId)
        customerScore = impact.impactRatio
      } else if (action.type === 'battery-discharge') {
        customerScore = 0.1 // minimal customer impact
      } else if (action.type === 'reroute') {
        customerScore = 0.3 // moderate impact due to uncertainty
      }

      // 3. Confidence score (0–1, higher = better)
      const confidenceMap: Record<string, number> = { high: 0.9, medium: 0.5, low: 0.2 }
      const confidenceScore = confidenceMap[action.confidence] ?? 0.5

      // Composite score: lower is better
      // Weights: 50% violation reduction (inverted), 30% customer impact, 20% confidence (inverted)
      const score =
        50 * (1 - violationScore) + 30 * customerScore + 20 * (1 - confidenceScore)

      return {
        ...action,
        score,
        violationReductionScore: violationScore,
        customerImpactScore: customerScore,
        confidenceScore,
      }
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 3) // top 3

  return ranked
}

/**
 * Format ranked action for UI display.
 */
export function formatActionForUI(
  action: RankedAction
): {
  title: string
  impact: string
  confidence: string
  detail: string
} {
  const impactMW = Math.round(action.estimatedViolationReduction)
  const confidenceLabel = action.confidence.toUpperCase()

  return {
    title: action.description,
    impact: `~${impactMW} MW reduction`,
    confidence: confidenceLabel,
    detail: `Score: ${action.score.toFixed(1)} | Feasibility: ${action.feasibility}`,
  }
}
