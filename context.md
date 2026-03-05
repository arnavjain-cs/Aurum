# Aurum (GridShield OS) - Codebase Context

> **AI-assisted real-time power grid stress simulator and cascade failure prevention dashboard**

## Overview

**Aurum** (Latin for "gold") is a sophisticated power grid simulation tool that models the Texas ERCOT power grid with 30 nodes and 60 transmission lines. Users can run stress scenarios (heat waves, generator outages, storms) and receive AI-generated mitigation recommendations to prevent cascading failures.

The project features a luxury "gold" aesthetic and provides real-time visualization of grid health, power flows, and cascading failure risks.

---

## Project Structure

```
Aurum/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Main dashboard (grid simulator)
│   ├── layout.tsx                # Root layout with metadata
│   ├── home/page.tsx             # Luxury landing page
│   └── globals.css               # Global styles (Tailwind + Mapbox)
├── components/                   # React UI components
│   ├── Map.tsx                   # Mapbox GL visualization
│   ├── MapOverlay.tsx            # Map wrapper with asset selection
│   ├── HealthPanel.tsx           # Grid health metrics display
│   ├── PowerBalance.tsx          # Power balance wrapper
│   ├── EventPanel.tsx            # Event simulation controls
│   ├── SimulateEvents.tsx        # Event simulation wrapper
│   ├── TimelinePanel.tsx         # Timeline scrubber (T+0 to T+10)
│   ├── RecommendationsPanel.tsx  # AI mitigation recommendations
│   ├── ProofModePanel.tsx        # Before/after comparison view
│   ├── SplitMapView.tsx          # Split-screen map comparison
│   ├── ReplayAnimation.tsx       # Animated replay of events
│   └── AssetDetails.tsx          # Selected asset info panel
├── lib/                          # Business logic utilities
│   ├── eventPresets.ts           # Heat Wave, Generator Outage, Storm Path
│   ├── eventRunner.ts            # 10-tick simulation runner
│   ├── constraintDetection.ts    # Violation detection (overloads, cascades)
│   ├── actionGeneration.ts       # Mitigation action candidates
│   ├── actionRanking.ts          # Multi-objective action scoring
│   ├── actionApplier.ts          # Apply actions to simulation
│   ├── customerImpact.ts         # Customer impact analysis
│   ├── metricsCalculation.ts     # Grid metrics for proof mode
│   ├── riskCalculation.ts        # Geographic risk zone clustering
│   ├── replayController.ts       # Replay sequence generation
│   ├── sharedMetrics.ts          # Centralized metrics calculation
│   └── map-utils.ts              # GeoJSON conversion for Mapbox
├── src/lib/simulation/           # Core simulation engine
│   ├── types.ts                  # TypeScript type definitions
│   ├── graph.ts                  # Graph construction & traversal
│   ├── state.ts                  # SimulationState factory
│   ├── solver.ts                 # DC Power Flow solver (B-matrix)
│   ├── cascade.ts                # Cascading failure heuristic
│   ├── engine.ts                 # Top-level simulation orchestrator
│   ├── topology/
│   │   └── texas-synthetic.ts    # 30-node, 60-edge Texas grid
│   └── __tests__/
│       └── engine.test.ts        # Node.js test suite
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.sim.json             # Simulation-specific TS config
├── tailwind.config.ts            # Tailwind CSS configuration
└── postcss.config.js             # PostCSS configuration
```

---

## Features

### 1. Power Grid Simulation Engine

The core simulation engine implements realistic power flow analysis:

- **DC Power Flow Solver**: B-matrix (nodal susceptance) method with Gaussian elimination
- **Cascading Failure Heuristic**: Detects overloads (>100% utilization), trips lines, re-solves until stable
- **Deterministic Simulation**: Seeded pseudo-random generation for reproducible results

### 2. Event Presets

Three built-in stress scenarios to test grid resilience:

| Event | Description | Impact |
|-------|-------------|--------|
| **Heat Wave** | 35% demand surge across major Texas metros | Dallas, Houston, San Antonio, Austin, Corpus Christi |
| **Generator Outage** | Loss of Gulf Coast Combined Cycle plant | 2000 MW lost, 3 lines tripped |
| **Storm Path** | Weather damage to South Texas corridor | 3 lines tripped |

### 3. AI Recommendations System

Intelligent mitigation suggestion engine:

- **Constraint Detection**: Identifies line warnings (>80%), critical overloads (>100%), cascading risks, low reserve margins
- **Action Generation**: Creates candidates for load shedding (5%, 10%, 20%), battery discharge, topology re-routing
- **Multi-Objective Ranking**: Scores actions by:
  - Violation reduction (50% weight)
  - Customer impact (30% weight)
  - Confidence (20% weight)
