import { useState } from 'react'

export function Quiz({ items }) {
  return (
    <section className="quiz" aria-label="Check yourself">
      <h2>Check yourself</h2>
      {items.map((q, i) => (
        <Question key={i} q={q} n={i + 1} />
      ))}
    </section>
  )
}

function Question({ q, n }) {
  const [pick, setPick] = useState(null)
  const answered = pick !== null
  const right = pick === q.answer
  return (
    <div className="question">
      <p className="question-q">
        <span className="muted">{n}.</span> {q.q}
      </p>
      <div className="options">
        {q.options.map((o, i) => {
          let cls = ''
          if (answered && i === q.answer) cls = 'right'
          else if (answered && i === pick) cls = 'wrong'
          return (
            <button type="button" key={i} className={`option ${cls}`} onClick={() => setPick(i)} aria-pressed={pick === i}>
              {o}
            </button>
          )
        })}
      </div>
      {answered && (
        <p className={`answer ${right ? 'right' : 'wrong'}`} aria-live="polite">
          <strong>{right ? 'Right.' : 'Not quite.'}</strong> {q.why}
        </p>
      )}
    </div>
  )
}
