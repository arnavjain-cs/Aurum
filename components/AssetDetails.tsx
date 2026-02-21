'use client'

import { X } from 'lucide-react'
import type { SelectedAsset } from '@/app/page'

interface AssetDetailsProps {
  asset: NonNullable<SelectedAsset>
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 py-2 last:border-0">
      <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">{label}</span>
      <span className="text-sm font-mono tabular-nums text-white/80">{value}</span>
    </div>
  )
}

export default function AssetDetails({ asset, onClose }: AssetDetailsProps) {
  const isNode = asset.kind === 'node'
  const name = isNode ? asset.props.name : asset.props.id
  const typeLabel = isNode ? asset.props.type : 'Transmission line'
  const capacityMW = asset.props.capacityMW
  
  // For edges, calculate flow from utilization (flow = utilization * capacity)
  const flowMW = isNode
    ? '—'
    : `${(asset.props.utilization * asset.props.capacityMW).toFixed(0)} MW`
  const utilizationPct = isNode
    ? '—'
    : `${(asset.props.utilization * 100).toFixed(1)}%`
  
  // Determine status color for edges
  const utilizationStatus = !isNode && asset.props.utilization >= 1.0 
    ? 'critical' 
    : !isNode && asset.props.utilization >= 0.8 
      ? 'warning' 
      : 'normal'

  return (
    <div
      className="pointer-events-auto absolute bottom-4 left-4 right-4 z-20 rounded-xl border border-white/10 bg-black/95 p-4 shadow-2xl backdrop-blur-sm sm:left-auto sm:right-4 sm:w-80"
      aria-label="Asset details"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-sm font-semibold text-white/90">Asset details</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-white/40 transition hover:bg-white/10 hover:text-white/80"
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-3 space-y-0">
        <DetailRow label="Name" value={name} />
        <DetailRow label="Type" value={typeLabel} />
        {!isNode && <DetailRow label="Flow" value={flowMW} />}
        <DetailRow label="Capacity" value={`${capacityMW.toLocaleString()} MW`} />
        {!isNode && (
          <div className="flex justify-between gap-4 border-b border-white/5 py-2 last:border-0">
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">Utilization</span>
            <span className={`text-sm font-mono tabular-nums ${
              utilizationStatus === 'critical' ? 'text-red-400' :
              utilizationStatus === 'warning' ? 'text-amber-400' :
              'text-white/80'
            }`}>{utilizationPct}</span>
          </div>
        )}
      </div>
    </div>
  )
}
