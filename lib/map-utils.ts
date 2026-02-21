/**
 * GridShield OS — Map Utility Functions
 * Converts synthetic grid data to GeoJSON for Mapbox rendering.
 */

import type { GridNode, GridEdge } from '../src/lib/simulation/types'

// ---------------------------------------------------------------------------
// GeoJSON type declarations (minimal, for Mapbox compatibility)
// ---------------------------------------------------------------------------

export interface NodeProperties {
  id: string
  name: string
  type: string
  capacityMW: number
  populationWeight: number
}

export interface EdgeProperties {
  id: string
  sourceId: string
  targetId: string
  capacityMW: number
  lengthKm: number
  reactance: number
  state: string
  /** Utilization fraction 0.0–1.0+. 0 = no flow, >1 = overloaded. */
  utilization: number
}

export type NodeFeature = GeoJSON.Feature<GeoJSON.Point, NodeProperties>
export type EdgeFeature = GeoJSON.Feature<GeoJSON.LineString, EdgeProperties>
export type NodeFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Point, NodeProperties>
export type EdgeFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.LineString, EdgeProperties>

// ---------------------------------------------------------------------------
// Conversion: nodes → GeoJSON FeatureCollection (Point)
// ---------------------------------------------------------------------------

/**
 * Convert an array of GridNodes to a GeoJSON FeatureCollection of Point features.
 * Coordinates are [lng, lat] per GeoJSON spec.
 *
 * @param nodes  Array of GridNode objects from the simulation topology
 * @returns      GeoJSON FeatureCollection ready to add as a Mapbox source
 */
export function nodesToGeoJSON(nodes: GridNode[]): NodeFeatureCollection {
  const features: NodeFeature[] = nodes.map((node) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [node.lng, node.lat],
    },
    properties: {
      id: node.id,
      name: node.name,
      type: node.type,
      capacityMW: node.capacityMW,
      populationWeight: node.populationWeight,
    },
  }))

  return {
    type: 'FeatureCollection',
    features,
  }
}

// ---------------------------------------------------------------------------
// Conversion: edges → GeoJSON FeatureCollection (LineString)
// ---------------------------------------------------------------------------

/**
 * Convert an array of GridEdges to a GeoJSON FeatureCollection of LineString features.
 * Requires a node lookup map to resolve coordinates for source/target nodes.
 *
 * @param edges      Array of GridEdge objects from the simulation topology
 * @param nodeMap    Map<nodeId, GridNode> for coordinate lookup
 * @param utilizations Optional Map<edgeId, utilization> from simulation state (0.0–1.0+)
 * @returns          GeoJSON FeatureCollection ready to add as a Mapbox source
 */
export function edgesToGeoJSON(
  edges: GridEdge[],
  nodeMap: Map<string, GridNode>,
  utilizations?: Map<string, number>,
): EdgeFeatureCollection {
  const features: EdgeFeature[] = []

  for (const edge of edges) {
    const source = nodeMap.get(edge.sourceId)
    const target = nodeMap.get(edge.targetId)

    if (!source || !target) {
      console.warn(
        `[map-utils] Edge ${edge.id}: missing node (source=${edge.sourceId}, target=${edge.targetId})`,
      )
      continue
    }

    const utilization = utilizations?.get(edge.id) ?? 0

    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [source.lng, source.lat],
          [target.lng, target.lat],
        ],
      },
      properties: {
        id: edge.id,
        sourceId: edge.sourceId,
        targetId: edge.targetId,
        capacityMW: edge.capacityMW,
        lengthKm: edge.lengthKm,
        reactance: edge.reactance,
        state: edge.state,
        utilization,
      },
    })
  }

  return {
    type: 'FeatureCollection',
    features,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a nodeId → GridNode lookup map from an array of nodes.
 * Used as the nodeMap parameter for edgesToGeoJSON.
 */
export function buildNodeMap(nodes: GridNode[]): Map<string, GridNode> {
  const map = new Map<string, GridNode>()
  for (const node of nodes) {
    map.set(node.id, node)
  }
  return map
}

/**
 * Derive the Mapbox paint color category string from a utilization fraction.
 * Returns 'normal' | 'warning' | 'critical'.
 */
export function utilizationStatus(utilization: number): 'normal' | 'warning' | 'critical' {
  if (utilization >= 1.0) return 'critical'
  if (utilization >= 0.8) return 'warning'
  return 'normal'
}
