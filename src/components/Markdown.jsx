import { marked } from 'marked'
import { LIMITS, LIMITS_YEAR } from '../config.js'
import { GLOSSARY, slug } from '../content/glossary.js'
import { usd } from '../lib/format.js'
import { toolById } from '../tools/index.js'

marked.setOptions({ gfm: true })

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// {{year}} and {{limit:ira}} become real numbers from config.js
export function fillValues(text) {
  return text.replace(/\{\{year\}\}/g, String(LIMITS_YEAR)).replace(/\{\{limit:([a-zA-Z0-9]+)\}\}/g, (m, k) => (k in LIMITS ? usd(LIMITS[k]) : m))
}

// [[text]] or [[text|key]] become tappable glossary terms
export function linkTerms(text) {
  return text.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, label, key) => {
    const k = key || slug(label)
    if (!GLOSSARY[k]) return esc(label)
    return `<button type="button" class="term" data-term="${esc(k)}">${esc(label)}</button>`
  })
}

export function splitTools(text) {
  return text.split(/^\{\{tool:([a-z-]+)\}\}\s*$/m)
}

export function Markdown({ text }) {
  const parts = splitTools(fillValues(text))
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      const tool = toolById(part)
      if (!tool) return null
      const C = tool.Component
      return (
        <section key={i} className="tool-card inline" aria-label={tool.title}>
          <header className="tool-head">
            <span className="tool-kicker">Try it</span>
            <h3>{tool.title}</h3>
          </header>
          <C />
        </section>
      )
    }
    return <div key={i} className="prose" dangerouslySetInnerHTML={{ __html: marked.parse(linkTerms(part)) }} />
  })
}
