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
const BG     = '#09090f'
const BG2    = '#0d0d1a'
const BORDER = 'rgba(255,255,255,0.07)'
const MUTED  = 'rgba(255,255,255,0.25)'
const FAINT  = 'rgba(255,255,255,0.12)'
const UP     = '#00d084'
const DOWN   = '#ff4d6d'
const GRAD   = 'linear-gradient(135deg, #9b51e0, #0693e3)'
const MONO   = "'JetBrains Mono', monospace"
const SORA   = "'Sora', sans-serif"

// ── Stat pill card ─────────────────────────────────────────────────
const StatPill = ({ label, value, highlight }) => (
  <div style={{
    background: highlight ? 'rgba(155,81,224,0.08)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${highlight ? 'rgba(155,81,224,0.22)' : BORDER}`,
    borderRadius: 12,
    padding: '8px 16px',
    minWidth: 90,
  }}>
    <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: highlight ? 'rgba(155,81,224,0.7)' : MUTED, marginBottom: 4 }}>{label}</div>
    <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, ...(highlight ? { background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : { color: 'rgba(255,255,255,0.87)' }) }}>
      {value}
    </div>
  </div>
)

// ── Indicator / period pill button ─────────────────────────────────
const PillBtn = ({ label, active, onClick, small }) => (
  <button onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 9999,
    padding: small ? '4px 13px' : '6px 18px',
    fontFamily: MONO,
    fontSize: small ? 9 : 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    border: active ? 'none' : '1px solid rgba(255,255,255,0.08)',
    background: active ? GRAD : 'rgba(255,255,255,0.04)',
    color: active ? '#fff' : 'rgba(255,255,255,0.3)',
    boxShadow: active ? '0 4px 18px rgba(155,81,224,0.3)' : 'none',
    transition: 'all 0.2s',
  }}>{label}</button>
)

// ── Chart section card ─────────────────────────────────────────────
const ChartCard = ({ title, children }) => (
  <div style={{
    background: 'rgba(255,255,255,0.02)',
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  }}>
    {/* gradient top border */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #9b51e0, #0693e3, transparent)' }} />
    <div style={{ padding: '10px 16px 0' }}>
      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED }}>{title}</div>
    </div>
    <div style={{ padding: '8px 4px 4px' }}>
      {children}
    </div>
  </div>
)

export default function Dashboard() {
  const { symbol, quote, ohlcv, loading, setSymbol, setQuote, setOHLCV, setLoading } = useStore()
  const [period, setPeriod]           = useState('6mo')
  const [indicators, setIndicators]   = useState([])
  const [activeInd, setActiveInd]     = useState(['BB', 'RSI', 'MACD'])
  const [activeTab, setActiveTab]     = useState('Chart')

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
    <div style={{ minHeight: '100vh', background: BG, color: 'rgba(255,255,255,0.87)', display: 'flex', flexDirection: 'column' }}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <div style={{
        background: BG2,
        borderBottom: `1px solid ${BORDER}`,
        padding: '0 36px',
        height: 58,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        {/* Left: logo + tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {/* Gradient logo */}
          <div style={{ fontFamily: SORA, fontSize: 17, fontWeight: 800, letterSpacing: '0.05em', background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AlphaQuant
          </div>
          {/* Tab pills */}
          <div style={{ display: 'flex', gap: 6 }}>
            {TABS.map(tab => (
              <PillBtn key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
            ))}
          </div>
        </div>

        {/* Right: search + live badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SearchBar onSelect={handleSelect} />
          <div style={{ background: GRAD, borderRadius: 9999, padding: '6px 16px', fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block', boxShadow: '0 0 6px #fff' }} />
            LIVE
          </div>
        </div>
      </div>

      {/* ── QUOTE STRIP ─────────────────────────────────────── */}
      {quote && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(155,81,224,0.1) 0%, rgba(6,147,227,0.06) 60%, transparent 100%)',
          borderBottom: `1px solid ${BORDER}`,
          padding: '0 36px',
          height: 84,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          flexShrink: 0,
        }}>
          {/* Price block */}
          <div>
            <div style={{ fontFamily: SORA, fontSize: 34, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
              ${quote.price?.toFixed(2)}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: MUTED, marginTop: 5, letterSpacing: '0.07em' }}>
              {quote.symbol} — {quote.name}
            </div>
          </div>

          {/* Change badge */}
          <div style={{
            background: isPos ? 'rgba(0,208,132,0.1)' : 'rgba(255,77,109,0.1)',
            border: `1px solid ${isPos ? 'rgba(0,208,132,0.28)' : 'rgba(255,77,109,0.28)'}`,
            borderRadius: 9999,
            padding: '6px 16px',
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 700,
            color: isPos ? UP : DOWN,
          }}>
            {isPos ? '▲' : '▼'} {isPos ? '+' : ''}{quote.change?.toFixed(2)} ({quote.change_pct?.toFixed(2)}%)
          </div>

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: 8, marginLeft: 4, flexWrap: 'wrap' }}>
            <StatPill label="Market Cap"  value={`$${(quote.market_cap / 1e9).toFixed(1)}B`} />
            <StatPill label="P/E Ratio"   value={quote.pe_ratio?.toFixed(1) ?? '—'} />
            <StatPill label="Volume"      value={`${(quote.volume / 1e6).toFixed(1)}M`} />
            <StatPill label="52W High"    value={`$${quote['52w_high']}`} highlight />
            <StatPill label="52W Low"     value={`$${quote['52w_low']}`} />
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
              {/* Indicator pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, color: FAINT, letterSpacing: '0.12em', textTransform: 'uppercase', marginRight: 4 }}>Indicators</span>
                {['BB', 'RSI', 'MACD'].map(ind => (
                  <PillBtn key={ind} label={ind} active={activeInd.includes(ind)} onClick={() => toggleInd(ind)} small />
                ))}
              </div>

              {/* Period pills */}
              <div style={{ display: 'flex', gap: 5 }}>
                {PERIODS.map(p => (
                  <PillBtn key={p} label={p} active={period === p} onClick={() => handlePeriod(p)} small />
                ))}
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div style={{ height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(155,81,224,0.2)', borderTopColor: '#9b51e0', animation: 'spin 0.8s linear infinite' }} />
                <div style={{ fontFamily: MONO, fontSize: 11, color: FAINT, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                  Loading market data...
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Main candlestick chart */}
                <ChartCard title={`${symbol} · OHLCV${activeInd.includes('BB') ? ' · Bollinger Bands (20, 2)' : ''}`}>
                  <CandlestickChart data={ohlcv} indicators={activeInd.includes('BB') ? indicators : []} />
                </ChartCard>

                {/* RSI */}
                {activeInd.includes('RSI') && (
                  <ChartCard title="RSI · 14">
                    <RSIChart data={indicators} />
                  </ChartCard>
                )}

                {/* MACD */}
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
