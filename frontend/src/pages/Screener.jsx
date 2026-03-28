import { useState } from 'react'
import { runScreen } from '../services/api'

const C = {
  bg:      '#141210',
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

const SECTORS = ['All', 'Technology', 'Financial Services', 'Healthcare', 'Consumer Cyclical', 'Industrials', 'Energy', 'Basic Materials', 'Communication Services', 'Utilities', 'Real Estate']
const PRESETS = {
  'Value Picks':     'AAPL,MSFT,GOOGL,META,AMZN,JPM,BAC,WFC,JNJ,PFE',
  'India Large Cap': 'RELIANCE.NS,TCS.NS,INFY.NS,HDFCBANK.NS,ICICIBANK.NS,WIPRO.NS,SBIN.NS,LT.NS,AXISBANK.NS,BAJFINANCE.NS',
  'EV & Tech':       'TSLA,RIVN,NIO,XPEV,LCID,NVDA,AMD,INTC,QCOM,ASML',
}

const Label = ({ children }) => (
  <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, marginBottom: 6 }}>{children}</div>
)

const RangeInput = ({ value, onChange, placeholder }) => (
  <input
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      background: 'transparent',
      border: `1px solid ${C.border}`,
      color: C.parchment,
      fontFamily: F.mono,
      fontSize: 11,
      padding: '5px 10px',
      outline: 'none',
      width: 80,
      transition: 'border-color 0.2s',
    }}
    onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
    onBlur={e => e.target.style.borderColor = C.border}
  />
)

