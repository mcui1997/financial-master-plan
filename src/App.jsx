import { useEffect } from 'react'
import { TermPopover } from './components/TermPopover.jsx'
import { href, useRoute } from './lib/router.js'
import { About } from './pages/About.jsx'
import { Chapter, Learn } from './pages/Learn.jsx'
import { Glossary } from './pages/Glossary.jsx'
import { Home } from './pages/Home.jsx'
import { MyPlan } from './pages/MyPlan.jsx'
import { ToolPage, Tools } from './pages/Tools.jsx'

const NAV = [
  { id: '', label: 'Start' },
  { id: 'learn', label: 'Learn' },
  { id: 'tools', label: 'Tools' },
  { id: 'plan', label: 'My Plan' },
]

export function App() {
  const { parts, anchor } = useRoute()
  const [top, sub] = parts

  let page
  if (!top) page = <Home />
  else if (top === 'learn') page = sub ? <Chapter id={sub} /> : <Learn />
  else if (top === 'tools') page = sub ? <ToolPage id={sub} /> : <Tools />
  else if (top === 'plan') page = <MyPlan />
  else if (top === 'glossary') page = <Glossary anchor={anchor} />
  else if (top === 'about') page = <About />
  else page = <NotFound />

  useEffect(() => {
    const titles = { learn: 'Learn', tools: 'Tools', plan: 'My Plan', glossary: 'Glossary', about: 'About' }
    if (!sub) document.title = top && titles[top] ? `${titles[top]} · The Financial Master Plan` : 'The Financial Master Plan'
  }, [top, sub])

  return (
    <>
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }}>
        Skip to content
      </a>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <a className="brand" href={href('')}>
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="26" height="26">
                <circle cx="16" cy="16" r="14" fill="var(--accent)" />
                <path d="M9 20l5-6 4 3 5-7" stroke="var(--paper)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="brand-text">The Financial Master Plan</span>
          </a>
          <nav aria-label="Main">
            {NAV.map((n) => (
              <a key={n.id} href={href(n.id)} className={(top || '') === n.id ? 'active' : ''} aria-current={(top || '') === n.id ? 'page' : undefined}>
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        {page}
      </main>
      <footer className="footer">
        <div className="wrap">
          <p>
            <strong>For learning, not personal advice.</strong> This site does not know your full situation. All figures are estimates. Investing
            carries risk, including the loss of money. Do your own research, and consider a fee-only fiduciary for big decisions.
          </p>
          <p className="footer-links">
            <a href={href('glossary')}>Glossary</a>
            <a href={href('about')}>Assumptions and sources</a>
            <a href={href('plan')}>My Plan</a>
            <span>Your inputs stay in this browser. No tracking.</span>
          </p>
        </div>
      </footer>
      <TermPopover />
    </>
  )
}

function NotFound() {
  return (
    <div className="wrap narrow page">
      <h1>Page not found</h1>
      <p>
        That page doesn't exist. <a href={href('')}>Go to the start</a>.
      </p>
    </div>
  )
}
