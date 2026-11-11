import { useRef, useState } from 'react'
import { ASSETS, ASSET_ORDER, LAST_UPDATED } from '../config.js'
import { Callout, Donut, MixLegend } from '../components/ui.jsx'
import { pct, usd } from '../lib/format.js'
import { NEXT_DOLLAR_STEPS, STAGES, bucketsOf, currentStep, splitAmount } from '../lib/model.js'
import { href } from '../lib/router.js'
import { usePlan } from '../lib/store.jsx'
import { RetirementTool, usePlanMix } from '../tools/plan.jsx'

export const SETUP = [
  { id: 'hysa', text: 'Open a high-yield savings account for your emergency fund' },
  { id: 'auto-save', text: 'Set an automatic transfer to savings on payday' },
  { id: 'k401-match', text: 'Set your 401(k) contribution to get the full match' },
  { id: 'k401-funds', text: 'Pick your 401(k) funds, for new and existing money' },
  { id: 'ira-open', text: 'Open a Roth or traditional IRA' },
  { id: 'ira-invested', text: 'Buy funds with the cash in your IRA (it does not invest itself)' },
  { id: 'auto-invest', text: 'Turn on automatic deposits and investing' },
  { id: 'drip', text: 'Turn on dividend reinvestment' },
  { id: 'beneficiaries', text: 'Name a beneficiary on every account' },
  { id: 'insurance', text: 'Check health, disability, and (if needed) life insurance' },
  { id: 'will', text: 'Make a simple will and power of attorney' },
  { id: 'note', text: 'Write your "if something happens" note' },
  { id: 'reminder', text: 'Put a yearly "Money check-up" on your calendar' },
]

export const YEARLY = [
  'Add up every account and run the rebalance calculator',
  'Rebalance anything past its limit',
  'Raise your savings rate if you can',
  'Check if your life stage changed',
  'Check this year\'s contribution limits',
  'Look over your beneficiaries',
]

export function MyPlan() {
  const { state, update, replace, reset } = usePlan()
  const { stage, mix } = usePlanMix()
  const step = currentStep(state.done)
  const stepIndex = step ? NEXT_DOLLAR_STEPS.indexOf(step) + 1 : NEXT_DOLLAR_STEPS.length
  const b = bucketsOf(mix)
  const split = splitAmount(mix, state.paycheck.amount)
  const setupDone = SETUP.filter((s) => state.checklist[s.id]).length
  const file = useRef(null)
  const [msg, setMsg] = useState('')

  function exportPlan() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `my-money-plan-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    setMsg('Saved a copy to your downloads.')
  }

  function importPlan(e) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 200000) {
      setMsg('That file is too large to be a plan file.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        replace(JSON.parse(reader.result))
        setMsg('Plan loaded.')
      } catch {
        setMsg('That file could not be read. Is it a plan file saved from this site?')
      }
    }
    reader.readAsText(f)
    e.target.value = ''
  }

  return (
    <div className="wrap page myplan">
      <div className="myplan-head">
        <div>
          <h1>My Plan</h1>
          <p className="lead">Everything you've entered, on one page. Change anything in the tools and it updates here.</p>
        </div>
        <div className="myplan-actions no-print">
          <button type="button" className="btn" onClick={() => window.print()}>Print</button>
          <button type="button" className="btn" onClick={exportPlan}>Save a copy</button>
          <button type="button" className="btn" onClick={() => file.current?.click()}>Load a copy</button>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={importPlan} />
        </div>
      </div>
      {msg && <p className="small" role="status">{msg}</p>}

      <div className="plan-grid">
        <section className="card">
          <h2>Your next step</h2>
          <p className="muted small">Step {stepIndex} of {NEXT_DOLLAR_STEPS.length}</p>
          {step ? (
            <>
              <p className="big">{step.title}</p>
              <a href={href('tools/next-dollar')} className="small">Update your progress</a>
            </>
          ) : (
            <p className="big">All steps done. Keep it going.</p>
          )}
        </section>

        <section className="card">
          <h2>Your stage</h2>
          <p className="big">{STAGES[stage].name}</p>
          <p className="muted small">
            Age {state.profile.age}, retiring at {state.profile.retireAge}. {STAGES[stage].blurb}.
          </p>
          <a href={href('tools/mix')} className="small">Change age or comfort</a>
        </section>

        <section className="card wide">
          <h2>Your target mix</h2>
          <div className="mix-row">
            <Donut mix={mix} size={170} />
            <div className="grow1">
              <MixLegend mix={mix} />
              <div className="jobs">
                <span><b>Grow</b> {pct(b.grow)}</span>
                <span><b>Hedge</b> {pct(b.hedge)}</span>
                <span><b>Protect</b> {pct(b.protect)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="card wide">
          <h2>Each payday</h2>
          <p className="muted small">Investing {usd(state.paycheck.amount)} per paycheck.</p>
          <ul className="pay-list">
            {ASSET_ORDER.filter((k) => mix[k] > 0).map((k) => (
              <li key={k}>
                <span className="swatch" style={{ background: ASSETS[k].color }} aria-hidden="true"></span>
                {usd(split[k])} <span className="muted">to {ASSETS[k].ticker}</span>
              </li>
            ))}
          </ul>
          <a href={href('tools/paycheck')} className="small">Change the amount</a>
        </section>

        <section className="card wide">
          <h2>Retirement</h2>
          <RetirementTool compact />
        </section>

        <section className="card">
          <h2>One-time setup</h2>
          <p className="muted small">
            {setupDone} of {SETUP.length} done. <a href={href('learn/do-it')}>How to do each one</a>
          </p>
          <ul className="checklist">
            {SETUP.map((s) => (
              <li key={s.id}>
                <label>
                  <input type="checkbox" checked={!!state.checklist[s.id]} onChange={(e) => update(`checklist.${s.id}`, e.target.checked || undefined)} />
                  <span>{s.text}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>Once a year</h2>
          <p className="muted small">Pick a date, like your birthday. About an hour.</p>
          <ol className="yearly">
            {YEARLY.map((y) => (
              <li key={y}>{y}</li>
            ))}
          </ol>
          <a href={href('tools/rebalance')} className="small">Open the rebalance calculator</a>
        </section>
      </div>

      <Callout tone="info" title="About this page">
        Your plan is saved only in this browser. Clearing your browser data erases it, so use "Save a copy" now and then. Figures are
        estimates based on the assumptions on the <a href={href('about')}>assumptions page</a> (last updated {LAST_UPDATED}). This is for
        learning, not personal advice.
      </Callout>
      <p className="no-print">
        <button
          type="button"
          className="btn danger"
          onClick={() => {
            if (window.confirm('Erase everything you entered on this site? This cannot be undone.')) reset()
          }}
        >
          Start over
        </button>
      </p>
    </div>
  )
}
