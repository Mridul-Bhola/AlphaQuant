import { useEffect, useState } from 'react'
import CandlestickChart from '../components/chart/CandlestickChart'
import RSIChart from '../components/chart/RSIChart'
import MACDChart from '../components/chart/MACDChart'
import SearchBar from '../components/SearchBar'
import Watchlist from '../components/Watchlist'
import Screener from './Screener'
import Backtester from './Backtester'
import Optimizer from './Optimizer'
import useStore from '../store/useStore'
import { getQuote, getOHLCV, getIndicators } from '../services/api'

const PERIODS = ['1mo', '3mo', '6mo', '1y', '2y', '5y']
const TABS    = ['Chart', 'Screener', 'Backtester', 'Optimizer']

// ── Design tokens ──────────────────────────────────────────────────
const C = {
  bg:      '#141210',
  nav:     '#1C1410',
  bgCard:  '#1A1713',
  border:  'rgba(201,169,110,0.18)',
  parchment: '#EDE5D0',
  muted:   '#7A6A58',
  faint:   'rgba(181,168,152,0.3)',
  gold:    '#C9A96E',
  cognac:  '#8B4513',
  up:      '#6DAA6D',
  down:    '#C8544A',
}
const F = {
  display: "'Cormorant Garamond', serif",
  mono:    "'JetBrains Mono', monospace",
  label:   "'Josefin Sans', sans-serif",
}

// ── Stat card ───────────────────────────────────────────────────────
const StatCard = ({ label, value, accent }) => (
  <div style={{
    background: accent ? `rgba(201,169,110,0.06)` : 'transparent',
    border: `1px solid ${accent ? 'rgba(201,169,110,0.28)' : C.border}`,
    padding: '8px 16px',
    minWidth: 90,
  }}>
    <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: accent ? C.gold : C.muted, marginBottom: 4 }}>{label}</div>
    <div style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 600, color: accent ? C.gold : C.parchment }}>
      {value}
    </div>
  </div>
)

// ── Tab / period button ─────────────────────────────────────────────
const TabBtn = ({ label, active, onClick, small }) => (
  <button onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: small ? '3px 12px' : '5px 16px',
    fontFamily: F.label,
    fontSize: small ? 9 : 10,
    fontWeight: 400,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    border: `1px solid ${active ? C.gold : C.border}`,
    background: active ? 'rgba(201,169,110,0.1)' : 'transparent',
    color: active ? C.gold : C.muted,
    transition: 'all 0.2s',
  }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.4)'; e.currentTarget.style.color = C.parchment } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted } }}
  >{label}</button>
)

// ── Chart section card ─────────────────────────────────────────────
const ChartCard = ({ title, children }) => (
  <div style={{
    background: C.bgCard,
    border: `1px solid ${C.border}`,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: C.gold, opacity: 0.5 }} />
    <div style={{ padding: '10px 16px 0' }}>
      <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted }}>{title}</div>
    </div>
    <div style={{ padding: '8px 4px 4px' }}>
      {children}
    </div>
  </div>
)

