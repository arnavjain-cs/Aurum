'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { SimulationState } from '@/src/lib/simulation/types'
import type { EventHistory } from '@/lib/eventRunner'

// Lazy import EventPanel for client-side only
const EventPanel = dynamic(() => import('@/components/EventPanel'), { ssr: false })

interface SimulateEventsProps {
  currentState: SimulationState
  onEventHistoryReady: (history: EventHistory) => void
  activePresetId?: string | null
  /**
   * Optional custom event handler callback
   * Use this to customize what happens when an event is clicked
   * If not provided, uses default EventPanel behavior
   */
  onEventClick?: (presetId: string, currentState: SimulationState) => Promise<void>
}

/**
 * SimulateEvents component - Handles event simulation controls
 * Team can modify event types, behavior, and add custom event handlers here
 * 
 * To customize event behavior:
 * 1. Pass an onEventClick handler to intercept event clicks
 * 2. Modify /lib/eventPresets.ts to add/change available events
 * 3. Modify /lib/eventRunner.ts to change simulation logic
 */
export default function SimulateEvents({ 
  currentState,
  onEventHistoryReady,
  activePresetId,
  onEventClick
}: SimulateEventsProps) {
  const [isCustomHandlerActive, setIsCustomHandlerActive] = useState(false)

  // Wrapper to allow custom behavior while maintaining default functionality
  const handleEventReady = useCallback((history: EventHistory) => {
    onEventHistoryReady(history)
    
    // Example: Add custom logic after event completes
    // console.log(`Event ${history.presetId} completed with ${history.states.length} states`)
  }, [onEventHistoryReady])

  return (
    <div className="pointer-events-auto">
      <EventPanel
        currentState={currentState}
        onEventHistoryReady={handleEventReady}
        activePresetId={activePresetId}
      />
      
      {/* Example: Add custom controls or indicators here */}
      {isCustomHandlerActive && (
        <div className="mt-2 rounded-lg bg-yellow-500/10 px-4 py-2 text-xs text-yellow-500">
          Custom event handler active
        </div>
      )}
    </div>
  )
}

/**
 * Example custom event handler:
 * 
 * const customEventHandler = async (presetId: string, state: SimulationState) => {
 *   console.log(`Custom handling for event: ${presetId}`)
 *   
 *   // Add your custom logic here:
 *   // - Send analytics
 *   // - Show custom UI
 *   // - Modify state before simulation
 *   // - etc.
 * }
 * 
 * Usage:
 * <SimulateEvents 
 *   currentState={state}
 *   onEventHistoryReady={handleHistory}
 *   onEventClick={customEventHandler}
 * />
 */
