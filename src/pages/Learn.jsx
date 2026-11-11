import { useEffect } from 'react'
import { CHAPTERS, PARTS, PATHS, chapterById } from '../content/chapters.js'
import { Markdown } from '../components/Markdown.jsx'
import { Quiz } from '../components/Quiz.jsx'
import { href } from '../lib/router.js'
import { usePlan } from '../lib/store.jsx'

export function Learn() {
  const { state } = usePlan()
  const readCount = CHAPTERS.filter((c) => state.read[c.id]).length
  const path = state.path ? PATHS[state.path] : null
  return (
    <div className="wrap page">
      <h1>Learn</h1>
      <p className="lead">
        {CHAPTERS.length} chapters, about {Math.round(CHAPTERS.reduce((t, c) => t + c.minutes, 0) / 60)} hours of reading in total. Read in order, or follow your path.
      </p>
      <div className="progress" aria-label={`${readCount} of ${CHAPTERS.length} chapters read`}>
        <span style={{ width: `${(readCount / CHAPTERS.length) * 100}%` }}></span>
      </div>
      <p className="muted small">
        {readCount} of {CHAPTERS.length} read{path ? `. Chapters on your path (${path.title}) are marked.` : '.'}
      </p>
      {PARTS.map((part) => (
        <section key={part} className="part">
          <h2>{part}</h2>
          <ol className="chapter-list">
            {CHAPTERS.filter((c) => c.part === part).map((c) => (
              <li key={c.id} className={state.read[c.id] ? 'read' : ''}>
                <a href={href(`learn/${c.id}`)}>
                  <span className="path-n">{c.n}</span>
                  <span>
                    <strong>{c.title}</strong>
                    {path && path.chapters.includes(c.id) && <span className="badge soft">Your path</span>}
                    <span className="muted small block">{c.short[0]}</span>
                  </span>
                  <span className="muted small nowrap">{state.read[c.id] ? 'Read ✓' : `${c.minutes} min`}</span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}

export function Chapter({ id }) {
  const { state, update } = usePlan()
  const c = chapterById(id)
  useEffect(() => {
    if (c) document.title = `${c.title} · The Financial Master Plan`
  }, [c])
  if (!c) {
    return (
      <div className="wrap narrow page">
        <h1>Chapter not found</h1>
        <a href={href('learn')}>See all chapters</a>
      </div>
    )
  }
  const path = state.path ? PATHS[state.path] : null
  const order = path && path.chapters.includes(id) ? path.chapters : CHAPTERS.map((x) => x.id)
  const i = order.indexOf(id)
  const prev = i > 0 ? chapterById(order[i - 1]) : null
  const next = i < order.length - 1 ? chapterById(order[i + 1]) : null
  const isRead = !!state.read[id]

  return (
    <div className="wrap chapter-layout page">
      <aside className="chapter-side" aria-label="Chapters">
        <a href={href('learn')} className="small">All chapters</a>
        <ol>
          {CHAPTERS.map((x) => (
            <li key={x.id} className={`${x.id === id ? 'here' : ''} ${state.read[x.id] ? 'read' : ''}`}>
              <a href={href(`learn/${x.id}`)} aria-current={x.id === id ? 'page' : undefined}>
                <span className="side-n">{state.read[x.id] ? '✓' : x.n}</span>
                {x.title}
              </a>
            </li>
          ))}
        </ol>
      </aside>
      <article className="chapter">
        <p className="kicker">
          {c.part} · Chapter {c.n} · {c.minutes} min read
        </p>
        <h1>{c.title}</h1>
        <div className="short">
          <h2>The short version</h2>
          <ul>
            {c.short.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <Markdown text={c.body} />
        <Quiz items={c.quiz} key={id} />
        <div className="chapter-end">
          <button type="button" className={`btn ${isRead ? '' : 'primary'}`} onClick={() => update(`read.${id}`, !isRead || undefined)}>
            {isRead ? 'Marked as read ✓' : 'Mark as read'}
          </button>
          {path && path.chapters.includes(id) && <span className="muted small">Following your path: {path.title}</span>}
        </div>
        <nav className="pager" aria-label="Chapter navigation">
          {prev ? (
            <a href={href(`learn/${prev.id}`)} className="pager-prev">
              <span className="muted small">Previous</span>
              {prev.title}
            </a>
          ) : (
            <span />
          )}
          {next ? (
            <a href={href(`learn/${next.id}`)} className="pager-next" onClick={() => !isRead && update(`read.${id}`, true)}>
              <span className="muted small">Next</span>
              {next.title}
            </a>
          ) : (
            <a href={href('plan')} className="pager-next" onClick={() => !isRead && update(`read.${id}`, true)}>
              <span className="muted small">Done reading</span>
              Open My Plan
            </a>
          )}
        </nav>
      </article>
    </div>
  )
}
