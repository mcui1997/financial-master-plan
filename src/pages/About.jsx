import { ASSETS, ASSET_ORDER, CRASHES, LAST_UPDATED, LIMITS, LIMITS_YEAR, RANGE_SPREAD, REAL_RETURN, SAFE_WITHDRAWAL } from '../config.js'
import { pct, signedPct, usd } from '../lib/format.js'
import { BASE_MIX } from '../lib/model.js'

const SOURCES = [
  { name: 'IRS: retirement plan contribution limits (cost-of-living adjustments)', url: 'https://www.irs.gov/retirement-plans/cola-increases-for-dollar-limitations-on-benefits-and-contributions' },
  { name: 'IRS Publication 969: HSAs and other tax-favored health plans', url: 'https://www.irs.gov/publications/p969' },
  { name: 'Social Security: create a my Social Security account for your estimate', url: 'https://www.ssa.gov/myaccount/' },
  { name: 'Aswath Damodaran, NYU Stern: historical returns on stocks, bonds, and bills', url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html' },
  { name: 'US Bureau of Labor Statistics: Consumer Price Index (inflation)', url: 'https://www.bls.gov/cpi/' },
  { name: 'FDIC: deposit insurance basics', url: 'https://www.fdic.gov/resources/deposit-insurance' },
  { name: 'SEC: Investment Adviser Public Disclosure search', url: 'https://adviserinfo.sec.gov/' },
  { name: 'FINRA BrokerCheck', url: 'https://brokercheck.finra.org/' },
  { name: 'HealthCare.gov: health insurance marketplace', url: 'https://www.healthcare.gov/' },
]

export function About() {
  return (
    <div className="wrap narrow page">
      <h1>Assumptions and sources</h1>
      <p className="lead">Every number the tools use, in one place. Last updated {LAST_UPDATED}.</p>

      <h2>Expected returns</h2>
      <p>
        Yearly growth after inflation, so every result is in today's dollars. These are cautious on purpose. Nobody knows future returns.
        The low and high lines in the planner are {RANGE_SPREAD} points below and above the middle.
      </p>
      <div className="table-wrap"><table className="table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Example fund</th>
            <th className="num">Return after inflation</th>
          </tr>
        </thead>
        <tbody>
          {ASSET_ORDER.map((k) => (
            <tr key={k}>
              <td>{ASSETS[k].name}</td>
              <td>{ASSETS[k].ticker}</td>
              <td className="num">{pct(REAL_RETURN[k], 1)}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
      <p className="small muted">
        Bitcoin's 5% is a placeholder, not a forecast. Its range of outcomes is far wider than any other asset here, including going to zero.
      </p>

      <h2>The mix by stage</h2>
      <div className="table-wrap"><table className="table">
        <thead>
          <tr>
            <th>Stage</th>
            <th className="num">Stocks</th>
            <th className="num">Bitcoin</th>
            <th className="num">Gold</th>
            <th className="num">REITs</th>
            <th className="num">Bonds</th>
            <th className="num">Cash</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(BASE_MIX).map(([s, m]) => (
            <tr key={s}>
              <td>{s === 'building' ? 'Building' : s === 'close' ? 'Close' : 'Retired'}</td>
              <td className="num">{m.stocks}%</td>
              <td className="num">{m.btc}%</td>
              <td className="num">{m.gold}%</td>
              <td className="num">{m.reit}%</td>
              <td className="num">{m.bonds}%</td>
              <td className="num">{m.cash}%</td>
            </tr>
          ))}
        </tbody>
      </table></div>
      <p className="small muted">
        Stocks split 70% US and 30% international. "Close" means 10 years or less to retirement. Comfort shifts 10 points between stocks and
        bonds. Classic style folds gold, REITs, and Bitcoin into stocks.
      </p>

      <h2>Retirement</h2>
      <p>
        The FI number uses the {SAFE_WITHDRAWAL}% rule: yearly need × {100 / SAFE_WITHDRAWAL}. The rough start test applies the 2008 drop to the
        retired mix in the first year of retirement, then {RANGE_SPREAD} points below normal for two more years.
      </p>

      <h2>Crash figures</h2>
      <p>Rounded, approximate drops for each building block during each event. Based on broad index and fund returns.</p>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Asset</th>
              {CRASHES.map((c) => (
                <th key={c.id} className="num">{c.id}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ASSET_ORDER.map((k) => (
              <tr key={k}>
                <td>{ASSETS[k].short}</td>
                {CRASHES.map((c) => (
                  <td key={c.id} className="num">{signedPct(c.returns[k])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted">2008 and 2022 are calendar-year returns. 2020 is Feb 19 to Mar 23. Bitcoin in 2008 is an assumed typical crash.</p>

      <h2>{LIMITS_YEAR} account limits</h2>
      <ul>
        <li>401(k), 403(b), most 457 plans, TSP: {usd(LIMITS.k401)}. Age 50+: {usd(LIMITS.k401CatchUp50)} more. Ages 60 to 63: {usd(LIMITS.k401CatchUp60to63)} more instead.</li>
        <li>IRA (Roth and traditional combined): {usd(LIMITS.ira)}. Age 50+: {usd(LIMITS.iraCatchUp50)} more.</li>
        <li>HSA: {usd(LIMITS.hsaSelf)} self-only, {usd(LIMITS.hsaFamily)} family. Age 55+: {usd(LIMITS.hsaCatchUp55)} more.</li>
        <li>
          Roth IRA income phase-out: {usd(LIMITS.rothPhaseOutSingle[0])} to {usd(LIMITS.rothPhaseOutSingle[1])} single,{' '}
          {usd(LIMITS.rothPhaseOutJoint[0])} to {usd(LIMITS.rothPhaseOutJoint[1])} married filing jointly.
        </li>
      </ul>

      <h2>Sources</h2>
      <ul>
        {SOURCES.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>
          </li>
        ))}
      </ul>

      <h2>Privacy</h2>
      <p>
        This site has no server, accounts, analytics, or ads. What you type is saved in your own browser's storage so it is there next time.
        It never leaves your device unless you choose "Save a copy." Clearing your browser data erases it.
      </p>

      <h2>Not advice</h2>
      <p>
        This site is for education. It is not financial, tax, legal, or investment advice. It reflects one investing approach, and it says
        where that approach differs from common advice. Fund names are examples, not endorsements. Past returns do not guarantee future
        results. For decisions about your specific situation, consider a fee-only fiduciary or a tax professional.
      </p>
    </div>
  )
}
