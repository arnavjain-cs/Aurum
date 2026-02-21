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
  difficulty: 'easy' | 'medium' | 'hard'
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

  const fractionMeta: Array<{ fraction: number; difficulty: 'easy' | 'medium' | 'hard'; label: string }> = [
    { fraction: 0.05, difficulty: 'easy',   label: 'Minor curtailment' },
    { fraction: 0.10, difficulty: 'medium', label: 'Moderate reduction' },
    { fraction: 0.20, difficulty: 'hard',   label: 'Emergency shed' },
  ]

  loadNodes.forEach(node => {
    const estimatedLoad = node.capacityMW * 0.45
    if (estimatedLoad < 5) return

    fractionMeta.forEach(({ fraction, difficulty, label }) => {
      const shedMW = estimatedLoad * fraction
      actions.push({
        id: `load-shed-${node.id}-${Math.round(fraction * 100)}pct`,
        type: 'load-shed',
        nodeId: node.id,
        targetMW: shedMW,
        estimatedViolationReduction: shedMW * 0.7,
        feasibility: shedMW <= estimatedLoad ? 'feasible' : 'infeasible',
        confidence: 'medium',
        difficulty,
        description: `${label} at ${node.name} — shed ${shedMW.toFixed(0)} MW`,
      })
    })
  })

  // 2. Battery discharge actions
  // Assume 100 MW capacity per storage node; generate 10%, 20%, 30% discharge options
  const batteryNodes = [...state.graph.nodes.values()].filter(n => n.type === 'storage')

  batteryNodes.forEach(node => {
    const capacity = Math.min(node.capacityMW, 100)
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
        difficulty: 'easy',
        description: `Dispatch ${dischargeMW.toFixed(0)} MW from battery reserves at ${node.name}`,
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
      targetMW: 0,
      estimatedViolationReduction: totalViolationMW * 0.3,
      feasibility: 'feasible',
      confidence: 'low',
      difficulty: 'hard',
      description: `Isolate ${state.trippedEdges.size} failed line${state.trippedEdges.size > 1 ? 's' : ''} and reroute flow via alternate paths`,
    })
  }

  return actions
}
