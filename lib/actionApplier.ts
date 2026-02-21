/**
 * GridShield OS — Action Application
 * Applies mitigation actions to simulation state and re-runs simulation.
 */

import type { SimulationState, GridGraph } from '../src/lib/simulation/types'
import type { RankedAction } from './actionRanking'
import { simulateStep } from '../src/lib/simulation/engine'

export interface AppliedActionResult {
  beforeState: SimulationState
  afterState: SimulationState
  action: RankedAction
  violationsBefore: number
  violationsAfter: number
  success: boolean
}

/**
 * Apply a mitigation action to the simulation state and re-simulate.
 * Returns before/after comparison with violation counts.
 */
export function applyAction(
  state: SimulationState,
  action: RankedAction
): AppliedActionResult {
  const beforeState = state

  // Create modified graph for action
  let modifiedGraph: GridGraph = state.graph

  if (action.type === 'load-shed' && action.nodeId) {
    // Reduce load capacity at target node (this will reduce injections in buildInjections)
    const node = state.graph.nodes.get(action.nodeId)
    if (node && node.type === 'load') {
      const newNodes = new Map(state.graph.nodes)
      // Reduce capacity by targetMW (but keep it positive)
      const newCapacity = Math.max(1, node.capacityMW - action.targetMW)
      newNodes.set(action.nodeId, {
        ...node,
        capacityMW: newCapacity,
      })
      modifiedGraph = {
        ...state.graph,
        nodes: newNodes,
      }
    }
  } else if (action.type === 'battery-discharge' && action.nodeId) {
    // For battery discharge, temporarily treat storage node as generator
    // This causes buildInjections to inject positive power
    const node = state.graph.nodes.get(action.nodeId)
    if (node && node.type === 'storage') {
      const newNodes = new Map(state.graph.nodes)
      // Temporarily convert to generator with discharge capacity
      newNodes.set(action.nodeId, {
        ...node,
        type: 'generator',
        capacityMW: action.targetMW,
      })
      modifiedGraph = {
        ...state.graph,
        nodes: newNodes,
      }
    }
  } else if (action.type === 'reroute') {
    // Re-routing: tripped edges already excluded, just re-simulate with current state
    modifiedGraph = state.graph
  }

  // Create modified state with new graph
  const modifiedState: SimulationState = {
    ...state,
    graph: modifiedGraph,
  }

  // Run one simulation step to propagate effects
  // simulateStep will use buildInjections with the modified graph
  const afterState = simulateStep(modifiedState)

  // Count violations (lines with utilization > 0.8)
  const countViolations = (s: SimulationState) => {
    let count = 0
    s.utilizations.forEach(util => {
      if (util > 0.8) count++
    })
    return count
  }

  const violationsBefore = countViolations(beforeState)
  const violationsAfter = countViolations(afterState)
  const success = violationsAfter < violationsBefore

  return {
    beforeState,
    afterState,
    action,
    violationsBefore,
    violationsAfter,
    success,
  }
}
