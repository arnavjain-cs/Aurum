'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { TEXAS_NODES, TEXAS_EDGES } from '../src/lib/simulation/topology/texas-synthetic'
import { nodesToGeoJSON, edgesToGeoJSON, buildNodeMap } from '../lib/map-utils'
import type { NodeProperties, EdgeProperties } from '../lib/map-utils'
import { createInitialState } from '../src/lib/simulation/state'
import type { SelectedAsset } from '../app/page'
import type { HealthMetrics } from './HealthPanel'
import type { EventHistory } from '../lib/eventRunner'
import { calculateRiskZones } from '../lib/riskCalculation'
import { calculateHealthMetrics } from '../lib/sharedMetrics'
import VehicleLayer from './VehicleLayer'

// Texas grid center — ERCOT service territory
const TEXAS_CENTER: [number, number] = [-100.0, 31.0]
const INITIAL_ZOOM = 6
const SIMULATION_SEED = 1

// Uber Maps inspired monochrome palette with accent colors
const NODE_COLORS: Record<string, string> = {
  generator: '#ffffff',  // White
  substation: '#666666', // Gray
  load: '#ffffff',       // White
  storage: '#888888',    // Light gray
}

const NODE_RADII: Record<string, number> = {
  generator: 9,
  substation: 5,
  load: 7,
  storage: 6,
}

// Precompute GeoJSON from topology
const nodeMap = buildNodeMap(TEXAS_NODES)
const NODES_GEOJSON = nodesToGeoJSON(TEXAS_NODES)

// Run initial simulation to get utilization data
const INITIAL_SIM_STATE = createInitialState(SIMULATION_SEED)
const EDGES_GEOJSON = edgesToGeoJSON(TEXAS_EDGES, nodeMap, INITIAL_SIM_STATE.utilizations)

// Helper to build circular polygon for risk zones
function buildCirclePolygon(centerLat: number, centerLng: number, radiusKm: number): number[][] {
  const earthRadiusKm = 6371
  const latChange = (radiusKm / earthRadiusKm) * (180 / Math.PI)
  const lngChange = (radiusKm / earthRadiusKm) * (180 / Math.PI) / Math.cos(centerLat * (Math.PI / 180))

  const points: number[][] = []
  for (let i = 0; i <= 32; i++) {
    const angle = (i / 32) * 2 * Math.PI
    const lat = centerLat + latChange * Math.sin(angle)
    const lng = centerLng + lngChange * Math.cos(angle)
    points.push([lng, lat])
  }
  return points
}

interface MapProps {
  onAssetSelect?: (asset: SelectedAsset) => void
  onMetricsReady?: (metrics: HealthMetrics) => void
  eventHistory?: EventHistory | null
  currentTick?: number
}

