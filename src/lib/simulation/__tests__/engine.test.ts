/**
 * GridShield OS — Simulation Engine Test Suite
 *
 * Uses Node.js built-in test runner (node:test + node:assert).
 * Run compiled output: node --test dist/lib/simulation/__tests__/engine.test.js
 *
 * Tests:
 *   1. createInitialState returns 60 utilization values
 *   2. All utilizations are non-negative
 *   3. Artificially overloading a line causes it to trip
 *   4. Performance: simulateStep completes in under 200ms
 *   5. Determinism: same seed produces identical output
 *   6. Cascade terminates under extreme stress
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../state';
import { simulateStep, applyOverload } from '../engine';

// ---------------------------------------------------------------------------
// Test 1: Initial state has 60 utilizations
// ---------------------------------------------------------------------------
test('createInitialState returns 60 utilization values', () => {
  const state = createInitialState(42);
  assert.strictEqual(state.utilizations.size, 60, `Expected 60 utilizations, got ${state.utilizations.size}`);
});

// ---------------------------------------------------------------------------
// Test 2: Power flow produces utilizations in valid range (non-negative)
// ---------------------------------------------------------------------------
test('all utilizations are non-negative', () => {
  const state = createInitialState(42);
  state.utilizations.forEach((u, edgeId) => {
    assert(u >= 0, `Edge ${edgeId} has negative utilization: ${u}`);
  });
});

// ---------------------------------------------------------------------------
// Test 3: Artificial overload causes cascade — the overloaded edge trips
// ---------------------------------------------------------------------------
test('artificially overloading a line causes it to trip', () => {
  const state = createInitialState(42);

  // Pick the first non-tripped edge with the highest utilization
  const targetEdge = [...state.utilizations.entries()]
    .sort((a, b) => b[1] - a[1])[0][0];

  // Force it to overload by reducing its capacity to 1/20th (utilization → 20×)
  const overloadedState = applyOverload(state, targetEdge, 20);
  const stepped = simulateStep(overloadedState);

  assert(
    stepped.trippedEdges.has(targetEdge),
    `Expected edge ${targetEdge} to be tripped after 20× overload`
  );
});

// ---------------------------------------------------------------------------
// Test 4: Performance — full step completes under 200ms
// ---------------------------------------------------------------------------
test('simulateStep completes in under 200ms', () => {
  const state = createInitialState(42);
  const start = Date.now();
  simulateStep(state);
  const duration = Date.now() - start;
  assert(
    duration < 200,
    `Step took ${duration}ms, expected < 200ms`
  );
});

// ---------------------------------------------------------------------------
// Test 5: Determinism — same seed produces identical output on two runs
// ---------------------------------------------------------------------------
test('same seed produces identical utilizations and tripped edges', () => {
  const state1 = simulateStep(createInitialState(99));
  const state2 = simulateStep(createInitialState(99));

  // All utilizations must match within floating-point precision
  let allMatch = true;
  state1.utilizations.forEach((v, k) => {
    const v2 = state2.utilizations.get(k);
    if (v2 === undefined || Math.abs(v - v2) > 1e-10) {
      allMatch = false;
    }
  });
  assert(allMatch, 'Utilizations differ between runs with same seed (99)');

  // Tripped edge sets must be identical
  assert.deepStrictEqual(
    [...state1.trippedEdges].sort(),
    [...state2.trippedEdges].sort(),
    'Tripped edges differ between runs with same seed (99)'
  );
});

// ---------------------------------------------------------------------------
// Test 6: Cascade always terminates (no infinite loop) under extreme stress
// ---------------------------------------------------------------------------
test('runCascade always terminates under extreme grid stress', () => {
  const state = createInitialState(42);

  // Force maximum stress by overloading multiple edges with 50× factor
  let stressedState = state;
  const edgeList = [...state.graph.edges.keys()];
  for (let i = 0; i < 5; i++) {
    stressedState = applyOverload(stressedState, edgeList[i], 50);
  }

  // simulateStep must complete without throwing or hanging
  const result = simulateStep(stressedState);

  // Just assert it ran and produced a valid state
  assert(result.trippedEdges.size >= 0, 'trippedEdges.size should be a non-negative number');
  assert(result.stepCount > 0, 'stepCount should be incremented');
});
