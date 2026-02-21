/**
 * GridShield OS — Core simulation type definitions
 * Pure TypeScript types only — no runtime code.
 */

export type NodeType = 'generator' | 'load' | 'storage' | 'substation';

export type EdgeState = 'normal' | 'warning' | 'critical' | 'tripped';

export interface GridNode {
  id: string;               // e.g. "GEN-01", "LOAD-07"
  type: NodeType;
  name: string;             // Human-readable, e.g. "West Texas Wind Farm"
  lat: number;              // Geographic latitude (Texas ~25-36°N)
  lng: number;              // Geographic longitude (Texas ~93-106°W)
  capacityMW: number;       // Max generation (positive) or max demand (positive)
  // For generators: rated output MW; for loads: peak demand MW; for storage: storage capacity MWh
  populationWeight: number; // 0–1 relative importance (for recommendation ranking in later phases)
}

export interface GridEdge {
  id: string;               // e.g. "LINE-01"
  sourceId: string;         // GridNode.id
  targetId: string;         // GridNode.id
  capacityMW: number;       // Thermal rating / MVA limit
  reactance: number;        // Per-unit reactance (used in DC flow B matrix)
  lengthKm: number;         // Approximate line length in km
  state: EdgeState;         // Current operational state
}

export interface GridGraph {
  nodes: Map<string, GridNode>;
  edges: Map<string, GridEdge>;
  adjacency: Map<string, string[]>; // nodeId -> array of neighbor nodeIds
  edgeIndex: Map<string, string[]>; // nodeId -> array of edgeIds incident to this node
}

export interface SimulationState {
  graph: GridGraph;
  flows: Map<string, number>;         // edgeId -> power flow in MW (signed, source-to-target positive)
  utilizations: Map<string, number>;  // edgeId -> utilization 0.0–1.0+ (>1.0 means overloaded)
  trippedEdges: Set<string>;          // edgeIds that have tripped
  blackoutProbability: number;        // 0.0–1.0
  totalLoadMW: number;
  totalGenerationMW: number;
  reserveMarginPct: number;
  seed: number;                       // Seed used to generate this state
  stepCount: number;                  // How many simulation steps have run
  lastStepDurationMs?: number;        // Duration of the most recent simulateStep call in milliseconds
}
