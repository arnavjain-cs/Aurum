/**
 * GridShield OS — Graph construction and traversal module
 * Owns O(1) neighbor lookup via adjacency Maps.
 */

import { GridNode, GridEdge, GridGraph } from './types';

/**
 * Build a GridGraph from arrays of nodes and edges.
 * Throws if any edge references a node id that doesn't exist.
 */
export function createGraph(nodes: GridNode[], edges: GridEdge[]): GridGraph {
  const nodeMap = new Map<string, GridNode>();
  const edgeMap = new Map<string, GridEdge>();
  const adjacency = new Map<string, string[]>();
  const edgeIndex = new Map<string, string[]>();

  // Populate node map and initialize adjacency / edgeIndex entries
  for (const node of nodes) {
    nodeMap.set(node.id, node);
    adjacency.set(node.id, []);
    edgeIndex.set(node.id, []);
  }

  // Populate edge map; build adjacency and edgeIndex
  for (const edge of edges) {
    if (!nodeMap.has(edge.sourceId)) {
      throw new Error(
        `Edge "${edge.id}" references unknown source node "${edge.sourceId}"`
      );
    }
    if (!nodeMap.has(edge.targetId)) {
      throw new Error(
        `Edge "${edge.id}" references unknown target node "${edge.targetId}"`
      );
    }

    edgeMap.set(edge.id, edge);

    // Undirected adjacency: both directions
    adjacency.get(edge.sourceId)!.push(edge.targetId);
    adjacency.get(edge.targetId)!.push(edge.sourceId);

    // Edge index: both endpoints
    edgeIndex.get(edge.sourceId)!.push(edge.id);
    edgeIndex.get(edge.targetId)!.push(edge.id);
  }

  return { nodes: nodeMap, edges: edgeMap, adjacency, edgeIndex };
}

/**
 * Return array of GridNode objects adjacent to nodeId.
 * Returns empty array if nodeId has no neighbors (does not throw).
 */
export function getNeighbors(graph: GridGraph, nodeId: string): GridNode[] {
  const neighborIds = graph.adjacency.get(nodeId) ?? [];
  return neighborIds
    .map((id) => graph.nodes.get(id))
    .filter((n): n is GridNode => n !== undefined);
}

/**
 * Return array of GridEdge objects incident to nodeId.
 */
export function getIncidentEdges(graph: GridGraph, nodeId: string): GridEdge[] {
  const incidentIds = graph.edgeIndex.get(nodeId) ?? [];
  return incidentIds
    .map((id) => graph.edges.get(id))
    .filter((e): e is GridEdge => e !== undefined);
}

/**
 * Return the first edge connecting nodeIdA and nodeIdB (either direction),
 * or undefined if no such edge exists.
 */
export function getEdgeBetween(
  graph: GridGraph,
  nodeIdA: string,
  nodeIdB: string
): GridEdge | undefined {
  const incidentIds = graph.edgeIndex.get(nodeIdA) ?? [];
  for (const edgeId of incidentIds) {
    const edge = graph.edges.get(edgeId);
    if (!edge) continue;
    if (
      (edge.sourceId === nodeIdA && edge.targetId === nodeIdB) ||
      (edge.sourceId === nodeIdB && edge.targetId === nodeIdA)
    ) {
      return edge;
    }
  }
  return undefined;
}

/**
 * Validate a GridGraph for structural correctness.
 * Returns { valid: true, errors: [] } if all checks pass.
 */
export function validateGraph(graph: GridGraph): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [edgeId, edge] of graph.edges) {
    // Every edge references existing node ids
    if (!graph.nodes.has(edge.sourceId)) {
      errors.push(`Edge "${edgeId}": sourceId "${edge.sourceId}" not found in nodes`);
    }
    if (!graph.nodes.has(edge.targetId)) {
      errors.push(`Edge "${edgeId}": targetId "${edge.targetId}" not found in nodes`);
    }

    // No self-loops
    if (edge.sourceId === edge.targetId) {
      errors.push(`Edge "${edgeId}": self-loop detected (sourceId === targetId)`);
    }

    // capacityMW > 0
    if (edge.capacityMW <= 0) {
      errors.push(`Edge "${edgeId}": capacityMW must be > 0, got ${edge.capacityMW}`);
    }

    // reactance > 0
    if (edge.reactance <= 0) {
      errors.push(`Edge "${edgeId}": reactance must be > 0, got ${edge.reactance}`);
    }
  }

  for (const [nodeId, node] of graph.nodes) {
    // capacityMW >= 0 for all nodes (substations legitimately have 0)
    if (node.capacityMW < 0) {
      errors.push(`Node "${nodeId}": capacityMW must be >= 0, got ${node.capacityMW}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
