// The small calculators that live inside the early chapters.
import { useState } from 'react'
import { LineChart } from '../components/LineChart.jsx'
import { Callout, Money, Slider, Stat } from '../components/ui.jsx'
import { pct, usd, usdShort } from '../lib/format.js'

export function InflationTool() {
  const [amount, setAmount] = useState(10000)
  const [years, setYears] = useState(20)
  const [rate, setRate] = useState(3)
  const worth = amount / (1 + rate / 100) ** years
  const lost = amount - worth
  return (
    <div className="tool-grid">
      <div className="tool-inputs">
        <Money label="Cash you keep" value={amount} onChange={setAmount} />
        <Slider label="Years" value={years} onChange={setYears} min={1} max={40} />
        <Slider label="Inflation per year" value={rate} onChange={setRate} min={1} max={8} step={0.5} format={(v) => pct(v, 1)} hint="The long-run US average is about 3%." />
      </div>
      <div className="tool-output">
        <Stat label={`What ${usd(amount)} will buy in ${years} years`} value={usd(worth)} sub="in today's money" />
        <Stat label="Buying power lost" value={usd(lost)} sub={`${pct((lost / amount) * 100)} of its value`} tone="bad" />
        <p className="muted small">The number in your account would still say {usd(amount)}. It just buys less.</p>
      </div>
    </div>
  )
}

export function CompoundTool() {
  const [start, setStart] = useState(1000)
  const [monthly, setMonthly] = useState(200)
  const [years, setYears] = useState(30)
  const [rate, setRate] = useState(7)
  const points = []
  const paid = []
  let bal = start
  for (let y = 0; y <= years; y++) {
    points.push({ x: y, y: bal })
    paid.push({ x: y, y: start + monthly * 12 * y })
    bal = bal * (1 + rate / 100) + monthly * 12
  }
  const end = points[points.length - 1].y
  const put = paid[paid.length - 1].y
  return (
    <div>
      <div className="tool-grid">
        <div className="tool-inputs">
          <Money label="Start with" value={start} onChange={setStart} />
          <Money label="Add each month" value={monthly} onChange={setMonthly} />
          <Slider label="Years" value={years} onChange={setYears} min={1} max={50} />
          <Slider label="Yearly growth" value={rate} onChange={setRate} min={1} max={10} step={0.5} format={(v) => pct(v, 1)} hint="7% is roughly the long-run stock return after inflation. A mix grows slower." />
        </div>
        <div className="tool-output">
          <Stat label="You end with" value={usd(end)} />
          <Stat label="You put in" value={usd(put)} />
          <Stat label="Growth did the rest" value={usd(end - put)} sub={end > 0 ? `${pct(((end - put) / end) * 100)} of the total` : ''} tone="good" />
        </div>
      </div>
      <LineChart
        ariaLabel="Growth of savings over time"
        xLabel={(x) => `Yr ${x}`}
        series={[
          { id: 'total', label: 'Total value', color: 'var(--accent)', points },
          { id: 'paid', label: 'What you put in', color: 'var(--muted)', dash: '5 4', points: paid },
        ]}
        fill={{ from: 1, to: 0, color: 'var(--accent)' }}
      />
    </div>
  )
}

export function SavingsRateTool() {
  const [income, setIncome] = useState(4500)
  const [fixed, setFixed] = useState(2200)
  const [flex, setFlex] = useState(1500)
  const left = income - fixed - flex
  const rate = income > 0 ? (left / income) * 100 : 0
  let tone = 'good'
  let note = 'Strong. This can mean retiring earlier or with more room.'
  if (left < 0) {
    tone = 'bad'
    note = 'You are spending more than you earn. Start by finding the biggest cost you can cut.'
  } else if (rate < 5) {
    tone = 'bad'
    note = 'A start. Look for one big cost to cut or one way to earn more.'
  } else if (rate < 15) {
    tone = ''
    note = 'Good progress. Work toward 15% over time, one step at a time.'
  } else if (rate < 20) {
    note = 'Solid. This is a common target for a normal retirement.'
  }
  return (
    <div className="tool-grid">
      <div className="tool-inputs">
        <Money label="Take-home pay per month" value={income} onChange={setIncome} />
        <Money label="Fixed costs per month" value={fixed} onChange={setFixed} hint="Rent, utilities, car, insurance, minimum debt payments" />
        <Money label="Flexible spending per month" value={flex} onChange={setFlex} hint="Food, gas, shopping, fun. Check last month's statements." />
      </div>
      <div className="tool-output">
        <Stat label="Left to save each month" value={usd(left)} tone={left < 0 ? 'bad' : ''} />
        <Stat label="Your savings rate" value={pct(Math.max(-100, rate))} tone={tone} />
        <p className="small">{note}</p>
      </div>
    </div>
  )
}

