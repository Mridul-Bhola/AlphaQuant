import { useState } from 'react'
import { runOptimizer } from '../services/api'
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceDot, Cell
} from 'recharts'

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

const METHODS = [
  { key: 'efficient_frontier', label: 'Efficient Frontier', desc: 'Max Sharpe + Min Vol' },
  { key: 'hrp',                label: 'HRP',                desc: 'Hierarchical Risk Parity' },
]

const PERIODS = ['1y', '2y', '3y', '5y']
const PRESETS = {
  'FAANG+':    'AAPL,MSFT,GOOGL,META,AMZN,NVDA',
  'India Top': 'RELIANCE.NS,TCS.NS,INFY.NS,HDFCBANK.NS,ICICIBANK.NS',
  'Balanced':  'AAPL,MSFT,JPM,JNJ,XOM,GLD,BND',
}

const COLORS = ['#C9A96E', '#8B4513', '#A07850', '#D4B896', '#7A5C40', '#BF9B6F', '#6B4226', '#E8C99A']

const getCurrencySymbol = (code) => code === 'INR' ? '₹' : '$'
const formatMoney = (value, currencyCode) => `${getCurrencySymbol(currencyCode)}${Number(value).toLocaleString()}`

const Metric = ({ label, value, accent }) => (
  <div style={{ padding: '12px 20px', borderRight: `1px solid ${C.border}`, flex: 1 }}>
    <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, marginBottom: 6 }}>{label}</div>
    <div style={{ fontFamily: F.mono, fontSize: 16, color: accent || C.parchment, fontWeight: 500 }}>{value}</div>
  </div>
)

const WeightBar = ({ symbol, weight, color }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.06em' }}>{symbol}</span>
      <span style={{ fontFamily: F.mono, fontSize: 11, color: C.parchment }}>{(weight * 100).toFixed(1)}%</span>
    </div>
    <div style={{ height: 3, background: 'rgba(201,169,110,0.1)', width: '100%' }}>
      <div style={{ height: '100%', width: `${weight * 100}%`, background: color || C.gold, transition: 'width 0.6s ease' }} />
    </div>
  </div>
)

const customTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: C.nav, border: `1px solid rgba(201,169,110,0.2)`, padding: '10px 14px', fontFamily: F.mono, fontSize: 11 }}>
      <div style={{ color: C.gold, marginBottom: 4 }}>{d.symbol || 'Portfolio'}</div>
      <div style={{ color: C.parchment }}>Return: {d.return?.toFixed(2)}%</div>
      <div style={{ color: C.parchment }}>Vol: {d.volatility?.toFixed(2)}%</div>
      {d.sharpe && <div style={{ color: C.parchment }}>Sharpe: {d.sharpe?.toFixed(2)}</div>}
    </div>
  )
}

