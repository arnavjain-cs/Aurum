'use client'

/**
 * useRealtimeMetrics — drives the PowerBalance panel with live-feeling data.
 *
 * Behaviour:
 *  - Derives a "base" snapshot from the current SimulationState via calculateHealthMetrics.
 *  - Every TICK_MS a small sinusoidal drift + gaussian noise is applied so numbers
 *    visibly tick like a real SCADA/EMS screen.
 *  - When simulationState changes (event fired, timeline scrub) the base resets
 *    immediately so the panel reacts to grid events in real time.
 *  - Critical-line count is kept as an integer — no fractional jitter.
 *  - Values are clamped to physically plausible ranges (no negative MW, etc.).
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { SimulationState } from '@/src/lib/simulation/types'
import type { HealthMetrics } from '@/components/HealthPanel'
import { calculateHealthMetrics } from '@/lib/sharedMetrics'

// How often the display ticks (ms)
const TICK_MS = 2_500

// Amplitude of the slow sinusoidal drift — 1.2 % of base value
const DRIFT_AMP = 0.012

// Per-tick gaussian noise std-dev as a fraction of base value
const MW_NOISE_SIGMA  = 0.0025  // ±0.25 % each tick for MW readings
const PCT_NOISE_SIGMA = 0.18    // ±0.18 pp each tick for % readings

// Minimum displayed blackout probability even in healthy baseline (0.3 %)
// — real grids are never truly at 0; this makes the metric visually "live"
const BLACKOUT_FLOOR_PCT = 0.3

/**
 * Box–Muller transform: produces one gaussian sample with the given std-dev,
 * clamped to ±3σ so we never get wild outliers.
 */
function gaussian(sigma: number): number {
  const u = Math.max(1e-10, Math.random())
  const v = Math.random()
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  return Math.max(-3 * sigma, Math.min(3 * sigma, z * sigma))
}

export function useRealtimeMetrics(simulationState: SimulationState): HealthMetrics {
  const baseRef = useRef<HealthMetrics>(calculateHealthMetrics(simulationState))
  const tickRef = useRef(0)

  const [live, setLive] = useState<HealthMetrics>(() =>
    calculateHealthMetrics(simulationState)
  )

  // Recompute the tick function so lint doesn't complain about stale refs
  const tick = useCallback(() => {
    tickRef.current += 1
    const t = tickRef.current
    const base = baseRef.current

    // Skip while dashboard hasn't received real data yet
    if (base.totalLoadMW === 0) return

    // Slow sinusoidal drift — period ≈ 80 ticks (≈ 3.3 min), like a load curve
    const sine = Math.sin(t * (2 * Math.PI) / 80)

    // Load drifts more freely (demand is uncontrolled)
    const loadDrift = sine * DRIFT_AMP + gaussian(MW_NOISE_SIGMA)
    // Generation tracks load but slightly lags (economic dispatch response)
    const genDrift = sine * DRIFT_AMP * 0.6 + gaussian(MW_NOISE_SIGMA)

    const loadMW = Math.max(0, base.totalLoadMW * (1 + loadDrift))
    const genMW  = Math.max(0, base.totalGenerationMW * (1 + genDrift))

    // Reserve margin recalculated from live load/gen — naturally fluctuates
    const reservePct = loadMW > 0 ? ((genMW - loadMW) / loadMW) * 100 : 0

    // Blackout probability: small noise around base, never below the floor
    // When an event fires the base jumps to the event value (5–20 %+) so
    // the noise stays anchored to the new level automatically.
    const blackoutBase = Math.max(BLACKOUT_FLOOR_PCT, base.blackoutProbabilityPct)
    const blackoutPct  = Math.max(
      BLACKOUT_FLOOR_PCT,
      Math.min(100, blackoutBase + gaussian(PCT_NOISE_SIGMA))
    )

    // Critical lines: keep as an integer but allow the displayed value to
    // reflect the current base immediately when an event fires.
    const criticalLineCount = base.criticalLineCount

    setLive({
      totalLoadMW: loadMW,
      totalGenerationMW: genMW,
      reserveMarginPct: reservePct,
      criticalLineCount,
      blackoutProbabilityPct: blackoutPct,
    })
  }, [])

  // When simulation state changes (event fired / timeline scrub) → snap immediately.
  // Apply the same blackout floor so the metric reads as "live" even at baseline.
  useEffect(() => {
    const newBase = calculateHealthMetrics(simulationState)
    baseRef.current = newBase
    setLive({
      ...newBase,
      blackoutProbabilityPct: Math.max(BLACKOUT_FLOOR_PCT, newBase.blackoutProbabilityPct),
    })
  }, [simulationState])

  // Start the ticker
  useEffect(() => {
    const id = setInterval(tick, TICK_MS)
    return () => clearInterval(id)
  }, [tick])

  return live
}
