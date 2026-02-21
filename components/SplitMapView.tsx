'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { SimulationState } from '@/src/lib/simulation/types'
import { calculateMetrics, metricsImproved, type GridMetrics } from '@/lib/metricsCalculation'
import { edgesToGeoJSON, nodesToGeoJSON } from '@/lib/map-utils'
import { calculateRiskZones } from '@/lib/riskCalculation'

const TEXAS_CENTER: [number, number] = [-97.5, 31]
const ZOOM = 6

function buildCirclePolygon(centerLat: number, centerLng: number, radiusKm: number): number[][] {
  const earthRadiusKm = 6371
  const latChange = (radiusKm / earthRadiusKm) * (180 / Math.PI)
  const lngChange =
    (radiusKm / earthRadiusKm) * (180 / Math.PI) / Math.cos(centerLat * (Math.PI / 180))
  const points: number[][] = []
  for (let i = 0; i <= 32; i++) {
    const angle = (i / 32) * 2 * Math.PI
    points.push([
      centerLng + lngChange * Math.cos(angle),
      centerLat + latChange * Math.sin(angle),
    ])
  }
  return points
}

export interface SplitMapViewProps {
  beforeState: SimulationState
  afterState: SimulationState
}

function MetricsDisplay({
  metrics,
  label,
  improved,
}: {
  metrics: GridMetrics
  label: string
  improved?: { criticalLines: boolean; blackoutProb: boolean }
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/90 px-3 py-2 shadow-xl backdrop-blur-sm">
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/80">
        {label}
      </div>
      <div className="space-y-1 font-mono text-xs text-white/70">
        <div>Load: {metrics.totalLoad} MW</div>
        <div>Gen: {metrics.totalGeneration} MW</div>
        <div>Reserve: {metrics.reserveMargin.toFixed(1)}%</div>
        <div
          className={
            improved !== undefined
              ? improved.criticalLines
                ? 'text-green-400'
                : 'text-red-400'
              : ''
          }
        >
          Critical: {metrics.criticalLineCount}
        </div>
        <div
          className={
            improved !== undefined
              ? improved.blackoutProb
                ? 'text-green-400'
                : 'text-red-400'
              : ''
          }
        >
          Blackout: {metrics.blackoutProbability.toFixed(1)}%
        </div>
      </div>
    </div>
  )
}

