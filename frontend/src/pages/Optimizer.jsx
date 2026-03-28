import { useState } from 'react'
import { runOptimizer } from '../services/api'
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceDot, Cell
} from 'recharts'

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

const COLORS = ['#4EEAFF', '#818CF8', '#34D399', '#F59E0B', '#FF5C7A', '#A78BFA', '#6EE7B7', '#FCD34D']

// Currency helpers
const getCurrencySymbol = (code) => code === 'INR' ? '₹' : '$'

const formatMoney = (value, currencyCode) => {
  const sym = getCurrencySymbol(currencyCode)
  return `${sym}${Number(value).toLocaleString()}`
}

const Metric = ({ label, value, accent }) => (
  <div style={{ padding: '12px 20px', borderRight: '1px solid #151C2C', flex: 1 }}>
    <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 16, fontFamily: 'JetBrains Mono, monospace', color: accent || '#CBD5E1', fontWeight: 500 }}>{value}</div>
  </div>
)

const WeightBar = ({ symbol, weight, color }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#4EEAFF', letterSpacing: '0.06em' }}>{symbol}</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#CBD5E1' }}>{(weight * 100).toFixed(1)}%</span>
    </div>
    <div style={{ height: 4, background: '#0F1525', width: '100%' }}>
      <div style={{ height: '100%', width: `${weight * 100}%`, background: color || '#4EEAFF', transition: 'width 0.6s ease' }} />
    </div>
  </div>
)

const customTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: '#0F1525', border: '1px solid #1E2840', padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
      <div style={{ color: '#4EEAFF', marginBottom: 4 }}>{d.symbol || 'Portfolio'}</div>
      <div style={{ color: '#CBD5E1' }}>Return: {d.return?.toFixed(2)}%</div>
      <div style={{ color: '#CBD5E1' }}>Vol: {d.volatility?.toFixed(2)}%</div>
      {d.sharpe && <div style={{ color: '#CBD5E1' }}>Sharpe: {d.sharpe?.toFixed(2)}</div>}
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
    if (symbols.length < 2) {
      setError('Enter at least 2 symbols separated by commas')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await runOptimizer({ symbols, method, period, portfolio_value: +capital })
      setResult(res.data)
      setActiveView('weights')
    } catch (e) {
      console.error(e)
      setError(e?.response?.data?.detail || 'Optimization failed — check symbols and try again')
    } finally {
      setLoading(false)
    }
  }

  const weights = result?.method === 'hrp' ? result?.weights : result?.sharpe_weights
  const perf    = result?.method === 'hrp' ? result?.performance : result?.sharpe_performance
  const cur     = result?.display_currency || 'USD'
  const curSym  = getCurrencySymbol(cur)

  // For capital input label — detect from typed symbols before running
  const typedSymbols  = symbolInput.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
  const allIndian     = typedSymbols.length > 0 && typedSymbols.every(s => s.endsWith('.NS') || s.endsWith('.BO'))
  const inputCurSym   = allIndian ? '₹' : '$'

  return (
    <div style={{ flex: 1, padding: '0 40px 40px', overflowY: 'auto', background: '#0B0F1A' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #151C2C', padding: '14px 0', marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Portfolio Optimizer
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 0, border: '1px solid #151C2C', marginBottom: 8 }}>

        {/* Symbols */}
        <div style={{ padding: '14px 16px', borderRight: '1px solid #151C2C', minWidth: 0 }}>
          <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Symbols</div>
          <input
            value={symbolInput}
            onChange={e => setSymbolInput(e.target.value.toUpperCase())}
            placeholder="AAPL, MSFT, GOOGL, RELIANCE.NS..."
            style={{
              background: '#0F1525', border: '1px solid #1E2840', color: '#CBD5E1',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 12, padding: '5px 10px',
              outline: 'none', width: '100%', boxSizing: 'border-box',
              display: 'block', letterSpacing: '0.04em',
            }}
          />
        </div>

        {/* Method */}
        <div style={{ padding: '14px 16px', borderRight: '1px solid #151C2C', minWidth: 0 }}>
          <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Method</div>
          <select
            value={method}
            onChange={e => setMethod(e.target.value)}
            style={{
              background: '#0F1525', border: '1px solid #1E2840', color: '#CBD5E1',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11, padding: '5px 8px',
              outline: 'none', width: '100%', boxSizing: 'border-box',
            }}
          >
            {METHODS.map(m => <option key={m.key} value={m.key}>{m.label} — {m.desc}</option>)}
          </select>
        </div>

        {/* Period */}
        <div style={{ padding: '14px 16px', borderRight: '1px solid #151C2C', minWidth: 0 }}>
          <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Period</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                background: period === p ? '#4EEAFF18' : 'transparent',
                border: `1px solid ${period === p ? '#4EEAFF' : '#1E2840'}`,
                color: period === p ? '#4EEAFF' : '#3A4A6B',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                padding: '4px 8px', cursor: 'pointer', transition: 'all 0.15s',
              }}>{p}</button>
            ))}
          </div>
        </div>

        {/* Capital */}
        <div style={{ padding: '14px 16px', borderRight: '1px solid #151C2C', minWidth: 0 }}>
          <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            Portfolio Value ({inputCurSym})
          </div>
          <input
            value={capital}
            onChange={e => setCapital(e.target.value)}
            style={{
              background: '#0F1525', border: '1px solid #1E2840', color: '#CBD5E1',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 12, padding: '5px 10px',
              outline: 'none', width: '100%', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Run */}
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={handleRun} disabled={loading} style={{
            background: loading ? 'transparent' : '#4EEAFF18',
            border: '1px solid #4EEAFF',
            color: loading ? '#3A4A6B' : '#4EEAFF',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '7px 20px', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}>
            {loading ? 'Optimizing...' : 'Optimize'}
          </button>
        </div>
      </div>

      {/* Presets */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {Object.entries(PRESETS).map(([label, syms]) => (
          <button key={label} onClick={() => setSymbolInput(syms)} style={{
            background: 'transparent', border: '1px solid #1E2840',
            color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10, padding: '4px 14px', cursor: 'pointer',
            letterSpacing: '0.06em', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.target.style.borderColor = '#4EEAFF'; e.target.style.color = '#4EEAFF' }}
            onMouseLeave={e => { e.target.style.borderColor = '#1E2840'; e.target.style.color = '#3A4A6B' }}
          >{label}</button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          border: '1px solid #FF5C7A33', background: '#FF5C7A0A',
          padding: '10px 16px', marginBottom: 20,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          color: '#FF5C7A', letterSpacing: '0.04em',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Mixed currency notice */}
      {!loading && result?.is_mixed && (
        <div style={{
          border: '1px solid #F59E0B33', background: '#F59E0B0A',
          padding: '10px 16px', marginBottom: 20,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          color: '#F59E0B', letterSpacing: '0.04em',
        }}>
          ⚡ Mixed currency portfolio — INR prices converted to USD at ₹{result.fx_rate?.toFixed(2)}/$ for optimization
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#1E2840', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Computing optimal weights...
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <>
          {/* Performance strip */}
          <div style={{ display: 'flex', border: '1px solid #151C2C', marginBottom: 20 }}>
            <Metric label="Expected Return"  value={`${perf?.return >= 0 ? '+' : ''}${perf?.return}%`} accent="#4EEAFF" />
            <Metric label="Volatility"       value={`${perf?.volatility}%`} accent="#FF5C7A" />
            <Metric label="Sharpe Ratio"     value={perf?.sharpe} accent={perf?.sharpe >= 1 ? '#4EEAFF' : '#CBD5E1'} />
            <Metric label="Method"           value={result.method === 'hrp' ? 'HRP' : 'Eff. Frontier'} />
            <Metric label="Assets"           value={result.symbols.length} />
            <div style={{ padding: '12px 20px', flex: 1 }}>
              <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Cash Leftover</div>
              <div style={{ fontSize: 16, fontFamily: 'JetBrains Mono, monospace', color: '#CBD5E1' }}>{curSym}{result.leftover}</div>
            </div>
          </div>

          {/* View toggle */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
            {['weights', 'frontier', 'allocation'].map(v => (
              <button key={v} onClick={() => setActiveView(v)} style={{
                background: activeView === v ? '#4EEAFF18' : 'transparent',
                border: `1px solid ${activeView === v ? '#4EEAFF' : '#1E2840'}`,
                color: activeView === v ? '#4EEAFF' : '#3A4A6B',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '4px 16px', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {v === 'weights' ? 'Weights' : v === 'frontier' ? 'Efficient Frontier' : 'Allocation'}
              </button>
            ))}
          </div>

          {/* WEIGHTS VIEW */}
          {activeView === 'weights' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ border: '1px solid #151C2C', padding: '20px' }}>
                <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
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
                <div style={{ border: '1px solid #151C2C', padding: '20px' }}>
                  <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
                    Min Volatility Weights
                  </div>
                  {result.minvol_weights && Object.entries(result.minvol_weights)
                    .sort((a, b) => b[1] - a[1])
                    .map(([sym, w], i) => (
                      <WeightBar key={sym} symbol={sym} weight={w} color={COLORS[i % COLORS.length]} />
                    ))
                  }
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #151C2C' }}>
                    <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Min Vol Performance</div>
                    <div style={{ display: 'flex', gap: 24 }}>
                      <div>
                        <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', marginBottom: 2 }}>RETURN</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#4EEAFF' }}>{result.minvol_performance?.return}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', marginBottom: 2 }}>VOL</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#FF5C7A' }}>{result.minvol_performance?.volatility}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', marginBottom: 2 }}>SHARPE</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#CBD5E1' }}>{result.minvol_performance?.sharpe}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {result.method === 'hrp' && (
                <div style={{ border: '1px solid #151C2C', padding: '20px' }}>
                  <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
                    Correlation Matrix
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${result.symbols.length}, 1fr)`, gap: 2 }}>
                    {result.symbols.map(sym => (
                      <div key={sym} style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: '#3A4A6B', textAlign: 'center', marginBottom: 4 }}>{sym.replace('.NS', '')}</div>
                    ))}
                    {result.corr_data?.map((cell, i) => {
                      const v   = cell.value
                      const abs = Math.abs(v)
                      const bg  = v >= 0
                        ? `rgba(78,234,255,${abs * 0.6})`
                        : `rgba(255,92,122,${abs * 0.6})`
                      return (
                        <div key={i} title={`${cell.x} / ${cell.y}: ${v}`} style={{
                          height: 32, background: bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontFamily: 'JetBrains Mono, monospace',
                          color: abs > 0.5 ? '#0B0F1A' : '#3A4A6B',
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
            <div style={{ border: '1px solid #151C2C', padding: '20px' }}>
              <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
                Efficient Frontier — Risk vs Return
              </div>
              <ResponsiveContainer width="100%" height={360}>
                <ScatterChart margin={{ top: 20, right: 40, bottom: 20, left: 20 }}>
                  <XAxis dataKey="volatility" name="Volatility" unit="%" tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fill: '#3A4A6B' }} tickLine={false} axisLine={{ stroke: '#151C2C' }} label={{ value: 'Volatility %', position: 'insideBottom', offset: -10, fill: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }} />
                  <YAxis dataKey="return" name="Return" unit="%" tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fill: '#3A4A6B' }} tickLine={false} axisLine={false} label={{ value: 'Return %', angle: -90, position: 'insideLeft', fill: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }} />
                  <Tooltip content={customTooltip} />
                  <Scatter data={result.frontier_points} fill="#4EEAFF" opacity={0.5} line={{ stroke: '#4EEAFF22', strokeWidth: 2 }} lineJointType="monotoneX">
                    {result.frontier_points.map((_, i) => (
                      <Cell key={i} fill="#4EEAFF" fillOpacity={0.3} />
                    ))}
                  </Scatter>
                  <Scatter data={result.assets} fill="#FF5C7A" shape="star">
                    {result.assets.map((a, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Scatter>
                  <ReferenceDot
                    x={result.sharpe_performance.volatility}
                    y={result.sharpe_performance.return}
                    r={8} fill="#4EEAFF" stroke="#0B0F1A" strokeWidth={2}
                    label={{ value: 'Max Sharpe', position: 'top', fill: '#4EEAFF', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}
                  />
                  <ReferenceDot
                    x={result.minvol_performance.volatility}
                    y={result.minvol_performance.return}
                    r={8} fill="#818CF8" stroke="#0B0F1A" strokeWidth={2}
                    label={{ value: 'Min Vol', position: 'top', fill: '#818CF8', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid #151C2C' }}>
                {result.assets.map((a, i) => (
                  <div key={a.symbol} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#8899BB' }}>
                      {a.symbol} ({a.return}% / {a.volatility}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'frontier' && result.method === 'hrp' && (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #151C2C' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#1E2840', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Efficient Frontier not available for HRP — switch to Efficient Frontier method
              </div>
            </div>
          )}

          {/* ALLOCATION VIEW */}
          {activeView === 'allocation' && (
            <div style={{ border: '1px solid #151C2C' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #151C2C', fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Discrete Allocation — {formatMoney(parseInt(capital), cur)} portfolio
                {result.is_mixed && <span style={{ color: '#F59E0B', marginLeft: 12 }}>· values in USD (post-conversion)</span>}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0A0E18' }}>
                    {['Symbol', 'Currency', 'Shares', 'Weight', 'Approx Value'].map(h => (
                      <th key={h} style={{ padding: '8px 16px', textAlign: h === 'Symbol' || h === 'Currency' ? 'left' : 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#3A4A6B', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #151C2C', fontWeight: 400 }}>{h}</th>
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
                        <tr key={sym} style={{ borderBottom: '1px solid #0D1120', background: i % 2 === 0 ? 'transparent' : '#0A0E1855' }}>
                          <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#4EEAFF', letterSpacing: '0.06em' }}>{sym}</td>
                          <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: symCur === 'INR' ? '#F59E0B' : '#3A4A6B' }}>{symCurSym} {symCur}</td>
                          <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#CBD5E1', textAlign: 'right' }}>{shares}</td>
                          <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#CBD5E1', textAlign: 'right' }}>{(w * 100).toFixed(1)}%</td>
                          <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#CBD5E1', textAlign: 'right' }}>
                            {result.is_mixed ? `$${approxVal.toFixed(0)}` : `${curSym}${approxVal.toFixed(0)}`}
                          </td>
                        </tr>
                      )
                    })}
                  <tr style={{ borderTop: '1px solid #151C2C' }}>
                    <td colSpan={4} style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#3A4A6B', textAlign: 'right' }}>Cash leftover</td>
                    <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#CBD5E1', textAlign: 'right' }}>{curSym}{result.leftover}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}