- **Action Application**: Applies mitigation and re-simulates to show before/after results

### 4. Interactive Map Visualization

Real-time grid visualization powered by Mapbox GL:

- **Dark Theme Map**: Centered on Texas (ERCOT territory)
- **Dynamic Line Colors**: White → Amber → Red based on utilization
- **Risk Zones**: Geographic clustering of critical areas with colored overlays
- **Asset Selection**: Click nodes/edges to view detailed information

### 5. Timeline Scrubber

10-tick simulation playback system:

- **Pre-computed States**: T+0 through T+10 simulation snapshots
- **Playback Controls**: Play, pause, reset, manual scrubbing
- **Live Metrics**: Tripped lines count, average utilization, blackout probability

### 6. Proof Mode

Before/after comparison for validating mitigation effectiveness:

- **Split View**: Side-by-side comparison of grid states
- **Replay Animation**: Animated sequence showing deterioration → action → recovery

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.1.0 | React framework with App Router |
| **React** | 18.2.0 | UI component library |
| **TypeScript** | 5.3.3 | Type-safe JavaScript |
| **Mapbox GL** | 3.1.2 | Interactive map visualization |
| **Tailwind CSS** | 3.4.1 | Utility-first CSS framework |
| **Lucide React** | 0.323.0 | Icon library |

---

## Data Models

### GridNode

```typescript
interface GridNode {
  id: string               // e.g., "GEN-01", "LOAD-07"
  type: 'generator' | 'load' | 'storage' | 'substation'
  name: string             // Human-readable name
  lat: number              // Geographic latitude
  lng: number              // Geographic longitude
  capacityMW: number       // Max generation/demand
  populationWeight: number // 0–1 importance score
}
```

### GridEdge

```typescript
interface GridEdge {
  id: string               // e.g., "LINE-01"
  sourceId: string         // Node ID
  targetId: string         // Node ID
  capacityMW: number       // Thermal rating
  reactance: number        // Per-unit reactance
  lengthKm: number         // Line length
  state: 'normal' | 'warning' | 'critical' | 'tripped'
}
```

### SimulationState

```typescript
interface SimulationState {
  graph: GridGraph
  flows: Map<string, number>         // edgeId → MW
  utilizations: Map<string, number>  // edgeId → 0.0–1.0+
  trippedEdges: Set<string>
  blackoutProbability: number        // 0.0–1.0
  totalLoadMW: number
  totalGenerationMW: number
  reserveMarginPct: number
  seed: number
  stepCount: number
}
```

---

## Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Main Dashboard | Grid simulator with all panels and controls |
| `/home` | Landing Page | Luxury marketing page with gold "Aurum" branding |

---

## UI Components

| Component | File | Purpose |
|-----------|------|---------|
| Map | `components/Map.tsx` | Mapbox GL map with grid overlay |
| MapOverlay | `components/MapOverlay.tsx` | Map wrapper with asset selection handling |
| HealthPanel | `components/HealthPanel.tsx` | Displays load, generation, reserve margin, blackout risk |
| PowerBalance | `components/PowerBalance.tsx` | Wrapper for HealthPanel |
| EventPanel | `components/EventPanel.tsx` | Event preset buttons (Heat Wave, Generator Outage, Storm) |
| SimulateEvents | `components/SimulateEvents.tsx` | Event simulation wrapper |
| TimelinePanel | `components/TimelinePanel.tsx` | Timeline scrubber with playback controls |
| RecommendationsPanel | `components/RecommendationsPanel.tsx` | AI mitigation recommendations display |
| ProofModePanel | `components/ProofModePanel.tsx` | Before/after comparison view |
| SplitMapView | `components/SplitMapView.tsx` | Side-by-side map comparison |
| ReplayAnimation | `components/ReplayAnimation.tsx` | Animated replay sequence |
| AssetDetails | `components/AssetDetails.tsx` | Selected node/edge details panel |

---

## Core Simulation Files

### Engine & Solver

| File | Key Functions |
|------|---------------|
| `src/lib/simulation/engine.ts` | `simulateStep()`, `applyOverload()` |
| `src/lib/simulation/solver.ts` | `runPowerFlow()`, `buildBMatrix()`, `computeAngles()`, `deriveFlows()` |
| `src/lib/simulation/cascade.ts` | `runCascade()`, `detectOverloads()`, `tripEdges()` |
| `src/lib/simulation/state.ts` | `createInitialState()`, `buildInjections()`, `updateStateWithFlows()` |
| `src/lib/simulation/graph.ts` | `createGraph()`, `getNeighbors()`, `getIncidentEdges()`, `validateGraph()` |

