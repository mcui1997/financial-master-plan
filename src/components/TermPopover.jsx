// Tap an underlined money word for a quick definition.
import { useEffect, useRef, useState } from 'react'
import { GLOSSARY } from '../content/glossary.js'
import { href } from '../lib/router.js'

export function TermPopover() {
  const [open, setOpen] = useState(null)
  const box = useRef(null)

  useEffect(() => {
    function onClick(e) {
      const btn = e.target.closest?.('.term')
      if (btn) {
        const r = btn.getBoundingClientRect()
        const width = Math.min(320, window.innerWidth - 24)
        const left = Math.max(12, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - 12))
        const below = r.bottom + 8 + window.scrollY
        setOpen({ key: btn.dataset.term, left, top: below, width, el: btn })
        return
      }
      if (box.current && box.current.contains(e.target)) return
      setOpen(null)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen((o) => {
        o?.el?.focus()
        return null
      })
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    window.addEventListener('hashchange', () => setOpen(null))
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  if (!open || !GLOSSARY[open.key]) return null
  const g = GLOSSARY[open.key]
  return (
    <div ref={box} className="popover" role="dialog" aria-label={g.term} style={{ left: open.left, top: open.top, width: open.width }}>
      <strong>{g.term}</strong>
      <p>{g.def}</p>
      <a href={href(`glossary#${open.key}`)} className="small" onClick={() => setOpen(null)}>
        All terms
      </a>
    </div>
  )
}
