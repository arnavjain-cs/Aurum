/**
 * GridShield OS — Constraint Violation Detection
 * Identifies overloads, cascading risks, and reserve margin violations.
 */

import type { SimulationState } from '../src/lib/simulation/types'

export interface Violation {
  type: 'line-warning' | 'line-critical' | 'cascading-risk' | 'reserve-low'
  severity: number // 0–1 scale
  assetId: string // edge ID or 'system'
  estimatedMWShorfall: number // MW to reduce
}

/**
 * Detect constraint violations in the current grid state.
 * Returns array of violations with severity and MW shortfall estimates.
 */
export function detectViolations(state: SimulationState): Violation[] {
  const violations: Violation[] = []

  // V1/V2: Line utilization checks
  for (const [edgeId, util] of state.utilizations) {
    const edge = state.graph.edges.get(edgeId)
    if (!edge) continue

    if (util >= 1.0) {
      // V2: Line Critical (overload)
      violations.push({
        type: 'line-critical',
        severity: Math.min((util - 0.75) / 0.25, 1.0),
        assetId: edgeId,
        estimatedMWShorfall: (util - 1.0) * edge.capacityMW,
      })
    } else if (util >= 0.80) {
      // V1: Line Warning
      violations.push({
        type: 'line-warning',
        severity: (util - 0.75) / 0.25,
        assetId: edgeId,
        estimatedMWShorfall: (util - 0.75) * edge.capacityMW,
      })
    }
  }

  // V3: Cascading risk (adjacent to critical lines)
  const criticalEdges = new Set(
    [...state.utilizations.entries()]
      .filter(([_, u]) => u >= 1.0)
      .map(([id]) => id)
  )

  for (const [edgeId, util] of state.utilizations) {
    if (util < 0.75 || criticalEdges.has(edgeId)) continue

    const edge = state.graph.edges.get(edgeId)
    if (!edge) continue

    // Check if this edge is adjacent to any critical edge
    const sourceNeighbors = state.graph.edgeIndex.get(edge.sourceId) ?? []
    const targetNeighbors = state.graph.edgeIndex.get(edge.targetId) ?? []
    const adjacentEdges = [...sourceNeighbors, ...targetNeighbors]

    const hasCriticalNeighbor = adjacentEdges.some(adjEid => criticalEdges.has(adjEid))

    if (hasCriticalNeighbor) {
      violations.push({
        type: 'cascading-risk',
        severity: Math.max(0, (util - 0.75) / 0.25),
        assetId: edgeId,
        estimatedMWShorfall: 0, // monitoring only
      })
    }
  }

  // V4: Reserve margin warning
  const reserveMarginPct = state.reserveMarginPct
  if (reserveMarginPct < 15) {
    const peakLoad = calculatePeakLoad(state)
    violations.push({
      type: 'reserve-low',
      severity: Math.max(0, (15 - reserveMarginPct) / 15),
      assetId: 'system',
      estimatedMWShorfall: (15 - reserveMarginPct) / 100 * peakLoad,
    })
  }

  return violations
}

function calculatePeakLoad(state: SimulationState): number {
  let peakLoad = 0
  for (const node of state.graph.nodes.values()) {
    if (node.type === 'load') {
      // Estimate current load from capacity (using same diversity factor as buildInjections)
      const estimatedLoad = node.capacityMW * 0.45 // midpoint of [0.35, 0.55]
      peakLoad = Math.max(peakLoad, estimatedLoad)
    }
  }
  return peakLoad || state.totalLoadMW || 1000 // fallback
}
