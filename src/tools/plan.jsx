// Tools that read and write the shared plan.
import { useMemo } from 'react'
import { ASSETS, ASSET_ORDER, CRASHES, LIMITS, LIMITS_YEAR } from '../config.js'
import { LineChart } from '../components/LineChart.jsx'
import { Callout, Donut, MixBar, MixLegend, Money, Segmented, Slider, Stat, Toggle } from '../components/ui.jsx'
import { pct, signedPct, usd, usdShort } from '../lib/format.js'
import {
  NEXT_DOLLAR_STEPS, STAGES, blendedReturn, bucketsOf, crashLoss, currentStep, mixFor, project,
  rebalancePlan, splitAmount, splitNewMoney, stageFor,
} from '../lib/model.js'
import { usePlan } from '../lib/store.jsx'
import { href } from '../lib/router.js'

export function usePlanMix() {
  const { state } = usePlan()
  const { age, retireAge } = state.profile
  const stage = stageFor(age, retireAge)
  const mix = useMemo(() => mixFor(stage, state.settings), [stage, state.settings])
  return { stage, mix, settings: state.settings }
}

// ---------- Next dollar ----------

export function NextDollarTool() {
  const { state, update } = usePlan()
  const step = currentStep(state.done)
  return (
    <div className="nextdollar">
      <ol className="steps-list">
        {NEXT_DOLLAR_STEPS.map((s, i) => {
          const done = !!state.done[s.id]
          const isNow = step && step.id === s.id
          return (
            <li key={s.id} className={`${done ? 'done' : ''} ${isNow ? 'now' : ''}`}>
              <label>
                <input type="checkbox" checked={done} onChange={(e) => update(`done.${s.id}`, e.target.checked)} />
                <span className="step-num" aria-hidden="true">{i + 1}</span>
                <span>
                  <strong>{s.title}</strong>
                  <span className="muted block small">{s.ask}</span>
                </span>
                {isNow && <span className="badge">You are here</span>}
              </label>
            </li>
          )
        })}
      </ol>
      {step ? (
        <Callout tone="info" title={`Your next step: ${step.title}`}>
          <NextDollarAdvice id={step.id} /> <a href={href(`learn/${step.chapter}`)}>Read more</a>
        </Callout>
      ) : (
        <Callout tone="good" title="Every step is done">
          Keep investing in your mix, rebalance once a year, and enjoy the boring part.
        </Callout>
      )}
    </div>
  )
}

function NextDollarAdvice({ id }) {
  const text = {
    budget: 'Add up what comes in and what goes out each month. Ten minutes with last month\'s statements is enough.',
    starter: 'Save one month of expenses in a high-yield savings account. Set up an automatic transfer on payday.',
    match: 'Raise your 401(k) contribution to at least the percent your employer matches. It is free money.',
    debt: 'Throw every extra dollar at debt above about 8% interest, starting with the highest rate.',
    emergency: 'Grow your cushion to 3 to 6 months of must-pay costs.',
    hsa: `If you have a high-deductible health plan, fund your HSA. The ${LIMITS_YEAR} limit is ${usd(LIMITS.hsaSelf)} for yourself or ${usd(LIMITS.hsaFamily)} for a family.`,
    ira: `Open a Roth or traditional IRA and fill it. The ${LIMITS_YEAR} limit is ${usd(LIMITS.ira)}.`,
    max401k: `Raise your 401(k) toward the ${LIMITS_YEAR} limit of ${usd(LIMITS.k401)}.`,
    taxable: 'Open a regular brokerage account and invest extra money in the same mix.',
  }
  return text[id]
}

// ---------- Mix builder ----------

