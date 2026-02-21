/**
 * GridShield OS — DC Power Flow Solver
 *
 * Implements the B-matrix (nodal susceptance) DC power flow method.
 * Assumptions:
 *   - Flat voltage profile: all |V| = 1 pu
 *   - Small angle differences: sin(θ) ≈ θ
 *   - Purely resistive losses ignored (P = B * θ)
 *
 * Algorithm:
 *   1. Build (N-1) × (N-1) B matrix (excluding slack bus)
 *   2. Solve B * θ = P using Gaussian elimination with partial pivoting
 *   3. Derive line flows: P_ij = (θ_i - θ_j) / x_ij
 *   4. Compute utilizations: |P_ij| / capacityMW
 */

import { GridGraph, GridEdge } from './types';

// ---------------------------------------------------------------------------
// buildBMatrix
// ---------------------------------------------------------------------------

/**
 * Build the (N-1) × (N-1) nodal susceptance (B) matrix for DC power flow.
 *
 * @param graph     The grid graph (only non-tripped edges contribute)
 * @param nodeOrder Array of nodeIds, length N-1, excluding the slack bus.
 *                  Must be sorted for determinism.
 * @returns         2D array of size (N-1) × (N-1)
 */
export function buildBMatrix(graph: GridGraph, nodeOrder: string[]): number[][] {
  const n = nodeOrder.length;
  // Index map for O(1) row/column lookup
  const idx = new Map<string, number>();
  for (let i = 0; i < n; i++) idx.set(nodeOrder[i], i);

  // Initialise n×n matrix to 0
  const B: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));

  for (const edge of graph.edges.values()) {
    // Only active (non-tripped) lines contribute conductance
    if (edge.state === 'tripped') continue;

    const susceptance = 1 / edge.reactance; // b_ij = 1 / x_ij

    const iIdx = idx.get(edge.sourceId);
    const jIdx = idx.get(edge.targetId);

    // Diagonal terms (both endpoints in the reduced matrix)
    if (iIdx !== undefined) B[iIdx][iIdx] += susceptance;
    if (jIdx !== undefined) B[jIdx][jIdx] += susceptance;

    // Off-diagonal coupling terms
    if (iIdx !== undefined && jIdx !== undefined) {
      B[iIdx][jIdx] -= susceptance;
      B[jIdx][iIdx] -= susceptance;
    }
  }

  return B;
}

// ---------------------------------------------------------------------------
// solveLinearSystem
// ---------------------------------------------------------------------------

/**
 * Solve Ax = b using Gaussian elimination with partial pivoting.
 * Returns the x vector. Returns zero vector if A is singular (e.g., isolated bus).
 */
export function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = b.length;

  // Deep-copy A and b to avoid mutating inputs
  const M: number[][] = A.map((row) => [...row]);
  const rhs: number[] = [...b];

  // Forward elimination with partial pivoting
  for (let col = 0; col < n; col++) {
    // Find pivot row (maximum absolute value in column)
    let pivotRow = col;
    let maxVal = Math.abs(M[col][col]);
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > maxVal) {
        maxVal = Math.abs(M[row][col]);
        pivotRow = row;
      }
    }

    // Detect singular matrix
    if (maxVal < 1e-12) {
      // Matrix is singular — return zero vector (disconnected subgraph)
      return new Array<number>(n).fill(0);
    }

    // Swap pivot row into position
    if (pivotRow !== col) {
      [M[col], M[pivotRow]] = [M[pivotRow], M[col]];
      [rhs[col], rhs[pivotRow]] = [rhs[pivotRow], rhs[col]];
    }

    // Eliminate below
    const pivot = M[col][col];
    for (let row = col + 1; row < n; row++) {
      const factor = M[row][col] / pivot;
      for (let k = col; k < n; k++) {
        M[row][k] -= factor * M[col][k];
      }
      rhs[row] -= factor * rhs[col];
    }
  }

  // Back-substitution
  const x: number[] = new Array<number>(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = rhs[row];
    for (let col = row + 1; col < n; col++) {
      sum -= M[row][col] * x[col];
    }
    x[row] = sum / M[row][row];
  }

  return x;
}

// ---------------------------------------------------------------------------
// computeAngles
// ---------------------------------------------------------------------------

/**
 * Compute voltage angle vector for all nodes given an injection map.
 *
 * @param graph       The grid graph
 * @param injections  Map<nodeId, MW> — positive = generation, negative = demand
 * @param slackNodeId The reference bus (angle fixed at 0)
 * @returns           Map<nodeId, angle_radians>
 */
