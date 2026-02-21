'use client'

import { useState, useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { SimulationState } from '@/src/lib/simulation/types'
import type { EventHistory } from '@/lib/eventRunner'
import { generateReplaySequence, getReplayTimings } from '@/lib/replayController'
import { edgesToGeoJSON, nodesToGeoJSON } from '@/lib/map-utils'

export interface ReplayAnimationProps {
  eventHistory: EventHistory
  beforeState: SimulationState
  afterState: SimulationState
  onComplete?: () => void
}

const TEXAS_CENTER: [number, number] = [-97.5, 31]
const ZOOM = 6

export default function ReplayAnimation({
  eventHistory,
  beforeState,
  afterState,
  onComplete,
}: ReplayAnimationProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [narrative, setNarrative] = useState('Click Play to begin')
  const playStartRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)
  const mapLoadedRef = useRef(false)

  const replaySequence = generateReplaySequence(eventHistory, beforeState, afterState)
  const timings = getReplayTimings(30000)

  const updateMap = (state: SimulationState) => {
    if (!mapRef.current || !mapLoadedRef.current) return
    const edgesArray = [...state.graph.edges.values()]
    const nodesArray = [...state.graph.nodes.values()]
    const edgesGeoJSON = edgesToGeoJSON(
      edgesArray,
      state.graph.nodes,
      state.utilizations
    )
    const nodesGeoJSON = nodesToGeoJSON(nodesArray)
    const edgesSource = mapRef.current.getSource('grid-edges') as mapboxgl.GeoJSONSource
    const nodesSource = mapRef.current.getSource('grid-nodes') as mapboxgl.GeoJSONSource
    if (edgesSource) edgesSource.setData(edgesGeoJSON)
    if (nodesSource) nodesSource.setData(nodesGeoJSON)
  }

  const playReplay = () => {
    setIsPlaying(true)
    setProgress(0)
    playStartRef.current = Date.now()

    const loop = () => {
      const elapsed = Date.now() - playStartRef.current
      const percentComplete = Math.min(100, (elapsed / timings.totalMs) * 100)
      const stepIndex = Math.min(
        replaySequence.length - 1,
        Math.floor((elapsed / timings.totalMs) * replaySequence.length)
      )

      const step = replaySequence[stepIndex]
      updateMap(step.state)
      setNarrative(step.narrative)
      setProgress(percentComplete)

      if (elapsed >= timings.totalMs) {
        setProgress(100)
        setNarrative('Demo complete: mitigation prevents cascade')
        setIsPlaying(false)
        onComplete?.()
        return
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }

  const stopReplay = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    setIsPlaying(false)
    updateMap(beforeState)
    setNarrative('Replay paused')
    setProgress(0)
  }

  useEffect(() => {
    if (!mapContainerRef.current) return
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token) return
    mapboxgl.accessToken = token

    if (!mapRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
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
        mapLoadedRef.current = true
      })
      mapRef.current = map
    }

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      mapRef.current?.remove()
      mapRef.current = null
      mapLoadedRef.current = false
    }
  }, [beforeState, afterState])

  return (
    <div className="flex h-full w-full flex-col bg-black">
      <div className="relative flex-1 min-h-0">
        <div ref={mapContainerRef} className="h-full w-full" />
        <div className="absolute bottom-20 left-1/2 w-full max-w-md -translate-x-1/2 rounded-xl border border-white/10 bg-black/90 px-4 py-3 text-center shadow-xl backdrop-blur-sm">
          <div className="text-sm font-semibold text-white/90">{narrative}</div>
        </div>
      </div>
      <div className="border-t border-white/10 bg-black/95 p-4">
        <div className="mb-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white/60 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 text-right font-mono text-xs text-white/50">
            {Math.round(progress)}%
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={isPlaying ? stopReplay : playReplay}
            disabled={progress >= 100}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/20 disabled:opacity-50"
          >
            {isPlaying ? 'Stop' : progress >= 100 ? 'Complete' : 'Play Replay'}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-white/40">
          30-second animation: deterioration → mitigation → recovery
        </p>
      </div>
    </div>
  )
}
