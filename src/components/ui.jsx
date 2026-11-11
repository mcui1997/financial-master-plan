// Small shared building blocks for the tools.
import { useEffect, useId, useState } from 'react'
import { ASSETS, ASSET_ORDER } from '../config.js'
import { pct, usd } from '../lib/format.js'

export function Money({ label, value, onChange, hint, max = 1e10 }) {
  const id = useId()
  const [text, setText] = useState(fmt(value))
  const [focus, setFocus] = useState(false)
  useEffect(() => {
    if (!focus) setText(fmt(value))
  }, [value, focus])
  function fmt(v) {
    return Number(v) ? Math.round(Number(v)).toLocaleString('en-US') : '0'
  }
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <span className="money-input">
        <span aria-hidden="true">$</span>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={text}
          onFocus={(e) => {
            setFocus(true)
            e.target.select()
          }}
          onBlur={() => setFocus(false)}
          onChange={(e) => {
            const clean = e.target.value.replace(/[^0-9]/g, '').slice(0, 12)
            setText(clean ? Number(clean).toLocaleString('en-US') : '')
            onChange(Math.min(max, Number(clean) || 0))
          }}
        />
      </span>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

export function Slider({ label, value, onChange, min, max, step = 1, format = (v) => v, hint }) {
  const id = useId()
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">
        {label} <strong className="field-value">{format(value)}</strong>
      </span>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

export function Segmented({ label, value, onChange, options }) {
  return (
    <div className="field" role="group" aria-label={label}>
      <span className="field-label">{label}</span>
      <div className="segmented">
        {options.map((o) => (
          <button
            type="button"
            key={o.value}
            className={value === o.value ? 'on' : ''}
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Toggle({ label, checked, onChange, hint }) {
  const id = useId()
  return (
    <label className="toggle" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track" aria-hidden="true"></span>
      <span>
        {label}
        {hint && <span className="field-hint block">{hint}</span>}
      </span>
    </label>
  )
}

export function Stat({ label, value, sub, tone }) {
  return (
    <div className={`stat ${tone || ''}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  )
}

export function Callout({ tone = 'info', title, children }) {
  return (
    <div className={`callout ${tone}`} role={tone === 'warn' ? 'alert' : undefined}>
      {title && <strong className="callout-title">{title}</strong>}
      <div>{children}</div>
    </div>
  )
}

// Donut chart of a mix.
export function Donut({ mix, size = 200, label }) {
  const r = 40
  const c = 2 * Math.PI * r
  let offset = 0
  const parts = ASSET_ORDER.filter((k) => mix[k] > 0)
  return (
    <svg className="donut" viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={label || ASSET_ORDER.filter((k) => mix[k] > 0).map((k) => `${ASSETS[k].name} ${mix[k]}%`).join(', ')}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth="16" />
      {parts.map((k) => {
        const len = (mix[k] / 100) * c
        const el = (
          <circle
            key={k}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={ASSETS[k].color}
            strokeWidth="16"
            strokeDasharray={`${Math.max(0, len - 0.6)} ${c}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 50 50)"
          />
        )
        offset += len
        return el
      })}
    </svg>
  )
}

export function MixLegend({ mix, amounts }) {
  return (
    <ul className="legend">
      {ASSET_ORDER.filter((k) => mix[k] > 0).map((k) => (
        <li key={k}>
          <span className="swatch" style={{ background: ASSETS[k].color }} aria-hidden="true"></span>
          <span className="legend-name">{ASSETS[k].name}</span>
          <span className="legend-num">{pct(mix[k])}</span>
          {amounts && <span className="legend-amt">{usd(amounts[k])}</span>}
        </li>
      ))}
    </ul>
  )
}

// Horizontal stacked bar for a mix.
export function MixBar({ mix }) {
  return (
    <div className="mixbar" aria-hidden="true">
      {ASSET_ORDER.filter((k) => mix[k] > 0).map((k) => (
        <span key={k} style={{ width: `${mix[k]}%`, background: ASSETS[k].color }} title={`${ASSETS[k].name} ${mix[k]}%`}></span>
      ))}
    </div>
  )
}