export function computeAngles(
  graph: GridGraph,
  injections: Map<string, number>,
  slackNodeId: string
): Map<string, number> {
  // Sorted node order for determinism (excludes slack bus)
  const nodeOrder = [...graph.nodes.keys()]
    .filter((id) => id !== slackNodeId)
    .sort();

  // Build B matrix and P vector for non-slack buses
  const B = buildBMatrix(graph, nodeOrder);
  const P = nodeOrder.map((id) => injections.get(id) ?? 0);

  // Solve B * θ = P
  const thetaValues = solveLinearSystem(B, P);

  // Build result map, including slack bus at 0
  const angles = new Map<string, number>();
  angles.set(slackNodeId, 0);
  for (let i = 0; i < nodeOrder.length; i++) {
    angles.set(nodeOrder[i], thetaValues[i]);
  }

  return angles;
}

// ---------------------------------------------------------------------------
// deriveFlows
// ---------------------------------------------------------------------------

/**
 * Compute line flows from voltage angles.
 * Flow is signed: positive means source→target direction.
 *
 * P_ij = (θ_i - θ_j) / x_ij
 *
 * @param graph  The grid graph
 * @param angles Map<nodeId, angle> from computeAngles
 * @returns      Map<edgeId, flowMW>
 */
export function deriveFlows(
  graph: GridGraph,
  angles: Map<string, number>
): Map<string, number> {
  const flows = new Map<string, number>();

  for (const [edgeId, edge] of graph.edges) {
    const thetaI = angles.get(edge.sourceId) ?? 0;
    const thetaJ = angles.get(edge.targetId) ?? 0;
    // P_ij = (θ_i - θ_j) / x_ij
    const flow = (thetaI - thetaJ) / edge.reactance;
    flows.set(edgeId, flow);
  }

  return flows;
}

// ---------------------------------------------------------------------------
// runPowerFlow
// ---------------------------------------------------------------------------

/**
 * Run a full DC power flow on the given graph with the given injection vector.
 *
 * Slack bus selection: the generator node with the highest capacityMW (ties
 * broken by nodeId string sort for determinism).
 *
 * Injection balancing: the slack bus absorbs any imbalance so sum(injections) = 0.
 *
 * @param graph      The grid graph
 * @param injections Map<nodeId, MW> — positive = generation, negative = demand
 * @returns          { flows: Map<edgeId, MW>, utilizations: Map<edgeId, 0–∞> }
 */
export function runPowerFlow(
  graph: GridGraph,
  injections: Map<string, number>
): { flows: Map<string, number>; utilizations: Map<string, number> } {
  // --- Select slack bus: generator with highest capacityMW (deterministic) ---
  let slackNodeId = '';
  let maxCapacity = -Infinity;
  // Sort nodeIds so tie-breaking is deterministic
  const sortedNodeIds = [...graph.nodes.keys()].sort();
  for (const nodeId of sortedNodeIds) {
    const node = graph.nodes.get(nodeId)!;
    if (node.type === 'generator' && node.capacityMW > maxCapacity) {
      maxCapacity = node.capacityMW;
      slackNodeId = nodeId;
    }
  }

  // Fallback: if no generators exist, use first node alphabetically
  if (!slackNodeId) {
    slackNodeId = sortedNodeIds[0];
  }

  // --- Balance injections: compute imbalance, assign to slack ---
  const balancedInjections = new Map<string, number>(injections);

  let imbalance = 0;
  for (const v of balancedInjections.values()) imbalance += v;

  // Slack absorbs the imbalance
  const currentSlack = balancedInjections.get(slackNodeId) ?? 0;
  balancedInjections.set(slackNodeId, currentSlack - imbalance);

  // --- Handle isolated nodes (all incident edges tripped) ---
  // For isolated nodes, force injection to 0 so they don't create infeasibility
  for (const nodeId of graph.nodes.keys()) {
    const incidentEdges = (graph.edgeIndex.get(nodeId) ?? [])
      .map((eid) => graph.edges.get(eid))
      .filter((e): e is GridEdge => e !== undefined);
    const hasActiveEdge = incidentEdges.some((e) => e.state !== 'tripped');
    if (!hasActiveEdge) {
      balancedInjections.set(nodeId, 0);
    }
  }

  // Re-balance after zeroing isolated nodes
  imbalance = 0;
  for (const v of balancedInjections.values()) imbalance += v;
  const newSlack = balancedInjections.get(slackNodeId) ?? 0;
  balancedInjections.set(slackNodeId, newSlack - imbalance);

  // --- Compute angles and flows ---
  const angles = computeAngles(graph, balancedInjections, slackNodeId);
  const flows = deriveFlows(graph, angles);

  // --- Compute utilizations ---
  const utilizations = new Map<string, number>();
  for (const [edgeId, edge] of graph.edges) {
    const flow = flows.get(edgeId) ?? 0;
    const utilization = Math.abs(flow) / edge.capacityMW;
    utilizations.set(edgeId, utilization);
  }

  return { flows, utilizations };
}
