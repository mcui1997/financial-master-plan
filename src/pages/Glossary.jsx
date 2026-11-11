import { useEffect } from 'react'
import { GLOSSARY } from '../content/glossary.js'

export function Glossary({ anchor }) {
  useEffect(() => {
    if (anchor) {
      const el = document.getElementById(`g-${anchor}`)
      if (el) {
        el.scrollIntoView({ block: 'center' })
        el.classList.add('flash')
        setTimeout(() => el.classList.remove('flash'), 1600)
      }
    }
  }, [anchor])
  const entries = Object.entries(GLOSSARY).sort((a, b) => a[1].term.localeCompare(b[1].term))
  return (
    <div className="wrap narrow page">
      <h1>Glossary</h1>
      <p className="lead">Every money word on this site, in plain language.</p>
      <dl className="glossary">
        {entries.map(([k, g]) => (
          <div key={k} id={`g-${k}`}>
            <dt>{g.term}</dt>
            <dd>{g.def}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
