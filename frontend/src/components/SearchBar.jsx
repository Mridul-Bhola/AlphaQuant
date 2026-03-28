import { useState, useEffect, useRef } from 'react'
import { searchSymbols } from '../services/api'

const C = {
  bg:      '#141210',
  nav:     '#1C1410',
  border:  'rgba(201,169,110,0.18)',
  parchment: '#EDE5D0',
  muted:   '#7A6A58',
  gold:    '#C9A96E',
}
const F = {
  mono:  "'JetBrains Mono', monospace",
  label: "'Josefin Sans', sans-serif",
}

export default function SearchBar({ onSelect }) {
  const [input, setInput]             = useState('')
  const [results, setResults]         = useState([])
  const [open, setOpen]               = useState(false)
  const [loading, setLoading]         = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const debounceRef = useRef(null)
  const wrapperRef  = useRef(null)

  useEffect(() => {
    const handleClick = (e) => { if (!wrapperRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleInput = (e) => {
    const val = e.target.value
    setInput(val)
    setHighlighted(0)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val.trim()) { setResults([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await searchSymbols(val)
        setResults(res.data.results)
        setOpen(true)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }, 300)
  }

  const handleSelect = (item) => {
    setInput(item.name || item.symbol)
    setOpen(false)
    setResults([])
    onSelect(item.symbol)
  }

  const handleKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown')  setHighlighted(h => Math.min(h + 1, results.length - 1))
    if (e.key === 'ArrowUp')    setHighlighted(h => Math.max(h - 1, 0))
    if (e.key === 'Enter' && results[highlighted]) handleSelect(results[highlighted])
    if (e.key === 'Escape')     setOpen(false)
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {/* Search input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'transparent',
        border: `1px solid ${C.border}`,
        height: 34,
        padding: '0 6px 0 14px',
        transition: 'border-color 0.2s',
        minWidth: 240,
      }}>
        <span style={{ color: C.muted, marginRight: 8, fontSize: 13 }}>⌕</span>
        <input
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={e => { e.currentTarget.parentElement.style.borderColor = 'rgba(201,169,110,0.5)'; results.length > 0 && setOpen(true) }}
          onBlur={e => e.currentTarget.parentElement.style.borderColor = C.border}
          placeholder="Search symbol or company..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: C.parchment,
            fontFamily: F.mono,
            fontSize: 11,
            letterSpacing: '0.04em',
          }}
        />
        {loading && (
          <div style={{
            width: 12,
            height: 12,
            border: `1px solid ${C.border}`,
            borderTopColor: C.gold,
            marginRight: 8,
            animation: 'spin 0.7s linear infinite',
          }} />
        )}
      </div>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: C.nav,
          border: `1px solid ${C.border}`,
          zIndex: 1000,
          maxHeight: 340,
          overflowY: 'auto',
        }}>
          {results.map((item, i) => (
            <div
              key={item.symbol}
              onMouseDown={() => handleSelect(item)}
              onMouseEnter={() => setHighlighted(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                cursor: 'pointer',
                background: highlighted === i ? 'rgba(201,169,110,0.07)' : 'transparent',
                borderBottom: `1px solid rgba(201,169,110,0.08)`,
                transition: 'background 0.1s',
              }}
            >
              <div>
                <div style={{
                  fontFamily: F.mono,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: highlighted === i ? C.gold : C.parchment,
                  transition: 'color 0.1s',
                }}>
                  {item.symbol}
                </div>
                <div style={{ fontFamily: F.label, fontSize: 10, letterSpacing: '0.04em', color: C.muted, marginTop: 2 }}>
                  {item.name}
                </div>
              </div>
              <div style={{ fontFamily: F.label, fontSize: 8, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {item.exchange} · {item.type}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