export function EmergencyTool() {
  const [costs, setCosts] = useState(3000)
  const [months, setMonths] = useState(4)
  const [have, setHave] = useState(2000)
  const target = costs * months
  const gap = Math.max(0, target - have)
  const [save, setSave] = useState(400)
  const monthsToGo = save > 0 ? Math.ceil(gap / save) : null
  return (
    <div className="tool-grid">
      <div className="tool-inputs">
        <Money label="Must-pay costs per month" value={costs} onChange={setCosts} hint="Fixed costs plus basic food and gas" />
        <Slider label="Months of cushion" value={months} onChange={setMonths} min={1} max={12} hint="3 for a stable two-income home. 6 or more if your income is uncertain." />
        <Money label="Saved so far" value={have} onChange={setHave} />
        <Money label="You can add each month" value={save} onChange={setSave} />
      </div>
      <div className="tool-output">
        <Stat label="Your target" value={usd(target)} />
        <Stat label="Still to save" value={usd(gap)} tone={gap === 0 ? 'good' : ''} />
        {gap === 0 ? (
          <Callout tone="good">You're fully covered. Move on to the next step.</Callout>
        ) : monthsToGo ? (
          <p className="small">
            At {usd(save)} a month, you'll get there in about <strong>{monthsToGo} months</strong>.
          </p>
        ) : (
          <p className="small">Even a small automatic transfer gets you moving.</p>
        )}
      </div>
    </div>
  )
}

export function FeesTool() {
  const [start, setStart] = useState(50000)
  const [monthly, setMonthly] = useState(500)
  const [years, setYears] = useState(30)
  const [feeHigh, setFeeHigh] = useState(1)
  const feeLow = 0.05
  const gross = 6
  function grow(fee) {
    const pts = []
    let b = start
    for (let y = 0; y <= years; y++) {
      pts.push({ x: y, y: b })
      b = b * (1 + (gross - fee) / 100) + monthly * 12
    }
    return pts
  }
  const low = grow(feeLow)
  const high = grow(feeHigh)
  const endLow = low[low.length - 1].y
  const endHigh = high[high.length - 1].y
  return (
    <div>
      <div className="tool-grid">
        <div className="tool-inputs">
          <Money label="Start with" value={start} onChange={setStart} />
          <Money label="Add each month" value={monthly} onChange={setMonthly} />
          <Slider label="Years" value={years} onChange={setYears} min={5} max={45} />
          <Slider label="Higher fee to compare" value={feeHigh} onChange={setFeeHigh} min={0.25} max={2} step={0.05} format={(v) => pct(v, 2)} hint="Many advisors and actively managed funds charge around 1%." />
        </div>
        <div className="tool-output">
          <Stat label={`With a ${pct(feeLow, 2)} fee`} value={usdShort(endLow)} tone="good" />
          <Stat label={`With a ${pct(feeHigh, 2)} fee`} value={usdShort(endHigh)} />
          <Stat label="Lost to fees" value={usd(endLow - endHigh)} sub={`${pct(((endLow - endHigh) / endLow) * 100)} less money`} tone="bad" />
          <p className="muted small">Both use the same 6% yearly return before fees.</p>
        </div>
      </div>
      <LineChart
        ariaLabel="Low fee versus high fee growth"
        xLabel={(x) => `Yr ${x}`}
        series={[
          { id: 'low', label: `${pct(feeLow, 2)} fee`, color: 'var(--accent)', points: low },
          { id: 'high', label: `${pct(feeHigh, 2)} fee`, color: 'var(--bad)', points: high },
        ]}
      />
    </div>
  )
}