export default function Dashboard() {
  const { symbol, quote, ohlcv, loading, setSymbol, setQuote, setOHLCV, setLoading } = useStore()
  const [period, setPeriod]         = useState('6mo')
  const [indicators, setIndicators] = useState([])
  const [activeInd, setActiveInd]   = useState(['BB', 'RSI', 'MACD'])
  const [activeTab, setActiveTab]   = useState('Chart')

  const fetchData = async (sym, per) => {
    setLoading(true)
    try {
      const [q, o, ind] = await Promise.all([getQuote(sym), getOHLCV(sym, per), getIndicators(sym, per)])
      setQuote(q.data)
      setOHLCV(o.data.data)
      setIndicators(ind.data.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData(symbol, period) }, [symbol])

  const handleSelect = (sym) => { setSymbol(sym); setActiveTab('Chart'); fetchData(sym, period) }
  const handlePeriod = (p)   => { setPeriod(p); fetchData(symbol, p) }
  const toggleInd    = (ind) => setActiveInd(prev => prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind])

  const isPos = (quote?.change ?? 0) >= 0

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.parchment, display: 'flex', flexDirection: 'column' }}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <div style={{
        background: C.nav,
        borderBottom: `1px solid ${C.border}`,
        padding: '0 36px',
        height: 58,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {/* Logo */}
          <div style={{ fontFamily: F.display, fontSize: 18, letterSpacing: '0.08em', color: C.parchment }}>
            ALPHA<span style={{ fontStyle: 'italic', color: C.gold }}>QUANT</span>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {TABS.map(tab => (
              <TabBtn key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
            ))}
          </div>
        </div>

        {/* Right: search + live */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SearchBar onSelect={handleSelect} />
          <div style={{ border: `1px solid ${C.border}`, padding: '5px 14px', fontFamily: F.label, fontSize: 9, fontWeight: 400, letterSpacing: '0.14em', color: C.gold, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 5, height: 5, background: C.up, display: 'inline-block' }} />
            LIVE
          </div>
        </div>
      </div>

      {/* ── QUOTE STRIP ─────────────────────────────────────── */}
      {quote && (
        <div style={{
          background: C.nav,
          borderBottom: `1px solid ${C.border}`,
          padding: '0 36px',
          height: 80,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          flexShrink: 0,
        }}>
          {/* Price block */}
          <div>
            <div style={{ fontFamily: F.display, fontSize: 36, fontWeight: 300, color: C.parchment, letterSpacing: '-0.01em', lineHeight: 1 }}>
              ${quote.price?.toFixed(2)}
            </div>
            <div style={{ fontFamily: F.label, fontSize: 9, color: C.muted, marginTop: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {quote.symbol} — {quote.name}
            </div>
          </div>

          {/* Change badge */}
          <div style={{
            border: `1px solid ${isPos ? 'rgba(109,170,109,0.35)' : 'rgba(200,84,74,0.35)'}`,
            padding: '5px 14px',
            fontFamily: F.mono,
            fontSize: 12,
            fontWeight: 600,
            color: isPos ? C.up : C.down,
          }}>
            {isPos ? '▲' : '▼'} {isPos ? '+' : ''}{quote.change?.toFixed(2)} ({quote.change_pct?.toFixed(2)}%)
          </div>

          {/* Stat cards */}
          <div style={{ display: 'flex', gap: 6, marginLeft: 4, flexWrap: 'wrap' }}>
            <StatCard label="Market Cap"  value={`$${(quote.market_cap / 1e9).toFixed(1)}B`} />
            <StatCard label="P/E Ratio"   value={quote.pe_ratio?.toFixed(1) ?? '—'} />
            <StatCard label="Volume"      value={`${(quote.volume / 1e6).toFixed(1)}M`} />
            <StatCard label="52W High"    value={`$${quote['52w_high']}`} accent />
            <StatCard label="52W Low"     value={`$${quote['52w_low']}`} />
          </div>
        </div>
      )}

      {/* ── BODY ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {activeTab === 'Screener'   ? <Screener onSelectSymbol={handleSelect} /> :
         activeTab === 'Backtester' ? <Backtester defaultSymbol={symbol} /> :
         activeTab === 'Optimizer'  ? <Optimizer /> : (

          <div style={{ flex: 1, padding: '20px 28px 32px', overflowY: 'auto' }}>

            {/* Controls row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: F.label, fontSize: 8, color: C.faint, letterSpacing: '0.14em', textTransform: 'uppercase', marginRight: 4 }}>Indicators</span>
                {['BB', 'RSI', 'MACD'].map(ind => (
                  <TabBtn key={ind} label={ind} active={activeInd.includes(ind)} onClick={() => toggleInd(ind)} small />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {PERIODS.map(p => (
                  <TabBtn key={p} label={p} active={period === p} onClick={() => handlePeriod(p)} small />
                ))}
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div style={{ height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 36, height: 36, border: `1px solid ${C.border}`, borderTopColor: C.gold, animation: 'spin 0.9s linear infinite' }} />
                <div style={{ fontFamily: F.label, fontSize: 9, color: C.muted, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  Loading market data
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ChartCard title={`${symbol} · OHLCV${activeInd.includes('BB') ? ' · Bollinger Bands (20, 2)' : ''}`}>
                  <CandlestickChart data={ohlcv} indicators={activeInd.includes('BB') ? indicators : []} />
                </ChartCard>
                {activeInd.includes('RSI') && (
                  <ChartCard title="RSI · 14">
                    <RSIChart data={indicators} />
                  </ChartCard>
                )}
                {activeInd.includes('MACD') && (
                  <ChartCard title="MACD · 12 / 26 / 9">
                    <MACDChart data={indicators} />
                  </ChartCard>
                )}
              </div>
            )}
          </div>
        )}

        <Watchlist />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
