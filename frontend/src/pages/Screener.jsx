import { useState } from 'react'
import { runScreen } from '../services/api'

const MONO   = "'JetBrains Mono', monospace"
const SORA   = "'Sora', sans-serif"
const GRAD   = 'linear-gradient(135deg, #9b51e0, #0693e3)'
const BORDER = 'rgba(255,255,255,0.07)'
const MUTED  = 'rgba(255,255,255,0.25)'
const UP     = '#00d084'
const DOWN   = '#ff4d6d'

const SECTORS = ['All', 'Technology', 'Financial Services', 'Healthcare', 'Consumer Cyclical', 'Industrials', 'Energy', 'Basic Materials', 'Communication Services', 'Utilities', 'Real Estate']
const PRESETS = {
  'Value Picks':     'AAPL,MSFT,GOOGL,META,AMZN,JPM,BAC,WFC,JNJ,PFE',
  'India Large Cap': 'RELIANCE.NS,TCS.NS,INFY.NS,HDFCBANK.NS,ICICIBANK.NS,WIPRO.NS,SBIN.NS,LT.NS,AXISBANK.NS,BAJFINANCE.NS',
  'EV & Tech':       'TSLA,RIVN,NIO,XPEV,LCID,NVDA,AMD,INTC,QCOM,ASML',
}

const Label = ({ children }) => (
  <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, marginBottom: 6 }}>{children}</div>
)

