/**
 * GridShield OS — Replay Controller
 * Generates replay sequence for proof-mode animation.
 */

import type { SimulationState } from '../src/lib/simulation/types'
import type { EventHistory } from './eventRunner'

export interface ReplayStep {
  tick: number
  state: SimulationState
  phase: 'deterioration' | 'action-applied' | 'recovery'
  narrative: string
}

/**
 * Generate replay sequence: deterioration (T+0 → crisis) → action applied → recovery.
 */
export function generateReplaySequence(
  eventHistory: EventHistory,
  beforeState: SimulationState,
  afterState: SimulationState
): ReplayStep[] {
  const steps: ReplayStep[] = []

  let crisisTick = 0
  let maxSeverity = 0
  eventHistory.states.forEach((state, idx) => {
    const criticalLineCount = [...state.utilizations.values()].filter((u) => u > 0.9).length
    const trippedLineCount = state.trippedEdges.size
    const blackoutProb = state.blackoutProbability ?? 0
    const severity = criticalLineCount * 0.5 + trippedLineCount * 0.3 + blackoutProb * 100 * 0.002
    if (severity > maxSeverity) {
      maxSeverity = severity
      crisisTick = idx
    }
  })
  crisisTick = Math.max(1, crisisTick)

  for (let tick = 0; tick <= crisisTick; tick++) {
    steps.push({
      tick,
      state: eventHistory.states[tick],
      phase: 'deterioration',
      narrative:
        tick === 0
          ? 'Grid operating normally'
          : tick === crisisTick
            ? `Peak stress: T+${tick} min`
            : `Grid deteriorating... T+${tick}`,
    })
  }

  steps.push({
    tick: crisisTick,
    state: afterState,
    phase: 'action-applied',
    narrative: 'Mitigation action applied',
  })

  for (let i = 0; i < 5; i++) {
    steps.push({
      tick: crisisTick,
      state: afterState,
      phase: 'recovery',
      narrative:
        i === 0 ? 'Grid stabilizing...' : i === 4 ? 'Crisis averted' : 'Grid stable',
    })
  }

  return steps
}

export function getReplayTimings(totalDurationMs: number = 30000) {
  return {
    deteriorationMs: 15000,
    actionMs: 3000,
    recoveryMs: 12000,
    totalMs: totalDurationMs,
  }
}
