/**
 * GridShield OS — Event Presets
 * Three deterministic stress scenarios for grid simulation.
 */

import type { SimulationState, GridGraph } from '../src/lib/simulation/types';
import { buildInjections } from '../src/lib/simulation/state';
import { runPowerFlow } from '../src/lib/simulation/solver';

export interface EventPreset {
  id: 'heat-wave' | 'generator-outage' | 'storm-path';
  name: string;
  description: string;
  icon: string;
  seed: number;
  apply: (state: SimulationState) => SimulationState;
}

/**
 * Heat Wave: Sustained high demand surge across major metros.
 * Scales load at Austin, Dallas, Houston, San Antonio, Corpus Christi by 1.35x.
 */
export const HEAT_WAVE: EventPreset = {
  id: 'heat-wave',
  name: 'Heat Wave',
  description: 'High demand surge across major metros',
  icon: '🌡️',
  seed: 0x0001,
  apply: (state: SimulationState): SimulationState => {
    const scaleFactor = 1.35;
    const targetLoads = ['LOAD-01', 'LOAD-02', 'LOAD-03', 'LOAD-04', 'LOAD-05'];

    const newInjections = buildInjections(state.graph, state.seed);
    
    for (const nodeId of targetLoads) {
      const currentLoad = newInjections.get(nodeId) ?? 0;
      newInjections.set(nodeId, currentLoad * scaleFactor);
    }

    const { flows, utilizations } = runPowerFlow(state.graph, newInjections);

    let criticalCount = 0;
    for (const util of utilizations.values()) {
      if (util > 0.9) criticalCount++;
    }

    return {
      ...state,
      flows,
      utilizations,
      blackoutProbability: criticalCount / state.graph.edges.size,
      stepCount: state.stepCount + 1,
    };
  },
};

/**
 * Generator Outage: Loss of major generation facility (GEN-03, 2000 MW).
 * Trips the three lines connecting the Gulf Coast Combined Cycle plant.
 */
export const GENERATOR_OUTAGE: EventPreset = {
  id: 'generator-outage',
  name: 'Generator Outage',
  description: 'Loss of major generation facility',
  icon: '⚡',
  seed: 0x0002,
  apply: (state: SimulationState): SimulationState => {
    const tripLines = ['LINE-06', 'LINE-07', 'LINE-51'];
    const newTripped = new Set([...state.trippedEdges, ...tripLines]);

    const newEdges = new Map(state.graph.edges);
    for (const lineId of tripLines) {
      const edge = newEdges.get(lineId);
      if (edge) {
        newEdges.set(lineId, { ...edge, state: 'tripped' as const });
      }
    }

    const newGraph: GridGraph = {
      ...state.graph,
      edges: newEdges,
    };

    const injections = buildInjections(newGraph, state.seed);
    const { flows, utilizations } = runPowerFlow(newGraph, injections);

    let criticalCount = newTripped.size;
    for (const util of utilizations.values()) {
      if (util > 0.9) criticalCount++;
    }

    return {
      ...state,
      graph: newGraph,
      flows,
      utilizations,
      trippedEdges: newTripped,
      blackoutProbability: Math.min(criticalCount / state.graph.edges.size, 1),
      stepCount: state.stepCount + 1,
    };
  },
};

/**
 * Storm Path: Weather damage to South Texas transmission corridor.
 * Trips lines to McAllen/Brownsville region, isolating coastal generation.
 */
export const STORM_PATH: EventPreset = {
  id: 'storm-path',
  name: 'Storm Path',
  description: 'Weather damage to South Texas corridor',
  icon: '🌀',
  seed: 0x0003,
  apply: (state: SimulationState): SimulationState => {
    const tripLines = ['LINE-26', 'LINE-27', 'LINE-40'];
    const newTripped = new Set([...state.trippedEdges, ...tripLines]);

    const newEdges = new Map(state.graph.edges);
    for (const lineId of tripLines) {
      const edge = newEdges.get(lineId);
      if (edge) {
        newEdges.set(lineId, { ...edge, state: 'tripped' as const });
      }
    }

    const newGraph: GridGraph = {
      ...state.graph,
      edges: newEdges,
    };

    const injections = buildInjections(newGraph, state.seed);
    const { flows, utilizations } = runPowerFlow(newGraph, injections);

    let criticalCount = newTripped.size;
    for (const util of utilizations.values()) {
      if (util > 0.9) criticalCount++;
    }

    return {
      ...state,
      graph: newGraph,
      flows,
      utilizations,
      trippedEdges: newTripped,
      blackoutProbability: Math.min(criticalCount / state.graph.edges.size, 1),
      stepCount: state.stepCount + 1,
    };
  },
};

export const ALL_PRESETS: EventPreset[] = [HEAT_WAVE, GENERATOR_OUTAGE, STORM_PATH];
