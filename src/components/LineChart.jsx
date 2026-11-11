import { useEffect, useRef, useState } from 'react'
import { usdShort } from '../lib/format.js'

/**
 * series: [{ id, label, color, dash, points: [{ x, y }] }]
 * All series must share the same x values.
 */
export function LineChart({ series, xLabel = (x) => x, yLabel = usdShort, marker, markerLabel, height = 260, ariaLabel, fill }) {
  const ref = useRef(null)
  const box = useRef(null)
  const [hover, setHover] = useState(null)
  const [w, setW] = useState(640)
  useEffect(() => {
    if (!box.current || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))))
    ro.observe(box.current)
    return () => ro.disconnect()
  }, [])
  const h = w < 500 ? Math.round(height * 0.9) : height
  const pad = { l: 56, r: 16, t: 16, b: 32 }
  const xs = series[0]?.points.map((p) => p.x) || []
  if (xs.length < 2) return null
  const minX = xs[0]
  const maxX = xs[xs.length - 1]
  const maxY = Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.y))) * 1.08
  const X = (x) => pad.l + ((x - minX) / (maxX - minX)) * (w - pad.l - pad.r)
  const Y = (y) => pad.t + (1 - y / maxY) * (h - pad.t - pad.b)

  const ticksY = niceTicks(maxY, 4)
  const stepX = Math.max(1, Math.ceil((maxX - minX) / (w < 500 ? 4 : 6) / 5) * 5)
  const ticksX = []
  for (let x = Math.ceil(minX / stepX) * stepX; x <= maxX; x += stepX) ticksX.push(x)

  function path(points) {
    return points.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join('')
  }

  function onMove(e) {
    const rect = ref.current.getBoundingClientRect()
    const cx = ((e.clientX - rect.left) / rect.width) * w
    const x = minX + ((cx - pad.l) / (w - pad.l - pad.r)) * (maxX - minX)
    const idx = Math.max(0, Math.min(xs.length - 1, Math.round(x - minX)))
    setHover(idx)
  }

  const hx = hover !== null ? xs[hover] : null

  return (
    <div className="chart" ref={box}>
      <svg
        ref={ref}
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={ariaLabel}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {ticksY.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={Y(t)} y2={Y(t)} className="grid" />
            <text x={pad.l - 8} y={Y(t) + 4} textAnchor="end" className="axis">
              {yLabel(t)}
            </text>
          </g>
        ))}
        {ticksX.map((t) => (
          <text key={t} x={X(t)} y={h - 8} textAnchor="middle" className="axis">
            {xLabel(t)}
          </text>
        ))}
        {marker !== undefined && marker >= minX && marker <= maxX && (
          <g>
            <line x1={X(marker)} x2={X(marker)} y1={pad.t} y2={h - pad.b} className="marker" />
            {markerLabel && (
              <text x={X(marker) + 6} y={pad.t + 12} className="axis marker-label">
                {markerLabel}
              </text>
            )}
          </g>
        )}
        {fill && series[fill.from] && series[fill.to] && (
          <path
            d={`${path(series[fill.to].points)}L${[...series[fill.from].points].reverse().map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join('L')}Z`}
            fill={fill.color}
            opacity="0.14"
          />
        )}
        {series.map((s) => (
          <path key={s.id} d={path(s.points)} fill="none" stroke={s.color} strokeWidth={s.width || 2.5} strokeDasharray={s.dash || undefined} strokeLinejoin="round" />
        ))}
        {hx !== null && (
          <g>
            <line x1={X(hx)} x2={X(hx)} y1={pad.t} y2={h - pad.b} className="hoverline" />
            {series.map((s) => (
              <circle key={s.id} cx={X(hx)} cy={Y(s.points[hover].y)} r="4" fill={s.color} />
            ))}
          </g>
        )}
      </svg>
      <div className="chart-readout" aria-live="polite">
        {hx !== null ? (
          <>
            <strong>{xLabel(hx)}</strong>
            {series.map((s) => (
              <span key={s.id}>
                <i style={{ background: s.color }}></i>
                {s.label}: {usdShort(s.points[hover].y)}
              </span>
            ))}
          </>
        ) : (
          <>
            {series.map((s) => (
              <span key={s.id}>
                <i style={{ background: s.color }}></i>
                {s.label}
              </span>
            ))}
            <em>Hover or tap the chart for values</em>
          </>
        )}
      </div>
    </div>
  )
}

function niceTicks(max, count) {
  const raw = max / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || raw
  const out = []
  for (let v = 0; v <= max; v += step) out.push(v)
  return out
}
