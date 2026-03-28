import { useEffect, useRef, useState } from 'react'
import useWatchlistStore from '../store/useWatchlistStore'
import useStore from '../store/useStore'

const MONO = "'JetBrains Mono', monospace"
const GRAD = 'linear-gradient(135deg, #9b51e0, #0693e3)'
const BORDER = 'rgba(255,255,255,0.07)'
const UP   = '#00d084'
const DOWN = '#ff4d6d'

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
      fontFamily: MONO, fontSize: 12, fontWeight: 600,
      color: flash === 'up' ? UP : flash === 'down' ? DOWN : 'rgba(255,255,255,0.87)',
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
      borderLeft: `1px solid ${BORDER}`,
      background: '#0a0a12',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ padding: '16px 14px 12px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>
          Watchlist
        </div>

        {/* Add input — pill style */}
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 6 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder="Add symbol..."
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 9999,
              color: 'rgba(255,255,255,0.87)',
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.04em',
              padding: '5px 12px',
              outline: 'none',
            }}
          />
          <button type="submit" style={{
            background: GRAD,
            border: 'none',
            borderRadius: 9999,
            color: '#fff',
            fontFamily: MONO,
            fontSize: 14,
            fontWeight: 700,
            width: 30,
            height: 30,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>+</button>
        </form>
      </div>

      {/* Symbol list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {watchlist.map(sym => {
            const data = prices[sym]
            const isPos = (data?.change_pct ?? 0) >= 0
            return (
              <div
                key={sym}
                onClick={() => setSymbol(sym)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: '9px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(155,81,224,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(155,81,224,0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.borderColor = BORDER
                }}
              >
                {/* Left: symbol + change */}
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.87)', letterSpacing: '0.04em' }}>{sym}</div>
                  {data && (
                    <div style={{ fontFamily: MONO, fontSize: 9, color: isPos ? UP : DOWN, marginTop: 3, fontWeight: 600 }}>
                      {isPos ? '▲' : '▼'} {isPos ? '+' : ''}{data.change_pct?.toFixed(2)}%
                    </div>
                  )}
                </div>

                {/* Right: price + remove */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {data ? (
                    <FlashCell value={data.price} format={(v) => `$${v?.toFixed(2)}`} />
                  ) : (
                    <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.12)' }}>—</span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSymbol(sym) }}
                    style={{
                      background: 'none', border: 'none',
                      color: 'rgba(255,255,255,0.12)', cursor: 'pointer',
                      fontSize: 10, padding: 0, lineHeight: 1,
                      fontFamily: MONO, transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = DOWN}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.12)'}
                  >✕</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 14px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.1)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Updates every 15s
        </div>
      </div>
    </div>
  )
}