export default function SplitMapView({ beforeState, afterState }: SplitMapViewProps) {
  const beforeMapRef = useRef<HTMLDivElement>(null)
  const afterMapRef = useRef<HTMLDivElement>(null)
  const beforeMapInstanceRef = useRef<mapboxgl.Map | null>(null)
  const afterMapInstanceRef = useRef<mapboxgl.Map | null>(null)

  const beforeMetrics = calculateMetrics(beforeState)
  const afterMetrics = calculateMetrics(afterState)
  const improved = metricsImproved(beforeMetrics, afterMetrics)

  useEffect(() => {
    if (!beforeMapRef.current || !afterMapRef.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token) return
    mapboxgl.accessToken = token

    // Before map
    if (!beforeMapInstanceRef.current) {
      const map = new mapboxgl.Map({
        container: beforeMapRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: TEXAS_CENTER,
        zoom: ZOOM,
        attributionControl: false,
      })

      map.on('load', () => {
        const edgesArray = [...beforeState.graph.edges.values()]
        const nodesArray = [...beforeState.graph.nodes.values()]
        const edgesGeoJSON = edgesToGeoJSON(
          edgesArray,
          beforeState.graph.nodes,
          beforeState.utilizations
        )
        const nodesGeoJSON = nodesToGeoJSON(nodesArray)

        map.addSource('grid-edges', { type: 'geojson', data: edgesGeoJSON })
        map.addSource('grid-nodes', { type: 'geojson', data: nodesGeoJSON })
        map.addLayer({
          id: 'grid-edges-line',
          type: 'line',
          source: 'grid-edges',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': [
              'case',
              ['>=', ['get', 'utilization'], 1.0],
              '#ff3333',
              ['>=', ['get', 'utilization'], 0.8],
              '#ffaa00',
              '#ffffff',
            ],
            'line-width': 2,
            'line-opacity': 0.85,
          },
        })
        map.addLayer({
          id: 'grid-nodes-circle',
          type: 'circle',
          source: 'grid-nodes',
          paint: {
            'circle-radius': 5,
            'circle-color': '#ffffff',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#000',
          },
        })

        const riskZones = calculateRiskZones(beforeState)
        const riskFeatures = riskZones.map((zone) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [buildCirclePolygon(zone.centerLat, zone.centerLng, zone.radiusKm)],
          },
          properties: { riskLevel: zone.riskLevel },
        }))
        map.addSource('risk-overlay', {
          type: 'geojson',
          data: { type: 'FeatureCollection' as const, features: riskFeatures },
        })
        map.addLayer({
          id: 'risk-overlay-fill',
          type: 'fill',
          source: 'risk-overlay',
          paint: {
            'fill-color': '#ff0000',
            'fill-opacity': 0.25,
          },
        })
      })
      beforeMapInstanceRef.current = map
    }

    // After map
    if (!afterMapInstanceRef.current) {
      const map = new mapboxgl.Map({
        container: afterMapRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: TEXAS_CENTER,
        zoom: ZOOM,
        attributionControl: false,
      })

      map.on('load', () => {
        const edgesArray = [...afterState.graph.edges.values()]
        const nodesArray = [...afterState.graph.nodes.values()]
        const edgesGeoJSON = edgesToGeoJSON(
          edgesArray,
          afterState.graph.nodes,
          afterState.utilizations
        )
        const nodesGeoJSON = nodesToGeoJSON(nodesArray)

        map.addSource('grid-edges', { type: 'geojson', data: edgesGeoJSON })
        map.addSource('grid-nodes', { type: 'geojson', data: nodesGeoJSON })
        map.addLayer({
          id: 'grid-edges-line',
          type: 'line',
          source: 'grid-edges',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': [
              'case',
              ['>=', ['get', 'utilization'], 1.0],
              '#ff3333',
              ['>=', ['get', 'utilization'], 0.8],
              '#ffaa00',
              '#ffffff',
            ],
            'line-width': 2,
            'line-opacity': 0.85,
          },
        })
        map.addLayer({
          id: 'grid-nodes-circle',
          type: 'circle',
          source: 'grid-nodes',
          paint: {
            'circle-radius': 5,
            'circle-color': '#ffffff',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#000',
          },
        })
        map.addSource('risk-overlay', {
          type: 'geojson',
          data: { type: 'FeatureCollection' as const, features: [] },
        })
        map.addLayer({
          id: 'risk-overlay-fill',
          type: 'fill',
          source: 'risk-overlay',
          paint: { 'fill-color': '#ff0000', 'fill-opacity': 0 },
        })
      })
      afterMapInstanceRef.current = map
    }

    return () => {
      beforeMapInstanceRef.current?.remove()
      beforeMapInstanceRef.current = null
      afterMapInstanceRef.current?.remove()
      afterMapInstanceRef.current = null
    }
  }, [beforeState, afterState])

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-1 gap-2 overflow-hidden">
        <div className="relative flex-1">
          <div ref={beforeMapRef} className="h-full w-full" />
          <div className="absolute left-4 top-4">
            <MetricsDisplay metrics={beforeMetrics} label="BEFORE (Crisis)" />
          </div>
        </div>
        <div className="relative flex-1">
          <div ref={afterMapRef} className="h-full w-full" />
          <div className="absolute left-4 top-4">
            <MetricsDisplay
              metrics={afterMetrics}
              label="AFTER (Mitigated)"
              improved={{ criticalLines: improved.criticalLines, blackoutProb: improved.blackoutProb }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
