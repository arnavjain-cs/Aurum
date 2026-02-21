'use client'

import { Activity, Zap, AlertTriangle } from 'lucide-react'

export interface HealthMetrics {
  totalLoadMW: number
  totalGenerationMW: number
  reserveMarginPct: number
  criticalLineCount: number
  blackoutProbabilityPct: number
}

interface MetricRowProps {
  label: string
  value: string
  subtext?: string
  status?: 'normal' | 'warning' | 'critical'
}

function MetricRow({ label, value, subtext, status = 'normal' }: MetricRowProps) {
  const valueColor =
    status === 'critical'
      ? 'text-red-400'
      : status === 'warning'
      ? 'text-amber-400'
      : 'text-white/90'

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">{label}</span>
      <span className={`text-lg font-mono font-bold tabular-nums leading-tight ${valueColor}`}>
        {value}
      </span>
      {subtext && (
        <span className="text-[10px] text-white/30">{subtext}</span>
      )}
    </div>
  )
}

interface SectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <span className="text-white/50">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
          {title}
        </span>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

interface HealthPanelProps {
  metrics: HealthMetrics
}

export default function HealthPanel({ metrics }: HealthPanelProps) {
  const {
    totalLoadMW,
    totalGenerationMW,
    reserveMarginPct,
    criticalLineCount,
    blackoutProbabilityPct,
  } = metrics

  const reserveStatus: 'normal' | 'warning' | 'critical' =
    reserveMarginPct < 5 ? 'critical' : reserveMarginPct < 15 ? 'warning' : 'normal'

  const blackoutStatus: 'normal' | 'warning' | 'critical' =
    blackoutProbabilityPct >= 20 ? 'critical' : blackoutProbabilityPct >= 8 ? 'warning' : 'normal'

  const criticalStatus: 'normal' | 'warning' | 'critical' =
    criticalLineCount > 5 ? 'critical' : criticalLineCount > 0 ? 'warning' : 'normal'

  return (
    <div
      className="pointer-events-auto flex w-64 flex-col gap-4 rounded-xl border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur-sm"
      aria-label="System health panel"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
        <span className="text-sm font-semibold tracking-wide text-white/90">
          GridShield OS
        </span>
        <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-white/50">LIVE</span>
      </div>

      {/* Power Balance */}
      <Section icon={<Zap size={14} />} title="Power Balance">
        <MetricRow
          label="Total Load"
          value={`${totalLoadMW.toFixed(0)} MW`}
          subtext="System demand"
          status="normal"
        />
        <MetricRow
          label="Total Generation"
          value={`${totalGenerationMW.toFixed(0)} MW`}
          subtext="Dispatched output"
          status="normal"
        />
        <MetricRow
          label="Reserve Margin"
          value={`${reserveMarginPct.toFixed(1)}%`}
          subtext={reserveStatus === 'critical' ? 'Critically low' : reserveStatus === 'warning' ? 'Below target' : 'Adequate'}
          status={reserveStatus}
        />
      </Section>

      {/* Grid Stress */}
      <Section icon={<AlertTriangle size={14} />} title="Grid Stress">
        <MetricRow
          label="Critical Lines"
          value={`${criticalLineCount}`}
          subtext={criticalLineCount === 0 ? 'No overloads detected' : `Line${criticalLineCount > 1 ? 's' : ''} near/over capacity`}
          status={criticalStatus}
        />
        <MetricRow
          label="Blackout Risk"
          value={`${blackoutProbabilityPct.toFixed(1)}%`}
          subtext={blackoutStatus === 'critical' ? 'High cascade risk' : blackoutStatus === 'warning' ? 'Elevated risk' : 'Low risk'}
          status={blackoutStatus}
        />
      </Section>

      {/* System status indicator */}
      <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
        <Activity size={13} className="shrink-0 text-white/40" />
        <span className="text-xs text-white/40">
          {criticalLineCount === 0
            ? 'System operating normally'
            : `${criticalLineCount} line${criticalLineCount > 1 ? 's' : ''} require attention`}
        </span>
      </div>
    </div>
  )
}
