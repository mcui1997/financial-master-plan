import { useEffect } from 'react'
import { chapterById } from '../content/chapters.js'
import { href } from '../lib/router.js'
import { TOOLS, toolById } from '../tools/index.js'

export function Tools() {
  const groups = [...new Set(TOOLS.map((t) => t.group))]
  return (
    <div className="wrap page">
      <h1>Tools</h1>
      <p className="lead">Every calculator in one place. They share your numbers, so what you set in one shows up in the others and in My Plan.</p>
      {groups.map((g) => (
        <section key={g} className="part">
          <h2>{g === 'Plan' ? 'Build your plan' : 'The basics'}</h2>
          <div className="tool-cards">
            {TOOLS.filter((t) => t.group === g).map((t) => (
              <a key={t.id} className="feature" href={href(`tools/${t.id}`)}>
                <h3>{t.title}</h3>
                <p>{t.blurb}</p>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export function ToolPage({ id }) {
  const t = toolById(id)
  useEffect(() => {
    if (t) document.title = `${t.title} · The Financial Master Plan`
  }, [t])
  if (!t) {
    return (
      <div className="wrap narrow page">
        <h1>Tool not found</h1>
        <a href={href('tools')}>See all tools</a>
      </div>
    )
  }
  const C = t.Component
  const ch = chapterById(t.chapter)
  return (
    <div className="wrap page">
      <a href={href('tools')} className="small">All tools</a>
      <h1>{t.title}</h1>
      <p className="lead">{t.blurb}</p>
      <section className="tool-card">
        <C />
      </section>
      {ch && (
        <p className="small">
          Want the why behind it? Read <a href={href(`learn/${ch.id}`)}>Chapter {ch.n}: {ch.title}</a>.
        </p>
      )}
    </div>
  )
}