### Topology

| File | Description |
|------|-------------|
| `src/lib/simulation/topology/texas-synthetic.ts` | 30-node, 60-edge synthetic Texas ERCOT grid |

---

## Business Logic Utilities

| File | Key Functions | Purpose |
|------|---------------|---------|
| `lib/eventPresets.ts` | `HEAT_WAVE`, `GENERATOR_OUTAGE`, `STORM_PATH` | Predefined stress scenarios |
| `lib/eventRunner.ts` | `runEventSimulation()` | Execute 10-tick simulation |
| `lib/constraintDetection.ts` | `detectViolations()` | Find grid constraint violations |
| `lib/actionGeneration.ts` | `generateActions()` | Create mitigation candidates |
| `lib/actionRanking.ts` | `rankActions()`, `formatActionForUI()` | Score and format recommendations |
| `lib/actionApplier.ts` | `applyAction()` | Apply mitigation to simulation |
| `lib/customerImpact.ts` | `calculateCustomerImpact()` | Estimate affected customers |
| `lib/metricsCalculation.ts` | `calculateMetrics()`, `metricsImproved()` | Grid health metrics |
| `lib/riskCalculation.ts` | `calculateRiskZones()` | Geographic risk clustering |
| `lib/replayController.ts` | `generateReplaySequence()`, `getReplayTimings()` | Animation sequencing |
| `lib/sharedMetrics.ts` | `calculateHealthMetrics()` | Centralized metrics |
| `lib/map-utils.ts` | `nodesToGeoJSON()`, `edgesToGeoJSON()`, `utilizationStatus()` | Mapbox data conversion |

---

## Configuration

### Environment Variables

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=<your-mapbox-token>
```

### NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start development server |
| `build` | `next build` | Build for production |
| `start` | `next start` | Start production server |
| `typecheck` | `tsc --noEmit` | Type-check without emitting |
| `sim:build` | `tsc -p tsconfig.sim.json` | Build simulation engine |
| `test` | `tsc -p tsconfig.sim.json && node --test ...` | Run simulation tests |

### Tailwind Custom Colors

```typescript
colors: {
  'grid-green': '#22c55e',   // Healthy/normal state
  'grid-yellow': '#eab308',  // Warning state
  'grid-red': '#ef4444',     // Critical state
  'grid-blue': '#3b82f6',    // Informational
}
```

---

## Architecture Notes

### Client-Side Only

This is a **client-side only application** with no backend API:
- All simulation runs in the browser using pure TypeScript
- No server-side data fetching or database
- Mapbox GL provides map tiles (requires access token)

### Simulation Flow

1. **Initialize**: Load Texas synthetic grid topology (30 nodes, 60 edges)
2. **Apply Event**: Modify demand/generation based on selected preset
3. **Solve Power Flow**: Run DC power flow with B-matrix method
4. **Detect Cascades**: Check for overloads, trip lines, re-solve
5. **Generate Actions**: Create mitigation candidates
6. **Rank Actions**: Score by effectiveness and customer impact
7. **Visualize**: Update map with current grid state

### Component Patterns

- **Dynamic Imports**: Map component loaded dynamically to avoid SSR issues
- **React Hooks**: useState, useEffect, useMemo, useCallback throughout
- **Memoization**: Heavy computations cached to prevent re-renders

---

## Grid Topology Summary

The Texas synthetic grid models the ERCOT system with:

- **30 Nodes**: Mix of generators, loads, storage, and substations
- **60 Edges**: Transmission lines with capacity ratings and reactance values
- **Geographic Coverage**: Major Texas cities and power generation facilities
- **Realistic Parameters**: Based on public ERCOT data and typical grid characteristics

---

## Key Metrics Displayed

| Metric | Description | Location |
|--------|-------------|----------|
| Total Load | Current system demand in MW | Health Panel |
| Total Generation | Current generation capacity in MW | Health Panel |
| Reserve Margin | (Generation - Load) / Load as percentage | Health Panel |
| Blackout Probability | Risk of cascading failure (0-100%) | Health Panel |
| Tripped Lines | Number of transmission lines out of service | Timeline Panel |
| Average Utilization | Mean line loading across all active lines | Timeline Panel |

---

## Testing

Tests are located in `src/lib/simulation/__tests__/` and use Node.js built-in test runner:

```bash
npm test
```

The test suite validates:
- Power flow solver accuracy
- Cascading failure detection
- State management
- Graph operations

---

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables**:
   ```bash
   export NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=<your-token>
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**: Navigate to `http://localhost:3000`

---

*Generated: February 2026*