export default function Screener({ onSelectSymbol }) {
  const [symbolInput, setSymbolInput] = useState('')
  const [filters, setFilters] = useState({
    pe_min: '', pe_max: '', rsi_min: '', rsi_max: '',
    cap_min: '', cap_max: '', volume_min: '',
    change_52w_min: '', change_52w_max: '', sector: 'All',
  })
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [sortKey, setSortKey]   = useState('market_cap')
  const [sortDir, setSortDir]   = useState('desc')
  const [ran, setRan]           = useState(false)

  const setF = (key, val) => setFilters(p => ({ ...p, [key]: val }))

  const handleRun = async () => {
    const symbols = symbolInput.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
    if (!symbols.length) return
    setLoading(true); setRan(true)
    try {
      const payload = {
        symbols,
        pe_min:          filters.pe_min          ? +filters.pe_min          : null,
        pe_max:          filters.pe_max          ? +filters.pe_max          : null,
        rsi_min:         filters.rsi_min         ? +filters.rsi_min         : null,
        rsi_max:         filters.rsi_max         ? +filters.rsi_max         : null,
        cap_min:         filters.cap_min         ? +filters.cap_min * 1e9   : null,
        cap_max:         filters.cap_max         ? +filters.cap_max * 1e9   : null,
        volume_min:      filters.volume_min      ? +filters.volume_min * 1e6: null,
        change_52w_min:  filters.change_52w_min  ? +filters.change_52w_min  : null,
        change_52w_max:  filters.change_52w_max  ? +filters.change_52w_max  : null,
        sector: filters.sector !== 'All' ? filters.sector : null,
      }
      const res = await runScreen(payload)
      setResults(res.data.results)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...results].sort((a, b) => {
    const va = a[sortKey] ?? (sortDir === 'desc' ? -Infinity : Infinity)
    const vb = b[sortKey] ?? (sortDir === 'desc' ? -Infinity : Infinity)
    return sortDir === 'desc' ? vb - va : va - vb
  })

  const SortTh = ({ label, k, width }) => (
    <th onClick={() => handleSort(k)} style={{
      width,
      textAlign: k === 'name' || k === 'symbol' ? 'left' : 'right',
      padding: '10px 14px',
      cursor: 'pointer',
      userSelect: 'none',
      fontFamily: F.label,
      fontSize: 8,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      borderBottom: `1px solid ${C.border}`,
      fontWeight: 400,
      whiteSpace: 'nowrap',
      color: sortKey === k ? C.gold : C.muted,
    }}>
      {label} {sortKey === k ? (sortDir === 'desc' ? '↓' : '↑') : ''}
    </th>
  )

  return (
    <div style={{ flex: 1, padding: '28px 36px 40px', overflowY: 'auto', background: C.bg }}>

      {/* Section header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, marginBottom: 8 }}>The Screener</div>
        <div style={{ fontFamily: F.display, fontSize: 28, fontWeight: 300, color: C.parchment, lineHeight: 1.2 }}>
          Filter &amp; rank equities
        </div>
      </div>

      {/* Symbol input + presets */}
      <div style={{ marginBottom: 22 }}>
        <Label>Symbols (comma separated)</Label>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <textarea
            value={symbolInput}
            onChange={e => setSymbolInput(e.target.value.toUpperCase())}
            placeholder="AAPL, MSFT, GOOGL, TSLA, NVDA..."
            rows={2}
            style={{
              background: 'transparent',
              border: `1px solid ${C.border}`,
              color: C.parchment,
              fontFamily: F.mono,
              fontSize: 12,
              padding: '10px 14px',
              outline: 'none',
              resize: 'none',
              width: 480,
              lineHeight: 1.7,
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(PRESETS).map(([label, syms]) => (
              <button
                key={label}
                onClick={() => setSymbolInput(syms)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${C.border}`,
                  color: C.muted,
                  fontFamily: F.label,
                  fontSize: 9,
                  padding: '6px 16px',
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.4)'; e.currentTarget.style.color = C.gold }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 22 }}>
        {[
          { label: 'P/E Ratio',      keys: ['pe_min', 'pe_max'],               range: true },
          { label: 'RSI (14)',        keys: ['rsi_min', 'rsi_max'],             range: true },
          { label: 'Market Cap ($B)', keys: ['cap_min', 'cap_max'],             range: true },
          { label: 'Volume Min (M)',  keys: ['volume_min'],                     range: false },
          { label: '52W Change %',   keys: ['change_52w_min', 'change_52w_max'], range: true },
        ].map(({ label, keys, range }) => (
          <div key={label} style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: '12px 14px' }}>
            <Label>{label}</Label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <RangeInput value={filters[keys[0]]} onChange={v => setF(keys[0], v)} placeholder={range ? 'Min' : 'e.g. 10'} />
              {range && <>
                <span style={{ color: C.faint, fontSize: 11 }}>—</span>
                <RangeInput value={filters[keys[1]]} onChange={v => setF(keys[1], v)} placeholder="Max" />
              </>}
            </div>
          </div>
        ))}

        {/* Sector */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: '12px 14px' }}>
          <Label>Sector</Label>
          <select
            value={filters.sector}
            onChange={e => setF('sector', e.target.value)}
            style={{
              background: C.bg,
              border: `1px solid ${C.border}`,
              color: C.parchment,
              fontFamily: F.mono,
              fontSize: 10,
              padding: '5px 8px',
              outline: 'none',
              width: '100%',
            }}
          >
            {SECTORS.map(s => <option key={s} value={s} style={{ background: C.nav }}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Run button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button
          onClick={handleRun}
          disabled={loading}
          style={{
            background: loading ? 'transparent' : 'rgba(201,169,110,0.1)',
            border: `1px solid ${loading ? C.border : C.gold}`,
            color: loading ? C.muted : C.gold,
            fontFamily: F.label,
            fontSize: 10,
            fontWeight: 400,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            padding: '10px 36px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(201,169,110,0.18)' }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'rgba(201,169,110,0.1)' }}
        >
          {loading ? 'Screening...' : 'Run Screen'}
        </button>
        {ran && !loading && (
          <div style={{ fontFamily: F.label, fontSize: 9, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} · click column to sort · click row to load chart
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
          <div style={{ width: 32, height: 32, border: `1px solid ${C.border}`, borderTopColor: C.gold, animation: 'spin 0.9s linear infinite' }} />
          <div style={{ fontFamily: F.label, fontSize: 9, color: C.muted, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Fetching data...
          </div>
        </div>
      )}

      {/* Results table */}
      {!loading && results.length > 0 && (
        <div style={{ border: `1px solid ${C.border}`, overflowX: 'auto', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: C.gold, opacity: 0.5 }} />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.bgCard }}>
                <SortTh label="Symbol"  k="symbol"     width={90} />
                <SortTh label="Name"    k="name"       width={200} />
                <SortTh label="Price"   k="price"      width={90} />
                <SortTh label="Change"  k="change_pct" width={90} />
                <SortTh label="P/E"     k="pe_ratio"   width={80} />
                <SortTh label="RSI"     k="rsi"        width={70} />
                <SortTh label="Mkt Cap" k="market_cap" width={100} />
                <SortTh label="Volume"  k="volume"     width={90} />
                <SortTh label="52W %"   k="change_52w" width={90} />
                <SortTh label="Sector"  k="sector"     width={160} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => (
                <tr
                  key={s.symbol}
                  onClick={() => onSelectSymbol(s.symbol)}
                  style={{
                    borderBottom: `1px solid rgba(201,169,110,0.08)`,
                    cursor: 'pointer',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(201,169,110,0.02)',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,110,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(201,169,110,0.02)'}
                >
                  <td style={{ padding: '11px 14px', fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: C.gold }}>{s.symbol}</td>
                  <td style={{ padding: '11px 14px', fontFamily: F.label, fontSize: 11, letterSpacing: '0.04em', color: C.muted, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</td>
                  <td style={{ padding: '11px 14px', fontFamily: F.mono, fontSize: 12, color: C.parchment, textAlign: 'right' }}>${s.price?.toFixed(2) ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontFamily: F.mono, fontSize: 12, color: (s.change_pct ?? 0) >= 0 ? C.up : C.down, textAlign: 'right', fontWeight: 600 }}>
                    {s.change_pct != null ? `${s.change_pct >= 0 ? '+' : ''}${s.change_pct.toFixed(2)}%` : '—'}
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: F.mono, fontSize: 12, color: C.muted, textAlign: 'right' }}>{s.pe_ratio ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontFamily: F.mono, fontSize: 12, textAlign: 'right', fontWeight: 600, color: s.rsi == null ? C.muted : s.rsi > 70 ? C.down : s.rsi < 30 ? C.up : C.parchment }}>
                    {s.rsi ?? '—'}
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: F.mono, fontSize: 12, color: C.muted, textAlign: 'right' }}>
                    {s.market_cap ? `$${(s.market_cap / 1e9).toFixed(1)}B` : '—'}
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: F.mono, fontSize: 12, color: C.muted, textAlign: 'right' }}>
                    {s.volume ? `${(s.volume / 1e6).toFixed(1)}M` : '—'}
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: F.mono, fontSize: 12, textAlign: 'right', fontWeight: 600, color: (s.change_52w ?? 0) >= 0 ? C.up : C.down }}>
                    {s.change_52w != null ? `${s.change_52w >= 0 ? '+' : ''}${s.change_52w.toFixed(1)}%` : '—'}
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: F.label, fontSize: 10, letterSpacing: '0.06em', color: C.faint }}>{s.sector}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!loading && ran && results.length === 0 && (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 300, color: C.muted, fontStyle: 'italic' }}>
            No equities match your criteria.
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
