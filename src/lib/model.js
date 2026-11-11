// The plan's math. Pure functions only, so they are easy to test.
import { ASSET_ORDER, CRASHES, RANGE_SPREAD, REAL_RETURN, SAFE_WITHDRAWAL } from '../config.js'

// ---------- Life stage ----------

export const STAGES = {
  building: { id: 'building', name: 'Building', blurb: 'More than 10 years until you retire' },
  close: { id: 'close', name: 'Close to retirement', blurb: '10 years or less to go' },
  retired: { id: 'retired', name: 'Retired', blurb: 'Living off your savings' },
}

export function stageFor(age, retireAge) {
  const yearsLeft = retireAge - age
  if (yearsLeft <= 0) return 'retired'
  if (yearsLeft <= 10) return 'close'
  return 'building'
}

// ---------- The mix ----------

// The core plan by stage. "stocks" is split into US and international below.
export const BASE_MIX = {
  building: { stocks: 65, btc: 5, gold: 10, reit: 5, bonds: 15, cash: 0 },
  close: { stocks: 50, btc: 3, gold: 10, reit: 5, bonds: 27, cash: 5 },
  retired: { stocks: 40, btc: 2, gold: 10, reit: 5, bonds: 33, cash: 10 },
}

export const US_SHARE_OF_STOCKS = 0.7
export const COMFORT_SHIFT = 10
export const MIN_BONDS = 5

export const DEFAULT_SETTINGS = { comfort: 'standard', style: 'master', bitcoin: true }

/**
 * Build a target mix (percentages that add up to 100).
 * settings.comfort: 'steadier' | 'standard' | 'bolder'
 * settings.style: 'master' (stocks, bonds, gold, bitcoin, REITs) | 'classic' (stocks and bonds only)
 * settings.bitcoin: include bitcoin or not
 */
export function mixFor(stage, settings = DEFAULT_SETTINGS) {
  const s = { ...DEFAULT_SETTINGS, ...settings }
  const m = { ...BASE_MIX[stage] }

  if (s.style === 'classic') {
    m.stocks += m.btc + m.gold + m.reit
    m.btc = 0
    m.gold = 0
    m.reit = 0
  } else if (!s.bitcoin) {
    m.stocks += m.btc
    m.btc = 0
  }

  if (s.comfort === 'steadier') {
    m.stocks -= COMFORT_SHIFT
    m.bonds += COMFORT_SHIFT
  } else if (s.comfort === 'bolder') {
    const shift = Math.min(COMFORT_SHIFT, m.bonds - MIN_BONDS)
    m.stocks += shift
    m.bonds -= shift
  }

  const us = Math.round(m.stocks * US_SHARE_OF_STOCKS)
  return {
    us,
    intl: m.stocks - us,
    btc: m.btc,
    gold: m.gold,
    reit: m.reit,
    bonds: m.bonds,
    cash: m.cash,
  }
}

export function sumMix(mix) {
  return ASSET_ORDER.reduce((t, k) => t + (mix[k] || 0), 0)
}

// Group a mix into the three jobs.
export function bucketsOf(mix) {
  return {
    grow: mix.us + mix.intl + mix.btc,
    hedge: mix.gold + mix.reit,
    protect: mix.bonds + mix.cash,
  }
}

// Expected yearly return after inflation, in percent.
export function blendedReturn(mix, returns = REAL_RETURN) {
  return ASSET_ORDER.reduce((t, k) => t + (mix[k] || 0) * returns[k], 0) / 100
}

// What a crash would have done to this mix, in percent.
export function crashLoss(mix, crash) {
  return ASSET_ORDER.reduce((t, k) => t + (mix[k] || 0) * crash.returns[k], 0) / 100
}

export function crashById(id) {
  return CRASHES.find((c) => c.id === id)
}

// ---------- Money splitting ----------

export function splitAmount(mix, amount) {
  const out = {}
  for (const k of ASSET_ORDER) out[k] = (amount * (mix[k] || 0)) / 100
  return out
}

// Rebalance trigger: more than 5 points off target,
// or for small slices, off by more than half their target size.
export function driftLimit(targetPct) {
  return Math.min(5, Math.max(targetPct * 0.5, 1))
}

export function rebalancePlan(balances, mix) {
  const total = ASSET_ORDER.reduce((t, k) => t + (Number(balances[k]) || 0), 0)
  const rows = ASSET_ORDER.map((k) => {
    const current = Number(balances[k]) || 0
    const targetPct = mix[k] || 0
    const currentPct = total > 0 ? (current / total) * 100 : 0
    const target = (total * targetPct) / 100
    const drift = currentPct - targetPct
    const limit = driftLimit(targetPct)
    const outOfRange = (targetPct > 0 || current > 0) && Math.abs(drift) > limit
    return { key: k, current, currentPct, targetPct, target, change: target - current, drift, limit, outOfRange }
  }).filter((r) => r.targetPct > 0 || r.current > 0)
  return { total, rows, needsRebalance: total > 0 && rows.some((r) => r.outOfRange) }
}

