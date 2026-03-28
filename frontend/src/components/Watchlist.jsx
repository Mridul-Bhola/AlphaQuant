import { useEffect, useRef, useState } from 'react'
import useWatchlistStore from '../store/useWatchlistStore'
import useStore from '../store/useStore'

const C = {
  bg:      '#141210',
  nav:     '#1C1410',
  border:  'rgba(201,169,110,0.18)',
  parchment: '#EDE5D0',
  muted:   '#7A6A58',
  faint:   'rgba(181,168,152,0.25)',
  gold:    '#C9A96E',
  up:      '#6DAA6D',
  down:    '#C8544A',
}
const F = {
  display: "'Cormorant Garamond', serif",
  mono:    "'JetBrains Mono', monospace",
  label:   "'Josefin Sans', sans-serif",
}

const FlashCell = ({ value, format }) => {
  const [flash, setFlash] = useState(null)
  const prev = useRef(value)

  useEffect(() => {
    if (prev.current !== value && prev.current !== undefined) {
      setFlash(value > prev.current ? 'up' : 'down')
      setTimeout(() => setFlash(null), 700)
    }
    prev.current = value
  }, [value])

  return (
    <span style={{
      fontFamily: F.mono,
      fontSize: 12,
      fontWeight: 600,
      color: flash === 'up' ? C.up : flash === 'down' ? C.down : C.parchment,
      transition: 'color 0.3s',
    }}>
      {format(value)}
    </span>
  )
}

export default function Watchlist() {
  const { watchlist, prices, addSymbol, removeSymbol, setPrices } = useWatchlistStore()
  const { setSymbol } = useStore()
  const wsRef  = useRef(null)
  const [input, setInput] = useState('')

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket('ws://localhost:8000/ws/watchlist')
      wsRef.current = ws
      ws.onopen    = () => ws.send(JSON.stringify({ symbols: watchlist }))
      ws.onmessage = (e) => {
        setPrices(JSON.parse(e.data))
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN)
            ws.send(JSON.stringify({ symbols: watchlist }))
        }, 15000)
      }
      ws.onclose = () => setTimeout(connect, 3000)
    }
    connect()
    return () => wsRef.current?.close()
  }, [watchlist])

  const handleAdd = (e) => {
    e.preventDefault()
    const sym = input.toUpperCase().trim()
    if (sym) { addSymbol(sym); setInput('') }
  }

  return (
    <div style={{
      width: 220,
      borderLeft: `1px solid ${C.border}`,
      background: C.nav,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ padding: '16px 14px 14px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>
          Watchlist
        </div>

        {/* Add input */}
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 6 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder="Add symbol..."
            style={{
              flex: 1,
              background: 'transparent',
              border: `1px solid ${C.border}`,
              color: C.parchment,
              fontFamily: F.mono,
              fontSize: 11,
              letterSpacing: '0.04em',
              padding: '5px 10px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <button type="submit" style={{
            background: 'rgba(201,169,110,0.12)',
            border: `1px solid ${C.border}`,
            color: C.gold,
            fontFamily: F.mono,
            fontSize: 14,
            fontWeight: 300,
            width: 30,
            height: 30,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.22)'; e.currentTarget.style.borderColor = C.gold }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.12)'; e.currentTarget.style.borderColor = C.border }}
          >+</button>
        </form>
      </div>

      {/* Symbol list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {watchlist.map(sym => {
            const data = prices[sym]
            const isPos = (data?.change_pct ?? 0) >= 0
            return (
              <div
                key={sym}
                onClick={() => setSymbol(sym)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${C.border}`,
                  padding: '9px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(201,169,110,0.06)'
                  e.currentTarget.style.borderColor = 'rgba(201,169,110,0.35)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = C.border
                }}
              >
                <div>
                  <div style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: C.parchment, letterSpacing: '0.04em' }}>{sym}</div>
                  {data && (
                    <div style={{ fontFamily: F.mono, fontSize: 9, color: isPos ? C.up : C.down, marginTop: 3, fontWeight: 600 }}>
                      {isPos ? '▲' : '▼'} {isPos ? '+' : ''}{data.change_pct?.toFixed(2)}%
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {data ? (
                    <FlashCell value={data.price} format={(v) => `$${v?.toFixed(2)}`} />
                  ) : (
                    <span style={{ fontFamily: F.mono, fontSize: 11, color: C.faint }}>—</span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSymbol(sym) }}
                    style={{
                      background: 'none', border: 'none',
                      color: C.faint, cursor: 'pointer',
                      fontSize: 10, padding: 0, lineHeight: 1,
                      fontFamily: F.mono, transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = C.down}
                    onMouseLeave={e => e.currentTarget.style.color = C.faint}
                  >✕</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontFamily: F.label, fontSize: 7, color: C.faint, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Updates every 15s
        </div>
      </div>
    </div>
  )
}