const RangeInput = ({ value, onChange, placeholder }) => (
  <input
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${BORDER}`,
      borderRadius: 9999,
      color: 'rgba(255,255,255,0.87)',
      fontFamily: MONO,
      fontSize: 11,
      padding: '5px 12px',
      outline: 'none',
      width: 80,
      transition: 'border-color 0.2s',
    }}
    onFocus={e => e.target.style.borderColor = 'rgba(155,81,224,0.5)'}
    onBlur={e => e.target.style.borderColor = BORDER}
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
      fontFamily: MONO,
      fontSize: 8,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      borderBottom: `1px solid ${BORDER}`,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      ...(sortKey === k
        ? { background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
        : { color: MUTED }),
    }}>
      {label} {sortKey === k ? (sortDir === 'desc' ? '↓' : '↑') : ''}
    </th>
  )

  return (
    <div style={{ flex: 1, padding: '24px 32px 40px', overflowY: 'auto', background: '#09090f' }}>

      {/* Section header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: SORA, fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Stock Screener</div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: MUTED, letterSpacing: '0.06em' }}>Filter and rank equities by fundamental & technical criteria</div>
      </div>

      {/* Symbol input + presets */}
      <div style={{ marginBottom: 20 }}>
        <Label>Symbols (comma separated)</Label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <textarea
            value={symbolInput}
            onChange={e => setSymbolInput(e.target.value.toUpperCase())}
            placeholder="AAPL, MSFT, GOOGL, TSLA, NVDA..."
            rows={2}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              color: 'rgba(255,255,255,0.87)',
              fontFamily: MONO,
              fontSize: 12,
              padding: '10px 16px',
              outline: 'none',
              resize: 'none',
              width: 480,
              lineHeight: 1.7,
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(155,81,224,0.4)'}
            onBlur={e => e.target.style.borderColor = BORDER}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(PRESETS).map(([label, syms]) => (
              <button
                key={label}
                onClick={() => setSymbolInput(syms)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 9999,
                  color: MUTED,
                  fontFamily: MONO,
                  fontSize: 10,
                  padding: '6px 16px',
                  cursor: 'pointer',
                  letterSpacing: '0.06em',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { e.target.style.borderColor = 'rgba(155,81,224,0.4)'; e.target.style.color = '#9b51e0' }}
                onMouseLeave={e => { e.target.style.borderColor = BORDER; e.target.style.color = MUTED }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'P/E Ratio',      keys: ['pe_min', 'pe_max'],               range: true },
          { label: 'RSI (14)',        keys: ['rsi_min', 'rsi_max'],             range: true },
          { label: 'Market Cap ($B)', keys: ['cap_min', 'cap_max'],             range: true },
          { label: 'Volume Min (M)',  keys: ['volume_min'],                     range: false },
          { label: '52W Change %',   keys: ['change_52w_min', 'change_52w_max'], range: true },
        ].map(({ label, keys, range }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 14px' }}>
            <Label>{label}</Label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <RangeInput value={filters[keys[0]]} onChange={v => setF(keys[0], v)} placeholder={range ? 'Min' : 'e.g. 10'} />
              {range && <>
                <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 11 }}>—</span>
                <RangeInput value={filters[keys[1]]} onChange={v => setF(keys[1], v)} placeholder="Max" />
              </>}
            </div>
          </div>
        ))}

        {/* Sector */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 14px' }}>
          <Label>Sector</Label>
          <select
            value={filters.sector}
            onChange={e => setF('sector', e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${BORDER}`,
              borderRadius: 9999,
              color: 'rgba(255,255,255,0.87)',
              fontFamily: MONO,
              fontSize: 10,
              padding: '5px 10px',
              outline: 'none',
              width: '100%',
            }}
          >
            {SECTORS.map(s => <option key={s} value={s} style={{ background: '#0d0d1a' }}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Run button + info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button
          onClick={handleRun}
          disabled={loading}
          style={{
            background: loading ? 'rgba(255,255,255,0.04)' : GRAD,
            border: 'none',
            borderRadius: 9999,
            color: loading ? MUTED : '#fff',
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '10px 32px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 24px rgba(155,81,224,0.35)',
            transition: 'all 0.2s',
          }}
        >
          {loading ? 'Screening...' : 'Run Screen'}
        </button>
        {ran && !loading && (
          <div style={{ fontFamily: MONO, fontSize: 10, color: MUTED, letterSpacing: '0.06em' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} · click column to sort · click row to load chart
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(155,81,224,0.2)', borderTopColor: '#9b51e0', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Fetching data in parallel...
          </div>
        </div>
      )}

      {/* Results table */}
      {!loading && results.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', overflowX: 'auto', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #9b51e0, #0693e3, transparent)' }} />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
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
                    borderBottom: `1px solid rgba(255,255,255,0.04)`,
                    cursor: 'pointer',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(155,81,224,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
                >
                  <td style={{ padding: '11px 14px', fontFamily: MONO, fontSize: 12, fontWeight: 700, background: 'transparent', backgroundImage: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.symbol}</td>
                  <td style={{ padding: '11px 14px', fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.45)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</td>
                  <td style={{ padding: '11px 14px', fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.87)', textAlign: 'right' }}>${s.price?.toFixed(2) ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontFamily: MONO, fontSize: 12, color: (s.change_pct ?? 0) >= 0 ? UP : DOWN, textAlign: 'right', fontWeight: 600 }}>
                    {s.change_pct != null ? `${s.change_pct >= 0 ? '+' : ''}${s.change_pct.toFixed(2)}%` : '—'}
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'right' }}>{s.pe_ratio ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontFamily: MONO, fontSize: 12, textAlign: 'right', fontWeight: 600, color: s.rsi == null ? MUTED : s.rsi > 70 ? DOWN : s.rsi < 30 ? UP : 'rgba(255,255,255,0.6)' }}>
                    {s.rsi ?? '—'}
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'right' }}>
                    {s.market_cap ? `$${(s.market_cap / 1e9).toFixed(1)}B` : '—'}
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'right' }}>
                    {s.volume ? `${(s.volume / 1e6).toFixed(1)}M` : '—'}
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: MONO, fontSize: 12, textAlign: 'right', fontWeight: 600, color: (s.change_52w ?? 0) >= 0 ? UP : DOWN }}>
                    {s.change_52w != null ? `${s.change_52w >= 0 ? '+' : ''}${s.change_52w.toFixed(1)}%` : '—'}
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{s.sector}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!loading && ran && results.length === 0 && (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 32 }}>🔍</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            No stocks match your filters
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
