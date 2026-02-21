'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import AssetDetails from '@/components/AssetDetails'
import type { NodeProperties, EdgeProperties } from '@/lib/map-utils'
import type { EventHistory } from '@/lib/eventRunner'
import type { HealthMetrics } from '@/components/HealthPanel'

// Map must be loaded client-side only — mapbox-gl requires browser APIs
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
        <p className="text-sm text-white/40">Initializing grid map…</p>
      </div>
    </div>
  ),
})

// Selected asset union type
export type SelectedAsset =
  | { kind: 'node'; props: NodeProperties }
  | { kind: 'edge'; props: EdgeProperties }
  | null

interface MapOverlayProps {
  eventHistory: EventHistory | null
  currentTick: number
  onMetricsReady: (metrics: HealthMetrics) => void
}

/**
 * MapOverlay component - Handles the map visualization with lines and nodes
 * Team can modify map rendering, asset selection, and visual styling here
 */
export default function MapOverlay({ 
  eventHistory, 
  currentTick, 
  onMetricsReady 
}: MapOverlayProps) {
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset>(null)

  const handleAssetSelect = useCallback((asset: SelectedAsset) => {
    setSelectedAsset(asset)
  }, [])

  return (
    <>
      {/* Full-screen map */}
      <Map
        onAssetSelect={handleAssetSelect}
        onMetricsReady={onMetricsReady}
        eventHistory={eventHistory}
        currentTick={currentTick}
      />

      {/* Asset details panel — bottom right */}
      {selectedAsset && (
        <AssetDetails
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </>
  )
}