export function MixTool() {
  const { state, update } = usePlan()
  const { stage, mix } = usePlanMix()
  const { age, retireAge } = state.profile
  const b = bucketsOf(mix)
  const ret = blendedReturn(mix)
  const worst = Math.min(...CRASHES.map((c) => crashLoss(mix, c)))
  return (
    <div className="tool-grid">
      <div className="tool-inputs">
        <Slider label="Your age" value={age} onChange={(v) => update('profile.age', v)} min={18} max={95} />
        <Slider
          label="Age you plan to retire"
          value={retireAge}
          onChange={(v) => update('profile.retireAge', v)}
          min={35}
          max={80}
          hint={age >= retireAge ? 'You are retired, or past this age.' : `${retireAge - age} years to go`}
        />
        <Segmented
          label="Comfort with ups and downs"
          value={state.settings.comfort}
          onChange={(v) => update('settings.comfort', v)}
          options={[
            { value: 'steadier', label: 'Steadier' },
            { value: 'standard', label: 'Standard' },
            { value: 'bolder', label: 'Bolder' },
          ]}
        />
        <Segmented
          label="Style"
          value={state.settings.style}
          onChange={(v) => update('settings.style', v)}
          options={[
            { value: 'master', label: 'Master plan' },
            { value: 'classic', label: 'Classic' },
          ]}
        />
        {state.settings.style === 'master' && (
          <Toggle label="Include a small Bitcoin slice" checked={state.settings.bitcoin} onChange={(v) => update('settings.bitcoin', v)} />
        )}
        <p className="muted small">
          {state.settings.style === 'classic'
            ? 'Classic holds only stocks, bonds, and cash. A proven, simpler plan.'
            : 'Master plan adds gold, REITs, and a little Bitcoin as hedges against inflation.'}
        </p>
      </div>
      <div className="tool-output">
        <div className="donut-wrap">
          <Donut mix={mix} size={190} />
          <div className="donut-center">
            <span className="muted small">Stage</span>
            <strong>{STAGES[stage].name}</strong>
          </div>
        </div>
        <MixLegend mix={mix} />
        <div className="jobs">
          <span><b>Grow</b> {pct(b.grow)}</span>
          <span><b>Hedge</b> {pct(b.hedge)}</span>
          <span><b>Protect</b> {pct(b.protect)}</span>
        </div>
        <p className="small">
          Expected growth after inflation: about <strong>{pct(ret, 1)} a year</strong>. In the worst of three past crashes, this mix would
          have dropped about <strong>{pct(Math.abs(worst))}</strong>.
        </p>
      </div>
    </div>
  )
}

// ---------- Paycheck splitter ----------

