/**
 * GridShield OS — Top-Level Simulation Engine
 *
 * Orchestrates a full simulation step:
 *   1. Build seeded injection vector from current graph state
 *   2. Run DC power flow to get initial flows and utilizations
 *   3. Run cascade failure heuristic (may trip lines and re-solve)
 *   4. Assemble final SimulationState via updateStateWithFlows
 *   5. Measure and report step duration (warns if > 200ms budget)
 *
 * Entry points:
 *   simulateStep(state) — advance the simulation one step
 *   applyOverload(state, edgeId, factor) — artificially stress a line for testing
 */

import { SimulationState, GridGraph } from './types';
import { buildInjections, updateStateWithFlows } from './state';
import { runPowerFlow } from './solver';
import { runCascade } from './cascade';

// ---------------------------------------------------------------------------
// applyOverload
// ---------------------------------------------------------------------------

/**
 * Return a new SimulationState where the specified edge has its capacityMW
 * reduced to (original capacityMW / overloadFactor).
 *
 * This forces an artificial overload for testing: if overloadFactor = 20,
 * the edge now has 1/20th its original capacity, making it 20× more likely
 * to exceed 100% utilization for the same power flow.
 *
 * The power flow is re-run on the modified graph so that utilizations in the
 * returned state reflect the new (reduced) capacity correctly.
 *
 * @param state         Current simulation state
 * @param edgeId        Edge to artificially stress
 * @param overloadFactor  Divide capacityMW by this factor (e.g., 20 → 5% capacity)
 * @returns             New SimulationState with modified edge and updated flows
 */
export function applyOverload(
  state: SimulationState,
  edgeId: string,
  overloadFactor: number
): SimulationState {
  const edge = state.graph.edges.get(edgeId);
  if (!edge) {
    // Edge not found — return state unmodified
    return state;
  }

  const newCapacityMW = edge.capacityMW / overloadFactor;

  // Build new edges map with the modified edge
  const newEdges = new Map(state.graph.edges);
  newEdges.set(edgeId, { ...edge, capacityMW: newCapacityMW });

  // Build new GridGraph (same adjacency/edgeIndex — topology unchanged)
  const newGraph: GridGraph = {
    nodes: state.graph.nodes,
    edges: newEdges,
    adjacency: state.graph.adjacency,
    edgeIndex: state.graph.edgeIndex,
  };

  // Re-run power flow with same injections so utilizations reflect new capacity
  const injections = buildInjections(newGraph, state.seed);
  const { flows, utilizations } = runPowerFlow(newGraph, injections);

  return {
    ...state,
    graph: newGraph,
    flows,
    utilizations,
  };
}

// ---------------------------------------------------------------------------
// simulateStep
// ---------------------------------------------------------------------------

/**
 * Advance the simulation one step.
 *
 * Full pipeline:
 *   1. Build seeded injection vector: buildInjections(state.graph, state.seed)
 *   2. Run DC power flow: runPowerFlow(graph, injections)
 *   3. Run cascade: runCascade(graph, injections, utilizations, state.trippedEdges)
 *   4. Assemble new state: updateStateWithFlows with cascade graph, flows, utilizations
 *      plus the final trippedEdges set from the cascade result
 *   5. Record durationMs, warn if > 200ms
 *
 * The returned state includes the final cascade graph (with all newly tripped
 * edges reflected in edge states) and the accumulated trippedEdges set.
 *
 * @param state  Current SimulationState
 * @returns      New SimulationState after one simulation step
 */
export function simulateStep(state: SimulationState): SimulationState {
  const t0 = typeof performance !== 'undefined'
    ? performance.now()
    : Date.now();

  // 1. Build injection vector (seeded, deterministic)
  const injections = buildInjections(state.graph, state.seed);

  // 2. Run DC power flow for initial (pre-cascade) utilizations
  const { flows: initialFlows, utilizations: initialUtils } = runPowerFlow(
    state.graph,
    injections
  );

  // 3. Run cascade failure heuristic
  const cascadeResult = runCascade(
    state.graph,
    injections,
    initialUtils,
    state.trippedEdges
  );

  // 4. Assemble final state:
  //    - use cascade's finalGraph (has correctly-tripped edge states)
  //    - use cascade's final flows and utilizations
  //    - merge new trippedEdges into state
  const intermediateState: SimulationState = {
    ...state,
    graph: cascadeResult.finalGraph,
    trippedEdges: cascadeResult.trippedEdges,
  };

  const newState = updateStateWithFlows(
    intermediateState,
    cascadeResult.flows.size > 0 ? cascadeResult.flows : initialFlows,
    cascadeResult.utilizations.size > 0 ? cascadeResult.utilizations : initialUtils
  );

  // 5. Measure duration, warn if over budget
  const durationMs = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;

  if (durationMs > 200) {
    console.warn(
      `[SimEngine] Step took ${durationMs.toFixed(1)}ms — exceeded 200ms budget`
    );
  }

  return {
    ...newState,
    lastStepDurationMs: durationMs,
  };
}
