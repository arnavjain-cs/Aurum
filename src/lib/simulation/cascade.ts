/**
 * GridShield OS — Cascading Failure Heuristic
 *
 * Implements overload detection, line tripping, and the cascade loop that
 * re-solves DC power flow after each wave of trips until the system is stable
 * or the maximum iteration cap is hit.
 *
 * Algorithm: batch-trip all currently overloaded lines per iteration (not
 * one-at-a-time) for both speed and physical realism. Sort overloaded lines
 * by utilization descending for deterministic trip order.
 *
 * Safety: maxIterations (default 20) caps the loop to prevent infinite cycles.
 * In practice real cascades resolve in 3–5 waves.
 */

import { GridGraph, GridNode } from './types';
import { runPowerFlow } from './solver';
import { createGraph } from './graph';

// ---------------------------------------------------------------------------
// detectOverloads
// ---------------------------------------------------------------------------

/**
 * Return edgeIds where utilization > 1.0 that are NOT already in trippedEdges.
 * Result is sorted by utilization descending for deterministic trip ordering.
 *
 * @param utilizations  Map<edgeId, utilization> from runPowerFlow
 * @param trippedEdges  Set of edgeIds already tripped (excluded from result)
 * @returns             Array of overloaded edgeIds, most-stressed first
 */
export function detectOverloads(
  utilizations: Map<string, number>,
  trippedEdges: Set<string>
): string[] {
  const overloaded: Array<{ id: string; util: number }> = [];

  for (const [edgeId, util] of utilizations) {
    if (util > 1.0 && !trippedEdges.has(edgeId)) {
      overloaded.push({ id: edgeId, util });
    }
  }

  // Sort descending by utilization for deterministic cascade path
  overloaded.sort((a, b) => b.util - a.util);

  return overloaded.map((o) => o.id);
}

// ---------------------------------------------------------------------------
// tripEdges
// ---------------------------------------------------------------------------

/**
 * Return a new GridGraph with the specified edges set to state 'tripped'.
 * Does NOT mutate the input graph.
 *
 * The returned graph's adjacency and edgeIndex maps are rebuilt to exclude
 * tripped edges so that buildBMatrix naturally ignores them.
 *
 * @param graph        The current grid graph
 * @param edgesToTrip  Array of edgeIds to mark as tripped
 * @returns            New GridGraph with updated edge states
 */
export function tripEdges(graph: GridGraph, edgesToTrip: string[]): GridGraph {
  const tripSet = new Set(edgesToTrip);

  // Build new edge map with updated states
  const newEdges = new Map(graph.edges);
  for (const edgeId of tripSet) {
    const edge = newEdges.get(edgeId);
    if (edge) {
      newEdges.set(edgeId, { ...edge, state: 'tripped' });
    }
  }

  // Rebuild adjacency and edgeIndex excluding tripped edges
  // (so the solver's B-matrix gets zero conductance from tripped lines)
  const adjacency = new Map<string, string[]>();
  const edgeIndex = new Map<string, string[]>();

  for (const nodeId of graph.nodes.keys()) {
    adjacency.set(nodeId, []);
    edgeIndex.set(nodeId, []);
  }

  for (const [edgeId, edge] of newEdges) {
    if (edge.state === 'tripped') continue; // exclude tripped edges from adjacency
    adjacency.get(edge.sourceId)?.push(edge.targetId);
    adjacency.get(edge.targetId)?.push(edge.sourceId);
    edgeIndex.get(edge.sourceId)?.push(edgeId);
    edgeIndex.get(edge.targetId)?.push(edgeId);
  }

  return {
    nodes: graph.nodes,       // nodes are immutable references
    edges: newEdges,
    adjacency,
    edgeIndex,
  };
}

// ---------------------------------------------------------------------------
// adjustInjectionsForIslanding
// ---------------------------------------------------------------------------

/**
 * Zero out injections for islanded nodes (nodes with no active incident edges)
 * and rebalance remaining injections so sum === 0.
 *
 * Islanded generators disappear from the system — their generation is lost.
 * After zeroing, the remaining imbalance is assigned to the highest-capacity
 * connected generator (the slack bus equivalent in the sub-island).
 *
 * @param graph         The current graph (with tripped edges already marked)
 * @param injections    Original injection map
 * @param trippedEdges  Set of tripped edgeIds
 * @returns             Adjusted Map<nodeId, MW> with islanded nodes zeroed
 */
