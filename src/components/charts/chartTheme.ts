// Shared chart theme for ASCEND — single-series cyan charts per CONTRACTS.md.
// Every chart in Stats/Progress imports from here so the System reads as one voice.
import type { CSSProperties } from 'react'

/** The one series color. Never introduce a second series hue. */
export const CHART_CYAN = '#38bdf8'

/** Recessive grid lines. */
export const CHART_GRID = 'rgba(56,189,248,0.08)'

/** Axis tick text — #8ba3c7 at 11px. */
export const AXIS_TICK: { fill: string; fontSize: number } = { fill: '#8ba3c7', fontSize: 11 }

/** Dark-glass tooltip container (overrides recharts' default white box). */
export const TOOLTIP_CONTENT_STYLE: CSSProperties = {
  background: '#0d1528',
  border: '1px solid rgba(56,189,248,0.35)',
  borderRadius: 8,
  boxShadow: '0 10px 30px rgba(2,6,16,0.65)',
  padding: '8px 12px',
  fontSize: 12,
  fontFamily: "'Rajdhani', system-ui, sans-serif",
}

export const TOOLTIP_LABEL_STYLE: CSSProperties = {
  color: '#8ba3c7',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  marginBottom: 4,
}

export const TOOLTIP_ITEM_STYLE: CSSProperties = {
  color: '#7dd3fc',
  fontSize: 12,
  fontWeight: 600,
  padding: 0,
}

/** Hover cursor for line/area charts (vertical crosshair). */
export const CURSOR_LINE = { stroke: 'rgba(56,189,248,0.3)', strokeWidth: 1 }

/** Hover cursor for bar charts (soft column highlight). */
export const CURSOR_FILL = { fill: 'rgba(56,189,248,0.06)' }
