'use client'

import { useState, useCallback } from 'react'
import { Zap, X } from 'lucide-react'
import { AUSTIN_NODE_IDS } from '@/src/lib/simulation/topology/texas-synthetic'

interface SimulateEventsProps {
  onNodeAffected: (nodeId: string | null) => void
}

/**
 * SimulateEvents component — single button that randomly selects an Austin
 * power grid node and notifies the parent to render a scoped outage overlay.
 * Clicking again clears the active overlay.
 */
export default function SimulateEvents({ onNodeAffected }: SimulateEventsProps) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)

  const handleClick = useCallback(() => {
    if (activeNodeId !== null) {
      // Clear active event
      setActiveNodeId(null)
      onNodeAffected(null)
    } else {
      // Randomly pick one Austin node
      const idx = Math.floor(Math.random() * AUSTIN_NODE_IDS.length)
      const nodeId = AUSTIN_NODE_IDS[idx]
      setActiveNodeId(nodeId)
      onNodeAffected(nodeId)
    }
  }, [activeNodeId, onNodeAffected])

  const isActive = activeNodeId !== null

  return (
    <button
      onClick={handleClick}
      className={[
        'pointer-events-auto flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold',
        'shadow-lg transition-all duration-200 active:scale-95',
        isActive
          ? 'bg-red-600/90 text-white hover:bg-red-500/90 border border-red-400/40'
          : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-sm',
      ].join(' ')}
    >
      {isActive ? (
        <>
          <X className="h-4 w-4 shrink-0" />
          Clear Event
        </>
      ) : (
        <>
          <Zap className="h-4 w-4 shrink-0" />
          Simulate Event
        </>
      )}
    </button>
  )
}
