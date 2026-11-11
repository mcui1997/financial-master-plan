import { describe, expect, it } from 'vitest'
import { CHAPTERS, PATHS } from './chapters.js'
import { GLOSSARY, slug } from './glossary.js'
import { LIMITS } from '../config.js'
import { NEXT_DOLLAR_STEPS } from '../lib/model.js'

const TOOL_IDS = ['next-dollar', 'mix', 'paycheck', 'rebalance', 'retirement', 'crash', 'savings-rate', 'emergency', 'inflation', 'compound', 'fees']
const ids = new Set(CHAPTERS.map((c) => c.id))

describe('chapters', () => {
  it('every chapter has a body, a short version and a quiz', () => {
    for (const c of CHAPTERS) {
      expect(c.body.length, c.id).toBeGreaterThan(500)
      expect(c.short.length, c.id).toBeGreaterThanOrEqual(2)
      expect(c.quiz.length, c.id).toBeGreaterThanOrEqual(1)
      for (const q of c.quiz) expect(q.options[q.answer], `${c.id}: ${q.q}`).toBeTruthy()
    }
  })
  it('every glossary link resolves', () => {
    for (const c of CHAPTERS)
      for (const m of c.body.matchAll(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g)) {
        const key = m[2] || slug(m[1])
        expect(GLOSSARY[key], `${c.id}: [[${m[0]}]]`).toBeTruthy()
      }
  })
  it('every tool and limit placeholder resolves', () => {
    for (const c of CHAPTERS) {
      for (const m of c.body.matchAll(/\{\{tool:([a-z-]+)\}\}/g)) expect(TOOL_IDS, c.id).toContain(m[1])
      for (const m of c.body.matchAll(/\{\{limit:([a-zA-Z0-9]+)\}\}/g)) expect(LIMITS[m[1]], `${c.id}: ${m[1]}`).toBeTruthy()
      expect(c.body).not.toMatch(/\{\{(?!tool:|limit:|year\}\})/)
    }
  })
  it('paths and next-dollar steps point at real chapters', () => {
    for (const p of Object.values(PATHS)) for (const id of p.chapters) expect(ids.has(id), id).toBe(true)
    for (const s of NEXT_DOLLAR_STEPS) expect(ids.has(s.chapter), s.chapter).toBe(true)
  })
  it('no long dashes or very long sentences', () => {
    for (const c of CHAPTERS) {
      expect(c.body, c.id).not.toMatch(/—/)
      const prose = c.body.replace(/^\|.*$/gm, '').replace(/\{\{[^}]+\}\}/g, '')
      for (const sentence of prose.split(/(?<=[.!?:])\s+|\n+/)) {
        const words = sentence.trim().split(/\s+/).length
        expect(words, `${c.id}: "${sentence.slice(0, 80)}..."`).toBeLessThanOrEqual(40)
      }
    }
  })
})
