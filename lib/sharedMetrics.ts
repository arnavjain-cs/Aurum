import type { SimulationState, GridNode, GridEdge } from '../src/lib/simulation/types'
import type { HealthMetrics } from '../components/HealthPanel'
import { TEXAS_NODES, TEXAS_EDGES } from '../src/lib/simulation/topology/texas-synthetic'

const EVENT_OVERLAY_RADIUS_KM = 30

function haversineDistKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Calculate health metrics from simulation state.
 * This is the single source of truth for metrics calculation.
 */
export function calculateHealthMetrics(state: SimulationState, affectedNodeId?: string | null): HealthMetrics {
  let criticalLineCount = 0
  
  const centerNode = affectedNodeId ? TEXAS_NODES.find(n => n.id === affectedNodeId) : null
  const nodeById = Object.fromEntries(TEXAS_NODES.map(n => [n.id, n] as [string, typeof n]))

  for (const [edgeId, edge] of state.graph.edges) {
    const util = state.utilizations.get(edgeId) ?? 0
    let isTripped = edge.state === 'tripped' || state.trippedEdges.has(edgeId)
    
    // If inside local blackout event radius, count as tripped/critical
    if (centerNode && !isTripped) {
      const src = nodeById[edge.sourceId]
      const tgt = nodeById[edge.targetId]
      if (src && tgt) {
        const isAffected = 
          haversineDistKm(centerNode.lat, centerNode.lng, src.lat, src.lng) <= EVENT_OVERLAY_RADIUS_KM ||
          haversineDistKm(centerNode.lat, centerNode.lng, tgt.lat, tgt.lng) <= EVENT_OVERLAY_RADIUS_KM
        
        if (isAffected) isTripped = true
      }
    }

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