// Put new money where it is most needed, without selling anything.
export function splitNewMoney(balances, mix, amount) {
  const total = ASSET_ORDER.reduce((t, k) => t + (Number(balances[k]) || 0), 0)
  const after = total + amount
  const gaps = {}
  let gapSum = 0
  for (const k of ASSET_ORDER) {
    const gap = Math.max(0, (after * (mix[k] || 0)) / 100 - (Number(balances[k]) || 0))
    gaps[k] = gap
    gapSum += gap
  }
  const out = {}
  if (gapSum <= 0) return splitAmount(mix, amount)
  if (gapSum >= amount) {
    for (const k of ASSET_ORDER) out[k] = (gaps[k] * amount) / gapSum
  } else {
    const extra = amount - gapSum
    for (const k of ASSET_ORDER) out[k] = gaps[k] + (extra * (mix[k] || 0)) / 100
  }
  return out
}

// ---------- Retirement ----------

export function fiNumber(yearlyNeed) {
  return (yearlyNeed * 100) / SAFE_WITHDRAWAL
}

/**
 * Project savings year by year, in today's dollars.
 * Returns three scenarios (low, mid, high) and an optional stress run.
 */
export function project(input, settings = DEFAULT_SETTINGS) {
  const {
    age,
    retireAge,
    savings = 0,
    monthly = 0,
    spending = 0,
    otherIncome = 0,
    planTo = 95,
  } = input
  const need = Math.max(0, spending - otherIncome)
  const crash = crashById('2008')

  function run(offset, stress) {
    let bal = savings
    let runOut = null
    const points = [{ age, value: bal }]
    for (let a = age; a < planTo; a++) {
      const stage = stageFor(a, retireAge)
      const mix = mixFor(stage, settings)
      let r = blendedReturn(mix) + offset
      const yearsIn = a - retireAge
      if (stress && yearsIn === 0) r = crashLoss(mix, crash)
      if (stress && (yearsIn === 1 || yearsIn === 2)) r = blendedReturn(mix) - RANGE_SPREAD
      if (a < retireAge) {
        bal = bal * (1 + r / 100) + monthly * 12
      } else {
        bal -= need
        if (bal <= 0) {
          bal = 0
          if (runOut === null) runOut = a
        }
        bal = bal * (1 + r / 100)
      }
      points.push({ age: a + 1, value: Math.max(0, bal) })
    }
    const atRetire = points.find((p) => p.age === retireAge)?.value ?? savings
    return { points, runOut, atRetire, end: points[points.length - 1].value }
  }

  return {
    need,
    fi: fiNumber(need),
    low: run(-RANGE_SPREAD, false),
    mid: run(0, false),
    high: run(RANGE_SPREAD, false),
    stress: run(0, true),
  }
}

// ---------- Next dollar ----------

export const NEXT_DOLLAR_STEPS = [
  { id: 'budget', title: 'Know your numbers', ask: 'I know roughly what I earn and spend each month.', chapter: 'know-your-numbers' },
  { id: 'starter', title: 'Starter emergency fund', ask: 'I have at least one month of expenses in savings.', chapter: 'safety-first' },
  { id: 'match', title: 'Get the full 401(k) match', ask: 'I get my full employer match (or my job has no match).', chapter: 'order-of-money' },
  { id: 'debt', title: 'Pay off high-interest debt', ask: 'I have no debt above about 8% interest.', chapter: 'safety-first' },
  { id: 'emergency', title: 'Full emergency fund', ask: 'I have 3 to 6 months of expenses in savings.', chapter: 'safety-first' },
  { id: 'hsa', title: 'Fill your HSA', ask: 'I fill my HSA each year (or I am not eligible).', chapter: 'order-of-money' },
  { id: 'ira', title: 'Fill an IRA', ask: 'I fill a Roth or traditional IRA each year.', chapter: 'order-of-money' },
  { id: 'max401k', title: 'Max out your 401(k)', ask: 'I put in the full 401(k) limit each year.', chapter: 'order-of-money' },
  { id: 'taxable', title: 'Invest in a regular brokerage account', ask: 'I invest extra money in a regular brokerage account.', chapter: 'order-of-money' },
]

export function currentStep(done = {}) {
  return NEXT_DOLLAR_STEPS.find((s) => !done[s.id]) || null
}
