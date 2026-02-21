/**
 * GridShield OS — Event Runner
 * Pre-computes full 10-tick cascade trajectory for timeline scrubber.
 */

import type { SimulationState } from '../src/lib/simulation/types';
import { simulateStep } from '../src/lib/simulation/engine';
import type { EventPreset } from './eventPresets';

export interface EventHistory {
  presetId: string;
  presetName: string;
  startTime: number;
  states: SimulationState[];
  isComputing: boolean;
}

/**
 * Run a full event simulation, pre-computing all 10 ticks.
 * 
 * @param initialState - The baseline state before the event
 * @param preset - The event preset to apply
 * @param onProgress - Optional callback for progress updates
 * @returns Array of 11 states: T+0 (pre-event) through T+10
 */
export async function runEventSimulation(
  initialState: SimulationState,
  preset: EventPreset,
  onProgress?: (tick: number, totalTicks: number) => void
): Promise<SimulationState[]> {
  const states: SimulationState[] = [initialState];
  
  let currentState = preset.apply(initialState);
  states.push(currentState);
  
  if (onProgress) {
    onProgress(1, 10);
  }

  for (let tick = 2; tick <= 10; tick++) {
    currentState = simulateStep(currentState);
    states.push(currentState);
    
    if (onProgress) {
      onProgress(tick, 10);
    }
    
    if (tick % 2 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
  }

  return states;
}
