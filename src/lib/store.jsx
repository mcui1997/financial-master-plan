// One shared plan, saved only in this browser.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ASSET_ORDER } from '../config.js'
import { DEFAULT_SETTINGS } from './model.js'

const KEY = 'fmp:v1'

export const DEFAULT_STATE = {
  path: null,
  profile: { age: 30, retireAge: 65 },
  settings: { ...DEFAULT_SETTINGS },
  money: { savings: 25000, monthly: 500, spending: 50000, otherIncome: 20000, planTo: 95 },
  paycheck: { amount: 500 },
  balances: Object.fromEntries(ASSET_ORDER.map((k) => [k, 0])),
  newMoney: 0,
  done: {},
  checklist: {},
  read: {},
}

function clampNum(v, min, max, fallback) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

// Accept only known keys and sane values, so a bad import can't break the site.
export function sanitize(raw) {
  const s = structuredClone(DEFAULT_STATE)
  if (!raw || typeof raw !== 'object') return s
  if (['starting', 'building', 'close', 'retired'].includes(raw.path)) s.path = raw.path
  const p = raw.profile || {}
  s.profile.age = Math.round(clampNum(p.age, 16, 100, s.profile.age))
  s.profile.retireAge = Math.round(clampNum(p.retireAge, 30, 100, s.profile.retireAge))
  const st = raw.settings || {}
  if (['steadier', 'standard', 'bolder'].includes(st.comfort)) s.settings.comfort = st.comfort
  if (['master', 'classic'].includes(st.style)) s.settings.style = st.style
  if (typeof st.bitcoin === 'boolean') s.settings.bitcoin = st.bitcoin
  const m = raw.money || {}
  for (const k of ['savings', 'monthly', 'spending', 'otherIncome'])
    s.money[k] = clampNum(m[k], 0, 1e10, s.money[k])
  s.money.planTo = Math.round(clampNum(m.planTo, 70, 110, s.money.planTo))
  s.paycheck.amount = clampNum(raw.paycheck?.amount, 0, 1e8, s.paycheck.amount)
  for (const k of ASSET_ORDER) s.balances[k] = clampNum(raw.balances?.[k], 0, 1e11, 0)
  s.newMoney = clampNum(raw.newMoney, 0, 1e10, 0)
  for (const group of ['done', 'checklist', 'read']) {
    const src = raw[group]
    if (src && typeof src === 'object')
      for (const [k, v] of Object.entries(src))
        if (/^[a-z0-9-]{1,40}$/.test(k) && v === true) s[group][k] = true
  }
  return s
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? sanitize(JSON.parse(raw)) : structuredClone(DEFAULT_STATE)
  } catch {
    return structuredClone(DEFAULT_STATE)
  }
}

const Ctx = createContext(null)

export function PlanProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* private mode or storage full: the site still works, it just won't remember */
    }
  }, [state])

  // update('money.savings', 1000) or update('settings', {...})
  const update = useCallback((path, value) => {
    setState((prev) => {
      const next = structuredClone(prev)
      const parts = path.split('.')
      let o = next
      for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]]
      const last = parts[parts.length - 1]
      o[last] = typeof value === 'function' ? value(o[last]) : value
      return next
    })
  }, [])

  const replace = useCallback((raw) => setState(sanitize(raw)), [])
  const reset = useCallback(() => setState(structuredClone(DEFAULT_STATE)), [])

  const api = useMemo(() => ({ state, update, replace, reset }), [state, update, replace, reset])
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function usePlan() {
  return useContext(Ctx)
}