export function PaycheckTool() {
  const { state, update } = usePlan()
  const { mix } = usePlanMix()
  const amount = state.paycheck.amount
  const split = splitAmount(mix, amount)
  return (
    <div className="tool-grid">
      <div className="tool-inputs">
        <Money label="Amount you invest each payday" value={amount} onChange={(v) => update('paycheck.amount', v)} />
        <p className="muted small">
          Uses your mix from the mix builder. Change your age or settings there and this updates.
        </p>
        <MixBar mix={mix} />
      </div>
      <div className="tool-output">
        <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Fund</th>
              <th className="num">Each payday</th>
            </tr>
          </thead>
          <tbody>
            {ASSET_ORDER.filter((k) => mix[k] > 0).map((k) => (
              <tr key={k}>
                <td>
                  <span className="swatch" style={{ background: ASSETS[k].color }} aria-hidden="true"></span>
                  {ASSETS[k].name} <span className="muted">{pct(mix[k])}</span>
                </td>
                <td>{ASSETS[k].ticker}</td>
                <td className="num">{usd(split[k])}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <p className="muted small">
          Small amounts? Many brokerages let you buy fractional shares, so even $5 works. In a 401(k), set the same percents as your
          contribution split.
        </p>
      </div>
    </div>
  )
}

// ---------- Rebalance ----------

export function RebalanceTool() {
  const { state, update } = usePlan()
  const { mix } = usePlanMix()
  const plan = rebalancePlan(state.balances, mix)
  const newMoney = state.newMoney
  const steer = newMoney > 0 ? splitNewMoney(state.balances, mix, newMoney) : null
  const keys = ASSET_ORDER.filter((k) => mix[k] > 0 || state.balances[k] > 0)
  return (
    <div>
      <p className="small">Add up each asset across all your accounts and enter the totals.</p>
      <div className="balance-grid">
        {keys.map((k) => (
          <Money key={k} label={`${ASSETS[k].name} (${ASSETS[k].ticker})`} value={state.balances[k]} onChange={(v) => update(`balances.${k}`, v)} />
        ))}
      </div>
      {plan.total > 0 ? (
        <>
          <Callout tone={plan.needsRebalance ? 'warn' : 'good'} title={plan.needsRebalance ? 'Time to rebalance' : 'You are within range'}>
            {plan.needsRebalance
              ? 'At least one slice has drifted past its limit. The "change" column shows how to get back to target.'
              : 'Nothing has drifted past its limit. No action needed. That is a normal year.'}
          </Callout>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th className="num">Now</th>
                  <th className="num">Target</th>
                  <th className="num hide-sm">Drift</th>
                  <th className="num">Change</th>
                </tr>
              </thead>
              <tbody>
                {plan.rows.map((r) => (
                  <tr key={r.key} className={r.outOfRange ? 'flag' : ''}>
                    <td>
                      <span className="swatch" style={{ background: ASSETS[r.key].color }} aria-hidden="true"></span>
                      {ASSETS[r.key].short}
                    </td>
                    <td className="num">{pct(r.currentPct)}</td>
                    <td className="num">{pct(r.targetPct)}</td>
                    <td className="num hide-sm">
                      {signedPct(r.drift, 1)}
                      {r.outOfRange && <span className="sr-only"> (past the limit)</span>}
                    </td>
                    <td className="num">
                      {Math.abs(r.change) < 1 ? '–' : r.change > 0 ? `Buy ${usd(r.change)}` : `Sell ${usd(-r.change)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small">
            Total {usd(plan.total)}. Limit: 5 points, or half the target for small slices. Rows past the limit are highlighted.
          </p>
          <h4>Or steer new money instead (no selling)</h4>
          <div className="tool-grid">
            <div className="tool-inputs">
              <Money label="New money to invest" value={newMoney} onChange={(v) => update('newMoney', v)} hint="Best for taxable accounts, where selling can trigger tax." />
            </div>
            <div className="tool-output">
              {steer ? (
                <ul className="legend">
                  {ASSET_ORDER.filter((k) => steer[k] >= 1).map((k) => (
                    <li key={k}>
                      <span className="swatch" style={{ background: ASSETS[k].color }} aria-hidden="true"></span>
                      <span className="legend-name">{ASSETS[k].name}</span>
                      <span className="legend-amt">{usd(steer[k])}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted small">Enter an amount to see where it should go.</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="muted small">Enter your balances to see how your mix compares to the target.</p>
      )}
    </div>
  )
}

// ---------- Crash simulator ----------

export function CrashTool() {
  const { state, update } = usePlan()
  const { mix } = usePlanMix()
  const amount = state.money.savings
  const stocksOnly = { us: 70, intl: 30, btc: 0, gold: 0, reit: 0, bonds: 0, cash: 0 }
  const retiredMix = mixFor('retired', state.settings)
  return (
    <div>
      <div className="tool-grid">
        <div className="tool-inputs">
          <Money label="Amount invested" value={amount} onChange={(v) => update('money.savings', v)} />
          <p className="muted small">Uses your mix from the mix builder. Figures are rough, rounded, and show each event's drop.</p>
        </div>
        <div className="tool-output">
          <MixBar mix={mix} />
          <MixLegend mix={mix} />
        </div>
      </div>
      <div className="crash-cards">
        {CRASHES.map((c) => {
          const yours = crashLoss(mix, c)
          const stocks = crashLoss(stocksOnly, c)
          const ret = crashLoss(retiredMix, c)
          const maxAbs = Math.max(Math.abs(stocks), Math.abs(yours), Math.abs(ret), 1)
          return (
            <article key={c.id} className="crash-card">
              <h4>{c.name}</h4>
              <p className="muted small">{c.window}</p>
              <Bar label="Your mix" value={yours} max={maxAbs} color="var(--accent)" />
              <Bar label="Retired mix" value={ret} max={maxAbs} color="var(--protect)" />
              <Bar label="Stocks only" value={stocks} max={maxAbs} color="var(--bad)" />
              <p className="small">
                {usd(amount)} would have become <strong>{usd(amount * (1 + yours / 100))}</strong>, a {yours < 0 ? 'drop' : 'change'} of{' '}
                {usd(Math.abs((amount * yours) / 100))}.
              </p>
              <p className="muted small">{c.recovery}</p>
              <p className="muted small">{c.note}</p>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function Bar({ label, value, max, color }) {
  const w = (Math.abs(value) / max) * 100
  return (
    <div className="hbar">
      <span className="hbar-label">{label}</span>
      <span className="hbar-track">
        <span className="hbar-fill" style={{ width: `${w}%`, background: value < 0 ? color : 'var(--good)' }}></span>
      </span>
      <span className="hbar-num">{signedPct(value)}</span>
    </div>
  )
}

// ---------- Retirement planner ----------

export function RetirementTool({ compact = false }) {
  const { state, update } = usePlan()
  const { age, retireAge } = state.profile
  const m = state.money
  const p = useMemo(
    () => project({ age, retireAge, ...m }, state.settings),
    [age, retireAge, m, state.settings],
  )
  const stress = !!state.checklist['ui-stress']
  const retiredMix = mixFor('retired', state.settings)
  const isRetired = age >= retireAge
  const balRetire = isRetired ? m.savings : p.mid.atRetire

  const verdict = (() => {
    if (p.need === 0) return { tone: 'good', title: 'Your other income covers your spending', text: 'Your savings are a cushion. Nice spot to be in.' }
    const run = stress ? p.stress : p.low
    if (!p.mid.runOut && !run.runOut)
      return { tone: 'good', title: 'On track', text: `Even the ${stress ? 'rough start' : 'low'} path lasts past age ${m.planTo}.` }
    if (!p.mid.runOut)
      return {
        tone: 'warn',
        title: 'Likely OK, with some risk',
        text: `The middle path lasts past ${m.planTo}, but the ${stress ? 'rough start' : 'low'} path runs out around age ${run.runOut}. Saving a bit more or retiring a bit later would add a margin of safety.`,
      }
    return {
      tone: 'bad',
      title: 'Not on track yet',
      text: `The middle path runs out around age ${p.mid.runOut}. Try saving more, retiring later, or planning to spend less. Small changes add up.`,
    }
  })()

  const series = [
    { id: 'high', label: 'High', color: '#7fb39a', dash: '4 4', width: 1.5, points: p.high.points.map((q) => ({ x: q.age, y: q.value })) },
    { id: 'mid', label: 'Middle', color: 'var(--accent)', points: p.mid.points.map((q) => ({ x: q.age, y: q.value })) },
    { id: 'low', label: 'Low', color: 'var(--bad)', dash: '4 4', width: 1.5, points: p.low.points.map((q) => ({ x: q.age, y: q.value })) },
  ]
  if (stress) series.push({ id: 'stress', label: 'Rough start', color: 'var(--warn)', width: 2.5, points: p.stress.points.map((q) => ({ x: q.age, y: q.value })) })

  return (
    <div>
      <div className="tool-grid">
        <div className="tool-inputs">
          <Slider label="Your age" value={age} onChange={(v) => update('profile.age', v)} min={18} max={95} />
          <Slider label="Retire at" value={retireAge} onChange={(v) => update('profile.retireAge', v)} min={35} max={80} />
          <Money label="Invested today" value={m.savings} onChange={(v) => update('money.savings', v)} hint="All retirement and brokerage accounts. Not your emergency fund." />
          {!isRetired && <Money label="You add each month" value={m.monthly} onChange={(v) => update('money.monthly', v)} hint="Include any employer match." />}
          <Money label="Yearly spending in retirement" value={m.spending} onChange={(v) => update('money.spending', v)} hint="In today's dollars. Many people use 70% to 80% of their current spending." />
          <Money label="Yearly Social Security, pension, other" value={m.otherIncome} onChange={(v) => update('money.otherIncome', v)} hint="Get your estimate at ssa.gov." />
          {!compact && <Slider label="Plan to age" value={m.planTo} onChange={(v) => update('money.planTo', v)} min={80} max={105} />}
          <Toggle
            label="Rough start: a 2008-style crash the year you retire"
            checked={stress}
            onChange={(v) => update('checklist.ui-stress', v || undefined)}
          />
        </div>
        <div className="tool-output">
          <Callout tone={verdict.tone} title={verdict.title}>
            {verdict.text}
          </Callout>
          <Stat label="Needed from savings each year" value={usd(p.need)} sub="spending minus other income" />
          <Stat label="Your FI number" value={usd(p.fi)} sub="yearly need × 25 (the 4% rule)" />
          <Stat label={isRetired ? 'Invested today' : `Projected at ${retireAge}`} value={usdShort(balRetire)} sub={isRetired ? '' : `range ${usdShort(p.low.atRetire)} to ${usdShort(p.high.atRetire)}`} />
        </div>
      </div>
      <LineChart
        ariaLabel="Projected savings by age"
        xLabel={(x) => `${x}`}
        marker={retireAge}
        markerLabel="Retire"
        series={series}
      />
      <p className="muted small">
        All figures are in today's dollars, after inflation. The middle line assumes about {pct(blendedReturn(mixFor(stageFor(age, retireAge), state.settings)), 1)} a year
        now, shifting to {pct(blendedReturn(retiredMix), 1)} in retirement. Low and high are 2 points lower and higher. Estimates only.
      </p>
      {!compact && p.need > 0 && <Buckets balance={balRetire} need={p.need} mix={retiredMix} />}
    </div>
  )
}

function Buckets({ balance, need, mix }) {
  const cash = (balance * mix.cash) / 100
  const bonds = (balance * mix.bonds) / 100
  const growth = balance - cash - bonds
  const y = (v) => (need > 0 ? (v / need).toFixed(1) : '–')
  return (
    <div className="buckets">
      <h4>Your buckets at retirement</h4>
      <p className="small">Using the retired mix on your projected balance:</p>
      <div className="bucket-row">
        <div className="bucket cash">
          <span className="bucket-name">Cash</span>
          <strong>{usdShort(cash)}</strong>
          <span className="small">{y(cash)} years of spending</span>
        </div>
        <div className="bucket bonds">
          <span className="bucket-name">Bonds</span>
          <strong>{usdShort(bonds)}</strong>
          <span className="small">{y(bonds)} more years</span>
        </div>
        <div className="bucket growth">
          <span className="bucket-name">Growth and hedge</span>
          <strong>{usdShort(growth)}</strong>
          <span className="small">for the long run</span>
        </div>
      </div>
      <p className="muted small">Aim for about 2 years in cash and 7 or more in cash plus bonds. Refill cash once a year from whatever is up.</p>
    </div>
  )
}