export default function Map({ onAssetSelect, onMetricsReady, eventHistory, currentTick = 0 }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const mapLoadedRef = useRef(false)
  const lastTickRef = useRef<number>(-1)
  const lastHistoryIdRef = useRef<string | null>(null)

  // Memoize current state to avoid recalculations
  const currentState = useMemo(() => {
    if (eventHistory && eventHistory.states[currentTick]) {
      return eventHistory.states[currentTick]
    }
    return null
  }, [eventHistory, currentTick])

  // Memoize edges GeoJSON - only rebuild when state actually changes
  const edgesGeoJSON = useMemo(() => {
    if (!currentState) return EDGES_GEOJSON
    const edgesArray = [...currentState.graph.edges.values()]
    return edgesToGeoJSON(edgesArray, currentState.graph.nodes, currentState.utilizations)
  }, [currentState])

  // Memoize risk zones GeoJSON
  const riskGeoJSON = useMemo(() => {
    if (!currentState) return { type: 'FeatureCollection' as const, features: [] as GeoJSON.Feature[] }
    const riskZones = calculateRiskZones(currentState)
    const riskFeatures = riskZones.map(zone => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [buildCirclePolygon(zone.centerLat, zone.centerLng, zone.radiusKm)],
      },
      properties: {
        riskLevel: zone.riskLevel,
      },
    }))
    return { type: 'FeatureCollection' as const, features: riskFeatures }
  }, [currentState])

  // Update map sources when data changes - debounced via refs
  const updateMapSources = useCallback(() => {
    const map = mapRef.current
    if (!map || !mapLoadedRef.current) return

    const historyId = eventHistory?.presetId ?? null
    const shouldUpdate = lastTickRef.current !== currentTick || lastHistoryIdRef.current !== historyId
    
    if (!shouldUpdate) return
    
    lastTickRef.current = currentTick
    lastHistoryIdRef.current = historyId

    const edgesSource = map.getSource('grid-edges') as mapboxgl.GeoJSONSource | undefined
    if (edgesSource) {
      edgesSource.setData(edgesGeoJSON)
    }

    const riskSource = map.getSource('risk-overlay') as mapboxgl.GeoJSONSource | undefined
    if (riskSource) {
      riskSource.setData(riskGeoJSON)
    }
  }, [edgesGeoJSON, riskGeoJSON, currentTick, eventHistory?.presetId])

  // Update map when data changes
  useEffect(() => {
    updateMapSources()
  }, [updateMapSources])

  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token) {
      console.error(
        '[Map] NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set. ' +
        'Create a .env.local file with your Mapbox access token.'
      )
      return
    }

    mapboxgl.accessToken = token

    // Uber Maps inspired dark style
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: TEXAS_CENTER,
      zoom: INITIAL_ZOOM,
      antialias: true,
      attributionControl: true,
    })

    mapRef.current = map
    setMapInstance(map)

    if (onMetricsReady) {
      onMetricsReady(calculateHealthMetrics(INITIAL_SIM_STATE))
    }

    const handleResize = () => {
      map.resize()
    }
    window.addEventListener('resize', handleResize)

    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12,
      className: 'grid-tooltip',
    })
    popupRef.current = popup

    map.on('load', () => {
      console.info('[Map] Dark-v11 map loaded — adding grid overlay layers')
      mapLoadedRef.current = true

      // -------------------------------------------------------------------
      // SOURCES
      // -------------------------------------------------------------------

      map.addSource('grid-edges', {
        type: 'geojson',
        data: EDGES_GEOJSON,
      })

      map.addSource('grid-nodes', {
        type: 'geojson',
        data: NODES_GEOJSON,
      })

      // Risk overlay source
      map.addSource('risk-overlay', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })

      // -------------------------------------------------------------------
      // LAYER: Risk overlay (darkened regions)
      // -------------------------------------------------------------------

      map.addLayer({
        id: 'risk-overlay-fill',
        type: 'fill',
        source: 'risk-overlay',
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'riskLevel'], 3], '#ff0000',
            ['==', ['get', 'riskLevel'], 2], '#ff6600',
            '#ffaa00',
          ],
          'fill-opacity': [
            'case',
            ['==', ['get', 'riskLevel'], 3], 0.25,
            ['==', ['get', 'riskLevel'], 2], 0.18,
            0.12,
          ],
        },
      })

      // -------------------------------------------------------------------
      // LAYER: Transmission lines — glow effect (Uber Maps style)
      // -------------------------------------------------------------------

      map.addLayer({
        id: 'grid-edges-glow',
        type: 'line',
        source: 'grid-edges',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': [
            'case',
            ['>=', ['get', 'utilization'], 1.0], '#ff3333',
            ['>=', ['get', 'utilization'], 0.8], '#ffaa00',
            '#ffffff',
          ],
          'line-width': [
            'interpolate', ['linear'], ['get', 'utilization'],
            0, 4,
            0.8, 10,
            1.0, 16,
          ],
          'line-blur': [
            'case',
            ['>=', ['get', 'utilization'], 0.8], 6,
            2,
          ],
          'line-opacity': [
            'case',
            ['>=', ['get', 'utilization'], 0.8], 0.4,
            0.15,
          ],
        },
      })

      // -------------------------------------------------------------------
      // LAYER: Transmission lines — solid (monochrome with accent)
      // -------------------------------------------------------------------

      map.addLayer({
        id: 'grid-edges-line',
        type: 'line',
        source: 'grid-edges',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': [
            'case',
            ['>=', ['get', 'utilization'], 1.0], '#ff3333',
            ['>=', ['get', 'utilization'], 0.8], '#ffaa00',
            '#ffffff',
          ],
          'line-width': [
            'interpolate', ['linear'], ['get', 'utilization'],
            0, 1.5,
            0.8, 2.5,
            1.0, 4,
          ],
          'line-opacity': [
            'case',
            ['>=', ['get', 'utilization'], 0.8], 0.95,
            0.6,
          ],
        },
      })

      // -------------------------------------------------------------------
      // LAYER: Grid nodes — circles (monochrome)
      // -------------------------------------------------------------------

      map.addLayer({
        id: 'grid-nodes-circle',
        type: 'circle',
        source: 'grid-nodes',
        paint: {
          'circle-radius': [
            'match', ['get', 'type'],
            'generator', NODE_RADII.generator,
            'substation', NODE_RADII.substation,
            'load',       NODE_RADII.load,
            'storage',    NODE_RADII.storage,
            6,
          ],
          'circle-color': [
            'match', ['get', 'type'],
            'generator', NODE_COLORS.generator,
            'substation', NODE_COLORS.substation,
            'load',       NODE_COLORS.load,
            'storage',    NODE_COLORS.storage,
            '#ffffff',
          ],
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#000000',
          'circle-stroke-opacity': 0.8,
        },
      })

      console.info(
        `[Map] Grid overlay added — ${TEXAS_NODES.length} nodes, ${TEXAS_EDGES.length} edges`
      )

      // -------------------------------------------------------------------
      // INTERACTION: Click on nodes
      // -------------------------------------------------------------------

      map.on('click', 'grid-nodes-circle', (e) => {
        if (!e.features || e.features.length === 0) return
        const props = e.features[0].properties as NodeProperties
        if (onAssetSelect) {
          onAssetSelect({ kind: 'node', props })
        }
      })

      // -------------------------------------------------------------------
      // INTERACTION: Click on transmission lines
      // -------------------------------------------------------------------

      map.on('click', 'grid-edges-line', (e) => {
        if (!e.features || e.features.length === 0) return
        const props = e.features[0].properties as EdgeProperties
        if (onAssetSelect) {
          onAssetSelect({ kind: 'edge', props })
        }
      })

      // -------------------------------------------------------------------
      // INTERACTION: Click on blank map area — deselect
      // -------------------------------------------------------------------

      map.on('click', (e) => {
        // Only deselect if click was NOT on a node or edge layer
        const nodeFeatures = map.queryRenderedFeatures(e.point, {
          layers: ['grid-nodes-circle'],
        })
        const edgeFeatures = map.queryRenderedFeatures(e.point, {
          layers: ['grid-edges-line'],
        })
        if (nodeFeatures.length === 0 && edgeFeatures.length === 0) {
          if (onAssetSelect) onAssetSelect(null)
        }
      })

      // -------------------------------------------------------------------
      // INTERACTION: Hover cursor and tooltip — NODES
      // -------------------------------------------------------------------

      map.on('mouseenter', 'grid-nodes-circle', (e) => {
        map.getCanvas().style.cursor = 'pointer'
        if (!e.features || e.features.length === 0) return

        const props = e.features[0].properties as NodeProperties
        const coords = (e.features[0].geometry as GeoJSON.Point).coordinates as [number, number]
        
        // Format type label for display
        const typeLabels: Record<string, string> = {
          generator: 'Generator',
          load: 'Load Center',
          storage: 'Battery Storage',
          substation: 'Substation',
        }
        const typeLabel = typeLabels[props.type] || props.type

        popup
          .setLngLat(coords)
          .setHTML(
            `<div class="grid-tooltip-inner">
              <div class="grid-tooltip-name">${props.name}</div>
              <div class="grid-tooltip-row">
                <span class="grid-tooltip-label">Type</span>
                <span class="grid-tooltip-value">${typeLabel}</span>
              </div>
              ${props.capacityMW > 0 ? `<div class="grid-tooltip-row">
                <span class="grid-tooltip-label">Capacity</span>
                <span class="grid-tooltip-value">${props.capacityMW.toLocaleString()} MW</span>
              </div>` : ''}
            </div>`
          )
          .addTo(map)
      })

      map.on('mouseleave', 'grid-nodes-circle', () => {
        map.getCanvas().style.cursor = ''
        popup.remove()
      })

      // -------------------------------------------------------------------
      // INTERACTION: Hover cursor and tooltip — EDGES
      // -------------------------------------------------------------------

      map.on('mouseenter', 'grid-edges-line', (e) => {
        map.getCanvas().style.cursor = 'pointer'
        if (!e.features || e.features.length === 0) return

        const props = e.features[0].properties as EdgeProperties
        const coords = e.lngLat

        const utilization = props.utilization ?? 0
        const utilPct = `${(utilization * 100).toFixed(1)}%`
        const flowMW = Math.round(utilization * props.capacityMW)
        
        // Determine status color class
        const statusClass = utilization >= 1.0 
          ? 'color: #ff3333;' 
          : utilization >= 0.8 
            ? 'color: #ffaa00;' 
            : ''

        popup
          .setLngLat(coords)
          .setHTML(
            `<div class="grid-tooltip-inner">
              <div class="grid-tooltip-name">${props.id}</div>
              <div class="grid-tooltip-row">
                <span class="grid-tooltip-label">Flow</span>
                <span class="grid-tooltip-value">${flowMW} MW</span>
              </div>
              <div class="grid-tooltip-row">
                <span class="grid-tooltip-label">Capacity</span>
                <span class="grid-tooltip-value">${props.capacityMW} MW</span>
              </div>
              <div class="grid-tooltip-row">
                <span class="grid-tooltip-label">Utilization</span>
                <span class="grid-tooltip-value" style="${statusClass}">${utilPct}</span>
              </div>
            </div>`
          )
          .addTo(map)
      })

      map.on('mouseleave', 'grid-edges-line', () => {
        map.getCanvas().style.cursor = ''
        popup.remove()
      })
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      popup.remove()
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {/* Tooltip styles — browser-use.com inspired black/white theme */}
      <style>{`
        .grid-tooltip .mapboxgl-popup-content {
          background: rgba(0, 0, 0, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0;
          box-shadow: 0 4px 24px rgba(0,0,0,0.6);
          backdrop-filter: blur(12px);
          pointer-events: none;
        }
        .grid-tooltip .mapboxgl-popup-tip {
          border-top-color: rgba(0, 0, 0, 0.95);
        }
        .grid-tooltip-inner {
          padding: 10px 12px;
          min-width: 160px;
        }
        .grid-tooltip-name {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 6px;
          line-height: 1.3;
        }
        .grid-tooltip-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 3px;
        }
        .grid-tooltip-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .grid-tooltip-value {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          font-family: ui-monospace, monospace;
        }
      `}</style>
      <div
        ref={containerRef}
        className="h-full w-full"
        aria-label="Power grid map centered on Texas"
      />
      <VehicleLayer map={mapInstance} />
    </>
  )
}
