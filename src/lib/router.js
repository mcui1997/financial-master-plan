// Tiny hash router. URLs look like #/learn/why-cash-loses-value
// An anchor can follow a second #, like #/glossary#roth
import { useEffect, useState } from 'react'

function read() {
  const h = window.location.hash.replace(/^#\/?/, '')
  const [path, anchor = ''] = h.split('#')
  return { parts: path.split('/').filter(Boolean), anchor }
}

export function useRoute() {
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => {
      const next = read()
      setRoute(next)
      if (!next.anchor) window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export function href(path) {
  return `#/${path.replace(/^\//, '')}`
}

export function go(path) {
  window.location.hash = href(path)
}