export default function Optimizer() {
  const [symbolInput, setSymbolInput] = useState('')
  const [method, setMethod]         = useState('efficient_frontier')
  const [period, setPeriod]         = useState('2y')
  const [capital, setCapital]       = useState('10000')
  const [result, setResult]         = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [activeView, setActiveView] = useState('weights')

  const handleRun = async () => {
    const symbols = symbolInput.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
    if (symbols.length < 2) { setError('Enter at least 2 symbols separated by commas'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await runOptimizer({ symbols, method, period, portfolio_value: +capital })
      setResult(res.data)
      setActiveView('weights')
    } catch (e) {
      console.error(e)
      setError(e?.response?.data?.detail || 'Optimization failed — check symbols and try again')
    } finally { setLoading(false) }
  }

  const weights = result?.method === 'hrp' ? result?.weights : result?.sharpe_weights
  const perf    = result?.method === 'hrp' ? result?.performance : result?.sharpe_performance
  const cur     = result?.display_currency || 'USD'
  const curSym  = getCurrencySymbol(cur)

  const typedSymbols  = symbolInput.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
  const allIndian     = typedSymbols.length > 0 && typedSymbols.every(s => s.endsWith('.NS') || s.endsWith('.BO'))
  const inputCurSym   = allIndian ? '₹' : '$'

  const inputStyle = {
    background: 'transparent',
    border: `1px solid ${C.border}`,
    color: C.parchment,
    fontFamily: F.mono,
    fontSize: 12,
    padding: '5px 10px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    display: 'block',
    transition: 'border-color 0.2s',
  }

  const viewBtn = (v, label) => (
    <button key={v} onClick={() => setActiveView(v)} style={{
      background: activeView === v ? 'rgba(201,169,110,0.1)' : 'transparent',
      border: `1px solid ${activeView === v ? C.gold : C.border}`,
      color: activeView === v ? C.gold : C.muted,
      fontFamily: F.label,
      fontSize: 9,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      padding: '4px 16px',
      cursor: 'pointer',
      transition: 'all 0.15s',
    }}>{label}</button>
  )

  return (
    <div style={{ flex: 1, padding: '28px 40px 40px', overflowY: 'auto', background: C.bg }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, marginBottom: 8 }}>Portfolio Construction</div>
        <div style={{ fontFamily: F.display, fontSize: 28, fontWeight: 300, color: C.parchment, lineHeight: 1.2 }}>
          Optimizer
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', border: `1px solid ${C.border}`, marginBottom: 8 }}>

        <div style={{ padding: '14px 16px', borderRight: `1px solid ${C.border}`, minWidth: 0 }}>
          <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>Symbols</div>
          <input
            value={symbolInput}
            onChange={e => setSymbolInput(e.target.value.toUpperCase())}
            placeholder="AAPL, MSFT, GOOGL, RELIANCE.NS..."
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>

        <div style={{ padding: '14px 16px', borderRight: `1px solid ${C.border}`, minWidth: 0 }}>
          <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>Method</div>
          <select
            value={method}
            onChange={e => setMethod(e.target.value)}
            style={{ ...inputStyle, background: C.bg }}
          >
            {METHODS.map(m => <option key={m.key} value={m.key} style={{ background: C.nav }}>{m.label} — {m.desc}</option>)}
          </select>
        </div>

        <div style={{ padding: '14px 16px', borderRight: `1px solid ${C.border}`, minWidth: 0 }}>
          <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>Period</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                background: period === p ? 'rgba(201,169,110,0.1)' : 'transparent',
                border: `1px solid ${period === p ? C.gold : C.border}`,
                color: period === p ? C.gold : C.muted,
                fontFamily: F.label,
                fontSize: 9,
                padding: '4px 8px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}>{p}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: '14px 16px', borderRight: `1px solid ${C.border}`, minWidth: 0 }}>
          <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>
            Portfolio Value ({inputCurSym})
          </div>
          <input
            value={capital}
            onChange={e => setCapital(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>

        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={handleRun} disabled={loading} style={{
            background: loading ? 'transparent' : 'rgba(201,169,110,0.1)',
            border: `1px solid ${loading ? C.border : C.gold}`,
            color: loading ? C.muted : C.gold,
            fontFamily: F.label,
            fontSize: 9,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            padding: '7px 20px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(201,169,110,0.18)' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'rgba(201,169,110,0.1)' }}
          >
            {loading ? 'Optimizing...' : 'Optimize'}
          </button>
        </div>
      </div>

      {/* Presets */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {Object.entries(PRESETS).map(([label, syms]) => (
          <button key={label} onClick={() => setSymbolInput(syms)} style={{
            background: 'transparent',
            border: `1px solid ${C.border}`,
            color: C.muted,
            fontFamily: F.label,
            fontSize: 9,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '4px 14px',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.4)'; e.currentTarget.style.color = C.gold }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}
          >{label}</button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          border: `1px solid rgba(200,84,74,0.35)`,
          background: 'rgba(200,84,74,0.06)',
          padding: '10px 16px',
          marginBottom: 20,
          fontFamily: F.mono,
          fontSize: 11,
          color: C.down,
          letterSpacing: '0.04em',
        }}>
          {error}
        </div>
      )}

      {/* Mixed currency notice */}
      {!loading && result?.is_mixed && (
        <div style={{
          border: `1px solid rgba(201,169,110,0.3)`,
          background: 'rgba(201,169,110,0.05)',
          padding: '10px 16px',
          marginBottom: 20,
          fontFamily: F.mono,
          fontSize: 11,
          color: C.gold,
          letterSpacing: '0.04em',
        }}>
          Mixed currency portfolio — INR prices converted to USD at ₹{result.fx_rate?.toFixed(2)}/$ for optimization
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 32, height: 32, border: `1px solid ${C.border}`, borderTopColor: C.gold, animation: 'spin 0.9s linear infinite' }} />
          <div style={{ fontFamily: F.label, fontSize: 9, color: C.muted, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Computing optimal weights...
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <>
          {/* Performance strip */}
          <div style={{ display: 'flex', border: `1px solid ${C.border}`, marginBottom: 20, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: C.gold, opacity: 0.5 }} />
            <Metric label="Expected Return"  value={`${perf?.return >= 0 ? '+' : ''}${perf?.return}%`} accent={C.up} />
            <Metric label="Volatility"       value={`${perf?.volatility}%`} accent={C.down} />
            <Metric label="Sharpe Ratio"     value={perf?.sharpe} accent={perf?.sharpe >= 1 ? C.gold : C.parchment} />
            <Metric label="Method"           value={result.method === 'hrp' ? 'HRP' : 'Eff. Frontier'} />
            <Metric label="Assets"           value={result.symbols.length} />
            <div style={{ padding: '12px 20px', flex: 1 }}>
              <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, marginBottom: 6 }}>Cash Leftover</div>
              <div style={{ fontFamily: F.mono, fontSize: 16, color: C.parchment }}>{curSym}{result.leftover}</div>
            </div>
          </div>

          {/* View toggle */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
            {viewBtn('weights', 'Weights')}
            {viewBtn('frontier', 'Efficient Frontier')}
            {viewBtn('allocation', 'Allocation')}
          </div>

          {/* WEIGHTS VIEW */}
          {activeView === 'weights' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ border: `1px solid ${C.border}`, padding: '20px' }}>
                <div style={{ fontFamily: F.label, fontSize: 8, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>
                  {result.method === 'hrp' ? 'HRP Weights' : 'Max Sharpe Weights'}
                </div>
                {weights && Object.entries(weights)
                  .sort((a, b) => b[1] - a[1])
                  .map(([sym, w], i) => (
                    <WeightBar key={sym} symbol={sym} weight={w} color={COLORS[i % COLORS.length]} />
                  ))
                }
              </div>

              {result.method === 'efficient_frontier' && (
                <div style={{ border: `1px solid ${C.border}`, padding: '20px' }}>
                  <div style={{ fontFamily: F.label, fontSize: 8, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>
                    Min Volatility Weights
                  </div>
                  {result.minvol_weights && Object.entries(result.minvol_weights)
                    .sort((a, b) => b[1] - a[1])
                    .map(([sym, w], i) => (
                      <WeightBar key={sym} symbol={sym} weight={w} color={COLORS[i % COLORS.length]} />
                    ))
                  }
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                    <div style={{ fontFamily: F.label, fontSize: 8, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Min Vol Performance</div>
                    <div style={{ display: 'flex', gap: 24 }}>
                      <div>
                        <div style={{ fontFamily: F.label, fontSize: 8, color: C.muted, marginBottom: 2, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Return</div>
                        <div style={{ fontFamily: F.mono, fontSize: 13, color: C.up }}>{result.minvol_performance?.return}%</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: F.label, fontSize: 8, color: C.muted, marginBottom: 2, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Vol</div>
                        <div style={{ fontFamily: F.mono, fontSize: 13, color: C.down }}>{result.minvol_performance?.volatility}%</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: F.label, fontSize: 8, color: C.muted, marginBottom: 2, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sharpe</div>
                        <div style={{ fontFamily: F.mono, fontSize: 13, color: C.parchment }}>{result.minvol_performance?.sharpe}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {result.method === 'hrp' && (
                <div style={{ border: `1px solid ${C.border}`, padding: '20px' }}>
                  <div style={{ fontFamily: F.label, fontSize: 8, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>
                    Correlation Matrix
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${result.symbols.length}, 1fr)`, gap: 2 }}>
                    {result.symbols.map(sym => (
                      <div key={sym} style={{ fontSize: 9, fontFamily: F.label, color: C.muted, textAlign: 'center', marginBottom: 4, letterSpacing: '0.06em' }}>{sym.replace('.NS', '')}</div>
                    ))}
                    {result.corr_data?.map((cell, i) => {
                      const v   = cell.value
                      const abs = Math.abs(v)
                      const bg  = v >= 0
                        ? `rgba(201,169,110,${abs * 0.55})`
                        : `rgba(200,84,74,${abs * 0.55})`
                      return (
                        <div key={i} title={`${cell.x} / ${cell.y}: ${v}`} style={{
                          height: 32, background: bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontFamily: F.mono,
                          color: abs > 0.5 ? C.nav : C.muted,
                        }}>
                          {v.toFixed(2)}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FRONTIER VIEW */}
          {activeView === 'frontier' && result.method === 'efficient_frontier' && (
            <div style={{ border: `1px solid ${C.border}`, padding: '20px' }}>
              <div style={{ fontFamily: F.label, fontSize: 8, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>
                Efficient Frontier — Risk vs Return
              </div>
              <ResponsiveContainer width="100%" height={360}>
                <ScatterChart margin={{ top: 20, right: 40, bottom: 20, left: 20 }}>
                  <XAxis dataKey="volatility" name="Volatility" unit="%" tick={{ fontFamily: F.mono, fontSize: 10, fill: C.muted }} tickLine={false} axisLine={{ stroke: C.border }} label={{ value: 'Volatility %', position: 'insideBottom', offset: -10, fill: C.muted, fontFamily: F.label, fontSize: 10 }} />
                  <YAxis dataKey="return" name="Return" unit="%" tick={{ fontFamily: F.mono, fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} label={{ value: 'Return %', angle: -90, position: 'insideLeft', fill: C.muted, fontFamily: F.label, fontSize: 10 }} />
                  <Tooltip content={customTooltip} />
                  <Scatter data={result.frontier_points} fill={C.gold} opacity={0.5} line={{ stroke: 'rgba(201,169,110,0.2)', strokeWidth: 2 }} lineJointType="monotoneX">
                    {result.frontier_points.map((_, i) => (
                      <Cell key={i} fill={C.gold} fillOpacity={0.3} />
                    ))}
                  </Scatter>
                  <Scatter data={result.assets} fill={C.cognac}>
                    {result.assets.map((a, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Scatter>
                  <ReferenceDot
                    x={result.sharpe_performance.volatility}
                    y={result.sharpe_performance.return}
                    r={8} fill={C.gold} stroke={C.bg} strokeWidth={2}
                    label={{ value: 'Max Sharpe', position: 'top', fill: C.gold, fontFamily: F.label, fontSize: 9, letterSpacing: '0.08em' }}
                  />
                  <ReferenceDot
                    x={result.minvol_performance.volatility}
                    y={result.minvol_performance.return}
                    r={8} fill={C.cognac} stroke={C.bg} strokeWidth={2}
                    label={{ value: 'Min Vol', position: 'top', fill: C.cognac, fontFamily: F.label, fontSize: 9, letterSpacing: '0.08em' }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                {result.assets.map((a, i) => (
                  <div key={a.symbol} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, background: COLORS[i % COLORS.length] }} />
                    <span style={{ fontFamily: F.mono, fontSize: 10, color: C.muted }}>
                      {a.symbol} ({a.return}% / {a.volatility}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'frontier' && result.method === 'hrp' && (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 300, color: C.muted, fontStyle: 'italic' }}>
                Efficient Frontier not available for HRP — switch to Efficient Frontier method
              </div>
            </div>
          )}

          {/* ALLOCATION VIEW */}
          {activeView === 'allocation' && (
            <div style={{ border: `1px solid ${C.border}` }}>
              <div style={{ padding: '16px', borderBottom: `1px solid ${C.border}`, fontFamily: F.label, fontSize: 8, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Discrete Allocation — {formatMoney(parseInt(capital), cur)} portfolio
                {result.is_mixed && <span style={{ color: C.gold, marginLeft: 12 }}>· values in USD (post-conversion)</span>}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.bgCard }}>
                    {['Symbol', 'Currency', 'Shares', 'Weight', 'Approx Value'].map(h => (
                      <th key={h} style={{ padding: '8px 16px', textAlign: h === 'Symbol' || h === 'Currency' ? 'left' : 'right', fontFamily: F.label, fontSize: 8, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.allocation)
                    .sort((a, b) => b[1] - a[1])
                    .map(([sym, shares], i) => {
                      const w          = weights?.[sym] || 0
                      const approxVal  = w * +capital
                      const symCur     = result.currency_map?.[sym] || cur
                      const symCurSym  = getCurrencySymbol(symCur)
                      return (
                        <tr key={sym} style={{ borderBottom: `1px solid rgba(201,169,110,0.07)`, background: i % 2 === 0 ? 'transparent' : 'rgba(201,169,110,0.02)' }}>
                          <td style={{ padding: '10px 16px', fontFamily: F.mono, fontSize: 12, color: C.gold, letterSpacing: '0.06em' }}>{sym}</td>
                          <td style={{ padding: '10px 16px', fontFamily: F.label, fontSize: 10, letterSpacing: '0.08em', color: symCur === 'INR' ? C.gold : C.muted }}>{symCurSym} {symCur}</td>
                          <td style={{ padding: '10px 16px', fontFamily: F.mono, fontSize: 12, color: C.parchment, textAlign: 'right' }}>{shares}</td>
                          <td style={{ padding: '10px 16px', fontFamily: F.mono, fontSize: 12, color: C.parchment, textAlign: 'right' }}>{(w * 100).toFixed(1)}%</td>
                          <td style={{ padding: '10px 16px', fontFamily: F.mono, fontSize: 12, color: C.parchment, textAlign: 'right' }}>
                            {result.is_mixed ? `$${approxVal.toFixed(0)}` : `${curSym}${approxVal.toFixed(0)}`}
                          </td>
                        </tr>
                      )
                    })}
                  <tr style={{ borderTop: `1px solid ${C.border}` }}>
                    <td colSpan={4} style={{ padding: '10px 16px', fontFamily: F.label, fontSize: 9, color: C.muted, textAlign: 'right', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Cash leftover</td>
                    <td style={{ padding: '10px 16px', fontFamily: F.mono, fontSize: 12, color: C.parchment, textAlign: 'right' }}>{curSym}{result.leftover}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
