import { useState, useEffect, useRef } from 'react'
import { searchSymbols } from '../services/api'

const MONO = "'JetBrains Mono', monospace"
const BORDER = 'rgba(255,255,255,0.08)'
const GRAD = 'linear-gradient(135deg, #9b51e0, #0693e3)'

export default function SearchBar({ onSelect }) {
  const [input, setInput]           = useState('')
  const [results, setResults]       = useState([])
  const [open, setOpen]             = useState(false)
  const [loading, setLoading]       = useState(false)
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
      {/* Pill-shaped search input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${BORDER}`,
        borderRadius: 9999,
        height: 36,
        padding: '0 6px 0 18px',
        transition: 'border-color 0.2s',
        minWidth: 240,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.2)', marginRight: 8, fontSize: 14 }}>⌕</span>
        <input
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search symbol or company..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'rgba(255,255,255,0.87)',
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.04em',
          }}
        />
        {loading && (
          <div style={{
            width: 14, height: 14, borderRadius: '50%',
            border: '2px solid rgba(155,81,224,0.2)',
            borderTopColor: '#9b51e0',
            marginRight: 10,
            animation: 'spin 0.7s linear infinite',
          }} />
        )}
      </div>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: '#0d0d1a',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 16,
          zIndex: 1000,
          maxHeight: 340,
          overflowY: 'auto',
          boxShadow: '0 16px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(155,81,224,0.12)',
          padding: '6px',
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
                borderRadius: 10,
                cursor: 'pointer',
                background: highlighted === i ? 'rgba(155,81,224,0.1)' : 'transparent',
                transition: 'background 0.12s',
              }}
            >
              <div>
                <div style={{
                  fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
                  ...(highlighted === i
                    ? { background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
                    : { color: 'rgba(255,255,255,0.7)' }),
                }}>
                  {item.symbol}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                  {item.name}
                </div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.08em' }}>
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
