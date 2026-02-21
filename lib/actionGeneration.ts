/**
 * GridShield OS — Action Candidate Generation
 * Generates feasible mitigation actions (load shedding, battery discharge, re-routing).
 */

import type { SimulationState } from '../src/lib/simulation/types'
import type { Violation } from './constraintDetection'

export interface MitigationAction {
  id: string
  type: 'load-shed' | 'battery-discharge' | 'reroute'
  nodeId?: string // for load-shed and battery
  targetMW: number
  estimatedViolationReduction: number // MW of violations removed
  feasibility: 'feasible' | 'limited' | 'infeasible'
  confidence: 'high' | 'medium' | 'low'
  description: string
}

/**
 * Generate candidate mitigation actions based on violations and available resources.
 */
export function generateActions(
  state: SimulationState,
  violations: Violation[]
): MitigationAction[] {
  const actions: MitigationAction[] = []

  if (violations.length === 0) return actions

  // 1. Load shedding actions
  // For each load node, generate options to shed 5%, 10%, 20%
  const loadNodes = [...state.graph.nodes.values()].filter(n => n.type === 'load')

  loadNodes.forEach(node => {
    // Estimate current load (using diversity factor from buildInjections)
    const estimatedLoad = node.capacityMW * 0.45 // midpoint of [0.35, 0.55]
    if (estimatedLoad < 5) return // skip tiny loads

    ;[0.05, 0.1, 0.2].forEach(fraction => {
      const shedMW = estimatedLoad * fraction
      actions.push({
        id: `load-shed-${node.id}-${Math.round(fraction * 100)}pct`,
        type: 'load-shed',
        nodeId: node.id,
        targetMW: shedMW,
        estimatedViolationReduction: shedMW * 0.7, // rough estimate
        feasibility: shedMW <= estimatedLoad ? 'feasible' : 'infeasible',
        confidence: 'medium',
        description: `Shed ${shedMW.toFixed(0)} MW from ${node.name}`,
      })
    })
  })

  // 2. Battery discharge actions
  // Assume 100 MW capacity per storage node; generate 10%, 20%, 30% discharge options
  const batteryNodes = [...state.graph.nodes.values()].filter(n => n.type === 'storage')

  batteryNodes.forEach(node => {
    const capacity = Math.min(node.capacityMW, 100) // MW discharge capacity
    ;[0.1, 0.2, 0.3].forEach(fraction => {
      const dischargeMW = capacity * fraction
      actions.push({
        id: `battery-discharge-${node.id}-${Math.round(fraction * 100)}pct`,
        type: 'battery-discharge',
        nodeId: node.id,
        targetMW: dischargeMW,
        estimatedViolationReduction: dischargeMW * 0.6,
        feasibility: dischargeMW <= capacity ? 'feasible' : 'infeasible',
        confidence: 'high',
        description: `Discharge ${dischargeMW.toFixed(0)} MW from storage at ${node.name}`,
      })
    })
  })

  // 3. Re-routing action (generic)
  // Treat tripped edges as unavailable and let power flow re-solve
  if (state.trippedEdges.size > 0) {
    const totalViolationMW = violations.reduce(
      (sum, v) => sum + Math.max(v.estimatedMWShorfall, 10),
      0
    )
    actions.push({
      id: 'reroute-topology',
      type: 'reroute',
      targetMW: 0, // topology change, not MW-based
      estimatedViolationReduction: totalViolationMW * 0.3,
      feasibility: 'feasible',
      confidence: 'low', // re-routing is unpredictable
      description: `Re-route power around ${state.trippedEdges.size} failed line${state.trippedEdges.size > 1 ? 's' : ''}`,
    })
  }

  return actions
}
