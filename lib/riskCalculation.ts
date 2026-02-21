/**
 * GridShield OS — Risk Zone Calculation
 * Identifies geographic clusters of critical/warning lines for overlay rendering.
 */

import type { SimulationState } from '../src/lib/simulation/types'

export interface RiskZone {
  centerLat: number
  centerLng: number
  radiusKm: number
  riskLevel: 0 | 1 | 2 | 3
}

/**
 * Calculate risk zones from simulation state.
 * Groups critical edges (>80% utilization) geographically and returns zones.
 */
export function calculateRiskZones(state: SimulationState): RiskZone[] {
  const zones: RiskZone[] = []

  const criticalEdges = [...state.utilizations.entries()]
    .filter(([edgeId, util]) => util > 0.8 && !state.trippedEdges.has(edgeId))
    .map(([edgeId]) => edgeId)

  if (criticalEdges.length === 0) {
    return zones
  }

  const clustered = new Map<string, { edgeIds: string[]; lats: number[]; lngs: number[] }>()

  for (const edgeId of criticalEdges) {
    const edge = state.graph.edges.get(edgeId)
    if (!edge) continue

    const source = state.graph.nodes.get(edge.sourceId)
    const target = state.graph.nodes.get(edge.targetId)
    if (!source || !target) continue

    const midLat = (source.lat + target.lat) / 2
    const midLng = (source.lng + target.lng) / 2

    const clusterKey = `${Math.floor(midLat)}_${Math.floor(midLng)}`

    if (!clustered.has(clusterKey)) {
      clustered.set(clusterKey, { edgeIds: [], lats: [], lngs: [] })
    }

    const cluster = clustered.get(clusterKey)!
    cluster.edgeIds.push(edgeId)
    cluster.lats.push(midLat)
    cluster.lngs.push(midLng)
  }

  for (const [, cluster] of clustered) {
    const centerLat = cluster.lats.reduce((a, b) => a + b, 0) / cluster.lats.length
    const centerLng = cluster.lngs.reduce((a, b) => a + b, 0) / cluster.lngs.length

    const riskLevel: 0 | 1 | 2 | 3 =
      cluster.edgeIds.length > 5 ? 3 : cluster.edgeIds.length > 3 ? 2 : 1

    zones.push({
      centerLat,
      centerLng,
      radiusKm: 40 + cluster.edgeIds.length * 5,
      riskLevel,
    })
  }

  return zones
}
