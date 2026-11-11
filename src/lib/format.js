const whole = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function usd(n) {
  return whole.format(Math.round(Number(n) || 0))
}

// $1.2M, $340K, $950
export function usdShort(n) {
  const v = Number(n) || 0
  const a = Math.abs(v)
  if (a >= 1e6) return `${v < 0 ? '-' : ''}$${(a / 1e6).toFixed(a >= 1e7 ? 0 : 1)}M`
  if (a >= 1e4) return `${v < 0 ? '-' : ''}$${Math.round(a / 1e3)}K`
  return usd(v)
}

export function pct(n, digits = 0) {
  const v = Number(n) || 0
  return `${v.toFixed(digits)}%`
}

export function signedPct(n, digits = 0) {
  const v = Number(n) || 0
  return `${v > 0 ? '+' : ''}${v.toFixed(digits)}%`
}