export function adjustInjectionsForIslanding(
  graph: GridGraph,
  injections: Map<string, number>,
  trippedEdges: Set<string>
): Map<string, number> {
  const adjusted = new Map<string, number>(injections);

  // Identify islanded nodes: nodes with zero incident non-tripped edges
  const islandedNodes = new Set<string>();
  for (const nodeId of graph.nodes.keys()) {
    const incidentEdgeIds = graph.edgeIndex.get(nodeId) ?? [];
    const hasActiveEdge = incidentEdgeIds.some((eid) => {
      const edge = graph.edges.get(eid);
      return edge !== undefined && edge.state !== 'tripped' && !trippedEdges.has(eid);
    });
    if (!hasActiveEdge) {
      islandedNodes.add(nodeId);
    }
  }

  // Zero injections for islanded nodes
  for (const nodeId of islandedNodes) {
    adjusted.set(nodeId, 0);
  }

  // Rebalance: compute remaining imbalance after zeroing islanded nodes
  let imbalance = 0;
  for (const v of adjusted.values()) imbalance += v;

  if (Math.abs(imbalance) > 1e-9) {
    // Assign imbalance to the highest-capacity connected (non-islanded) generator
    let bestGenId = '';
    let bestCapacity = -Infinity;

    for (const [nodeId, node] of graph.nodes) {
      if (node.type === 'generator' && !islandedNodes.has(nodeId)) {
        if (node.capacityMW > bestCapacity) {
          bestCapacity = node.capacityMW;
          bestGenId = nodeId;
        }
      }
    }

    if (bestGenId) {
      const current = adjusted.get(bestGenId) ?? 0;
      adjusted.set(bestGenId, current - imbalance);
    }
  }

  return adjusted;
}

// ---------------------------------------------------------------------------
// runCascade
// ---------------------------------------------------------------------------

/**
 * Run the cascade failure loop until stable or maxIterations reached.
 *
 * Each iteration:
 *   1. Detect all overloaded (utilization > 1.0) non-tripped edges.
 *   2. If none, stop (stable system).
 *   3. Batch-trip all overloaded edges (sorted descending by utilization).
 *   4. Zero injections for newly islanded nodes.
 *   5. Re-solve DC power flow.
 *   6. Increment iteration counter; loop.
 *
 * The maxIterations cap (default 20) is the hard safety net to prevent
 * infinite loops in pathological cases. In practice, cascades resolve in 3–5
 * waves before reaching a stable or fully-separated state.
 *
 * @param graph               Initial graph (already-tripped edges should have state 'tripped')
 * @param injections          Original injection map (before any adjustments)
 * @param initialUtilizations Utilizations from the pre-cascade power flow
 * @param initialTripped      Set of edgeIds already tripped before the cascade
 * @param maxIterations       Safety cap on cascade waves (default 20)
 * @returns                   { finalGraph, flows, utilizations, trippedEdges, iterations }
 */
export function runCascade(
  graph: GridGraph,
  injections: Map<string, number>,
  initialUtilizations: Map<string, number>,
  initialTripped: Set<string>,
  maxIterations = 20
): {
  finalGraph: GridGraph;
  flows: Map<string, number>;
  utilizations: Map<string, number>;
  trippedEdges: Set<string>;
  iterations: number;
} {
  let currentGraph = graph;
  let currentTripped = new Set<string>(initialTripped);
  let currentUtils = initialUtilizations;
  let currentFlows = new Map<string, number>(); // will be set after first re-solve if needed
  let iterations = 0;

  // Seed currentFlows with zeros for initial pass (may stay if no overloads found)
  for (const edgeId of graph.edges.keys()) {
    currentFlows.set(edgeId, 0);
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const overloaded = detectOverloads(currentUtils, currentTripped);

    if (overloaded.length === 0 || iterations >= maxIterations) {
      break;
    }

    // Batch-trip all currently overloaded edges
    currentTripped = new Set<string>([...currentTripped, ...overloaded]);
    currentGraph = tripEdges(currentGraph, overloaded);

    // Adjust injections: zero out islanded nodes, rebalance
    const adjustedInjections = adjustInjectionsForIslanding(
      currentGraph,
      injections,
      currentTripped
    );

    // Re-solve power flow on the updated (post-trip) graph
    const { flows, utilizations } = runPowerFlow(currentGraph, adjustedInjections);
    currentFlows = flows;
    currentUtils = utilizations;
    iterations++;
  }

  return {
    finalGraph: currentGraph,
    flows: currentFlows,
    utilizations: currentUtils,
    trippedEdges: currentTripped,
    iterations,
  };
}
