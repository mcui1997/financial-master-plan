import { describe, expect, it } from 'vitest'
import {
  BASE_MIX, blendedReturn, crashLoss, crashById, currentStep, fiNumber, mixFor, project,
  rebalancePlan, splitNewMoney, stageFor, sumMix,
} from './model.js'
import { ASSET_ORDER } from '../config.js'

const stages = Object.keys(BASE_MIX)
const variants = []
for (const comfort of ['steadier', 'standard', 'bolder'])
  for (const style of ['master', 'classic'])
    for (const bitcoin of [true, false]) variants.push({ comfort, style, bitcoin })

describe('stageFor', () => {
  it('maps years left to a stage', () => {
    expect(stageFor(28, 65)).toBe('building')
    expect(stageFor(55, 65)).toBe('close')
    expect(stageFor(64, 65)).toBe('close')
    expect(stageFor(65, 65)).toBe('retired')
    expect(stageFor(80, 65)).toBe('retired')
  })
})

describe('mixFor', () => {
  it('base mixes add to 100', () => {
    for (const s of stages) expect(Object.values(BASE_MIX[s]).reduce((a, b) => a + b, 0)).toBe(100)
  })
  it('every setting adds to 100 with no negatives', () => {
    for (const s of stages)
      for (const v of variants) {
        const m = mixFor(s, v)
        expect(sumMix(m)).toBe(100)
        for (const k of ASSET_ORDER) expect(m[k]).toBeGreaterThanOrEqual(0)
      }
  })
  it('classic style holds only stocks, bonds and cash', () => {
    const m = mixFor('building', { style: 'classic' })
    expect(m.btc + m.gold + m.reit).toBe(0)
    expect(m.bonds).toBe(15)
  })
  it('bitcoin off moves bitcoin into stocks', () => {
    const on = mixFor('building', { bitcoin: true })
    const off = mixFor('building', { bitcoin: false })
    expect(off.btc).toBe(0)
    expect(off.us + off.intl).toBe(on.us + on.intl + on.btc)
  })
  it('bolder never drops bonds below 5', () => {
    expect(mixFor('building', { comfort: 'bolder' }).bonds).toBe(5)
  })
  it('steadier is safer than bolder', () => {
    expect(blendedReturn(mixFor('building', { comfort: 'steadier' }))).toBeLessThan(
      blendedReturn(mixFor('building', { comfort: 'bolder' })),
    )
  })
})

describe('crashLoss', () => {
  it('a retired mix loses less than a building mix in 2008', () => {
    const c = crashById('2008')
    expect(crashLoss(mixFor('retired'), c)).toBeGreaterThan(crashLoss(mixFor('building'), c))
    expect(crashLoss(mixFor('building'), c)).toBeLessThan(0)
  })
})

describe('rebalancePlan', () => {
  const mix = mixFor('building')
  it('flags nothing when on target', () => {
    const bal = {}
    for (const k of ASSET_ORDER) bal[k] = mix[k] * 1000
    const p = rebalancePlan(bal, mix)
    expect(p.needsRebalance).toBe(false)
    for (const r of p.rows) expect(Math.abs(r.change)).toBeLessThan(1e-6)
  })
  it('flags a big drift and trades sum to zero', () => {
    const bal = { us: 70000, intl: 10000, btc: 10000, gold: 5000, reit: 0, bonds: 5000, cash: 0 }
    const p = rebalancePlan(bal, mix)
    expect(p.needsRebalance).toBe(true)
    const net = p.rows.reduce((t, r) => t + r.change, 0)
    expect(Math.abs(net)).toBeLessThan(1e-6)
  })
  it('handles an empty portfolio', () => {
    const p = rebalancePlan({}, mix)
    expect(p.total).toBe(0)
    expect(p.needsRebalance).toBe(false)
  })
})

describe('splitNewMoney', () => {
  const mix = mixFor('building')
  it('spends exactly the new money and never sells', () => {
    const bal = { us: 70000, intl: 10000, btc: 10000, gold: 5000, reit: 0, bonds: 5000, cash: 0 }
    for (const amt of [100, 5000, 1e6]) {
      const s = splitNewMoney(bal, mix, amt)
      const sum = ASSET_ORDER.reduce((t, k) => t + s[k], 0)
      expect(sum).toBeCloseTo(amt, 6)
      for (const k of ASSET_ORDER) expect(s[k]).toBeGreaterThanOrEqual(0)
    }
  })
  it('sends small amounts only to underweight assets', () => {
    const bal = { us: 70000, intl: 10000, btc: 10000, gold: 5000, reit: 0, bonds: 5000, cash: 0 }
    const s = splitNewMoney(bal, mix, 1000)
    expect(s.us).toBe(0)
    expect(s.btc).toBe(0)
    expect(s.bonds).toBeGreaterThan(0)
  })
})

describe('project', () => {
  const base = { age: 30, retireAge: 65, savings: 50000, monthly: 1000, spending: 60000, otherIncome: 20000 }
  it('orders low < mid < high', () => {
    const p = project(base)
    expect(p.low.atRetire).toBeLessThan(p.mid.atRetire)
    expect(p.mid.atRetire).toBeLessThan(p.high.atRetire)
  })
  it('stress test ends lower than the middle line', () => {
    const p = project(base)
    expect(p.stress.end).toBeLessThan(p.mid.end)
  })
  it('flags running out of money', () => {
    const p = project({ ...base, savings: 0, monthly: 0, spending: 80000, otherIncome: 0 })
    expect(p.mid.runOut).toBe(65)
  })
  it('uses the 4% rule for the FI number', () => {
    expect(fiNumber(40000)).toBe(1000000)
    expect(project(base).fi).toBe(1000000)
  })
})

describe('currentStep', () => {
  it('returns the first unchecked step', () => {
    expect(currentStep({}).id).toBe('budget')
    expect(currentStep({ budget: true, starter: true }).id).toBe('match')
  })
})
