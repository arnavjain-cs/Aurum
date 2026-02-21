/**
 * GridShield OS — SimulationState factory and update functions
 *
 * Centralises SimulationState construction so all plans (cascading,
 * event simulation, recommendations) start from a canonical initial state
 * rather than constructing ad-hoc objects.
 */

import { SimulationState, GridGraph } from './types';
import { TEXAS_GRID } from './topology/texas-synthetic';
import { runPowerFlow } from './solver';

// ---------------------------------------------------------------------------
// buildInjections
// ---------------------------------------------------------------------------

/**
 * Build a balanced injection vector for the given graph and seed.
 *
 * Generator load factors are seeded pseudo-random in [0.6, 0.95]:
 *   factor = sin(seed * nodeIndex * 17) * 0.175 + 0.775
 *
 * Load demand factors are seeded pseudo-random in [0.35, 0.55]:
 *   factor = sin(seed * nodeIndex * 17 + 1) * 0.10 + 0.45
 *
 * NOTE: Demand factors use a [0.35, 0.55] range (not [0.7, 1.0]) to model
 * load diversity — individual load center capacities represent peak MW, and
 * simultaneous system-wide peak factor is well below 1.0. With 12 load nodes
 * at 15200 MW combined rated capacity and only 9500 MW of generator capacity,
 * using 0.7–1.0 demand factors would make the system structurally infeasible
 * (supply always < demand with no slack). The 0.35–0.55 range produces actual
 * load of 5320–8360 MW which is within the 5700–9025 MW generator range.
 *
 * (Using `sin` ensures values cycle smoothly with seed changes while staying
 * deterministic. The +1 offset decorrelates generator and load seeds.)
 *
 * After computing all injections, any remaining imbalance is distributed
 * proportionally across generator nodes so sum(injections) === 0.
 *
 * @param graph  The grid graph
 * @param seed   Deterministic seed (integer recommended)
 * @returns      Map<nodeId, MW> where sum === 0
 */
export function buildInjections(graph: GridGraph, seed: number): Map<string, number> {
  const injections = new Map<string, number>();

  // Use sorted order for determinism
  const sortedNodes = [...graph.nodes.values()].sort((a, b) => a.id.localeCompare(b.id));
  const generatorIds: string[] = [];

  for (let i = 0; i < sortedNodes.length; i++) {
    const node = sortedNodes[i];

    if (node.type === 'generator') {
      // Load factor: seeded in [0.6, 0.95]
      const raw = Math.sin(seed * (i + 1) * 17);
      const loadFactor = raw * 0.175 + 0.775; // maps [-1,1] to [0.6, 0.95]
      injections.set(node.id, node.capacityMW * loadFactor);
      generatorIds.push(node.id);
    } else if (node.type === 'load') {
      // Demand factor: seeded in [0.35, 0.55] (diversity-adjusted, see note above)
      const raw = Math.sin(seed * (i + 1) * 17 + 1);
      const demandFactor = raw * 0.10 + 0.45; // maps [-1,1] to [0.35, 0.55]
      injections.set(node.id, -node.capacityMW * demandFactor);
    } else {
      // storage and substation: neutral
      injections.set(node.id, 0);
    }
  }

  // Balance: compute imbalance, distribute proportionally across generators
  let imbalance = 0;
  for (const v of injections.values()) imbalance += v;

  if (generatorIds.length > 0 && Math.abs(imbalance) > 1e-9) {
    // Total generation capacity for proportional weighting
    const totalGenCapacity = generatorIds.reduce((sum, id) => {
      return sum + (graph.nodes.get(id)?.capacityMW ?? 0);
    }, 0);

    if (totalGenCapacity > 0) {
      for (const genId of generatorIds) {
        const node = graph.nodes.get(genId)!;
        const weight = node.capacityMW / totalGenCapacity;
        const current = injections.get(genId) ?? 0;
        injections.set(genId, current - imbalance * weight);
      }
    }
  }

  return injections;
}

// ---------------------------------------------------------------------------
// createInitialState
// ---------------------------------------------------------------------------

/**
 * Create the canonical initial SimulationState.
 *
 * @param seed   Deterministic scenario seed
 * @param graph  Optional — defaults to TEXAS_GRID (30 nodes, 60 edges)
 * @returns      Fully populated SimulationState with stepCount = 0
 */
export function createInitialState(seed: number, graph?: GridGraph): SimulationState {
  const g = graph ?? TEXAS_GRID;

  // Compute raw (pre-balance) generation and load totals for reserve margin reporting.
  // These represent the scheduled dispatch before the slack bus absorbs imbalance.
  // Sorted order must match buildInjections for same seed => same factors.
  const sortedNodes = [...g.nodes.values()].sort((a, b) => a.id.localeCompare(b.id));
  let totalLoadMW = 0;
  let totalGenerationMW = 0;
  for (let i = 0; i < sortedNodes.length; i++) {
    const node = sortedNodes[i];
    if (node.type === 'generator') {
      const raw = Math.sin(seed * (i + 1) * 17);
      const loadFactor = raw * 0.175 + 0.775;
      totalGenerationMW += node.capacityMW * loadFactor;
    } else if (node.type === 'load') {
      const raw = Math.sin(seed * (i + 1) * 17 + 1);
      const demandFactor = raw * 0.10 + 0.45; // [0.35, 0.55] diversity-adjusted
      totalLoadMW += node.capacityMW * demandFactor;
    }
  }

  // Build seeded injection vector (balanced so sum === 0 for the solver)
  const injections = buildInjections(g, seed);

  // Run DC power flow
  const { flows, utilizations } = runPowerFlow(g, injections);

  const reserveMarginPct =
    totalLoadMW > 0
      ? ((totalGenerationMW - totalLoadMW) / totalLoadMW) * 100
      : 0;

  return {
    graph: g,
    flows,
    utilizations,
    trippedEdges: new Set<string>(),
    blackoutProbability: 0.0,
    totalLoadMW,
    totalGenerationMW,
    reserveMarginPct,
    seed,
    stepCount: 0,
  };
}

// ---------------------------------------------------------------------------
// updateStateWithFlows
// ---------------------------------------------------------------------------

/**
 * Return a new SimulationState with updated flows and utilizations.
 * Does NOT mutate the input state.
 *
 * blackoutProbability is recomputed as:
 *   criticalEdgeCount / totalEdgeCount
 * where criticalEdgeCount = edges with utilization > 0.9 OR state === 'tripped'.
 *
 * @param state         Previous simulation state
 * @param flows         New Map<edgeId, flowMW>
 * @param utilizations  New Map<edgeId, utilization>
 * @returns             New SimulationState with stepCount incremented by 1
 */
export function updateStateWithFlows(
  state: SimulationState,
  flows: Map<string, number>,
  utilizations: Map<string, number>
): SimulationState {
  const totalEdges = state.graph.edges.size;
  let criticalCount = 0;

  for (const [edgeId, edge] of state.graph.edges) {
    const util = utilizations.get(edgeId) ?? 0;
    const isTripped = edge.state === 'tripped' || state.trippedEdges.has(edgeId);
    if (isTripped || util > 0.9) {
      criticalCount++;
    }
  }

  const blackoutProbability = totalEdges > 0 ? criticalCount / totalEdges : 0;

  return {
    ...state,
    flows,
    utilizations,
    blackoutProbability,
    stepCount: state.stepCount + 1,
  };
}
