import { CHAPTERS, PATHS, chapterById } from '../content/chapters.js'
import { Donut } from '../components/ui.jsx'
import { mixFor } from '../lib/model.js'
import { href } from '../lib/router.js'
import { usePlan } from '../lib/store.jsx'

const STAGE_AGE = {
  starting: { age: 25, retireAge: 65 },
  building: { age: 35, retireAge: 65 },
  close: { age: 58, retireAge: 65 },
  retired: { age: 68, retireAge: 65 },
}

// The hero shows the three jobs, colored like the rest of the site.
const b = mixFor('building')
const heroMix = { us: b.us + b.intl + b.btc, gold: b.gold + b.reit, bonds: b.bonds + b.cash }

export function Home() {
  const { state, update } = usePlan()
  const path = state.path ? PATHS[state.path] : null
  const firstUnread = path ? path.chapters.find((id) => !state.read[id]) || path.chapters[0] : null

  function choose(key) {
    update('path', key)
    // Give the tools a sensible starting age the first time.
    if (!state.path) update('profile', { ...STAGE_AGE[key] })
    setTimeout(() => document.getElementById('your-path')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="wrap hero-inner">
          <div>
            <p className="kicker">A calm, complete money plan</p>
            <h1>Grow your money without making it your second job.</h1>
            <p className="lead">
              Plain words. One simple system. Tools that use your own numbers. Learn it once, set it up in an afternoon, then tend it about an
              hour a year.
            </p>
            <div className="hero-actions">
              <button type="button" className="btn primary" onClick={() => document.getElementById('where')?.scrollIntoView({ behavior: 'smooth' })}>
                Find your starting point
              </button>
              <a className="btn" href={href('learn/start-here')}>Read from the beginning</a>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <Donut mix={heroMix} size={220} label="Grow, hedge, and protect" />
            <ul className="hero-jobs">
              <li><i style={{ background: 'var(--grow)' }}></i>Grow</li>
              <li><i style={{ background: 'var(--hedge)' }}></i>Hedge</li>
              <li><i style={{ background: 'var(--protect)' }}></i>Protect</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <h2>The whole plan in five lines</h2>
        <ol className="five">
          <li><strong>Build a cushion.</strong> Know your numbers, keep emergency cash, clear expensive debt.</li>
          <li><strong>Fill the right accounts in order.</strong> Free money first, then the best tax breaks.</li>
          <li><strong>Pick a mix for your life stage.</strong> Grow, hedge, and protect, in the right amounts.</li>
          <li><strong>Buy a little every payday.</strong> Automatically, no matter what the market does.</li>
          <li><strong>Tidy up once a year.</strong> Rebalance, and shift toward safety as retirement nears.</li>
        </ol>
      </section>

      <section className="wrap section" id="where">
        <h2>Where are you right now?</h2>
        <p className="muted">Pick one. You'll get a reading path made for your stage. Every chapter stays open to you.</p>
        <div className="path-cards">
          {Object.entries(PATHS).map(([key, p]) => (
            <button key={key} type="button" className={`path-card ${state.path === key ? 'on' : ''}`} onClick={() => choose(key)} aria-pressed={state.path === key}>
              <strong>{p.title}</strong>
              <span>{p.blurb}</span>
            </button>
          ))}
        </div>

        {path && (
          <div className="your-path" id="your-path">
            <div className="your-path-head">
              <h3>Your path: {path.title}</h3>
              <a className="btn primary" href={href(`learn/${firstUnread}`)}>
                {path.chapters.some((id) => state.read[id]) ? 'Continue reading' : 'Start reading'}
              </a>
            </div>
            <ol className="path-list">
              {path.chapters.map((id) => {
                const c = chapterById(id)
                return (
                  <li key={id} className={state.read[id] ? 'read' : ''}>
                    <a href={href(`learn/${id}`)}>
                      <span className="path-n">{c.n}</span>
                      <span>
                        <strong>{c.title}</strong>
                        <span className="muted small block">{c.short[0]}</span>
                      </span>
                      <span className="muted small nowrap">{state.read[id] ? 'Read ✓' : `${c.minutes} min`}</span>
                    </a>
                  </li>
                )
              })}
            </ol>
          </div>
        )}
      </section>

      <section className="wrap section">
        <div className="three">
          <a className="feature" href={href('learn')}>
            <h3>Learn</h3>
            <p>{CHAPTERS.length} short chapters. Each starts with the short version and ends with a quick check.</p>
          </a>
          <a className="feature" href={href('tools')}>
            <h3>Tools</h3>
            <p>Mix builder, rebalance calculator, retirement planner, crash simulator, and more.</p>
          </a>
          <a className="feature" href={href('plan')}>
            <h3>My Plan</h3>
            <p>Everything you enter, on one page. Your next step, your mix, and a checklist.</p>
          </a>
        </div>
        <p className="muted small center">
          Private by design. Anything you type stays in this browser. No accounts, no tracking, no ads.
        </p>
      </section>
    </div>
  )
}
