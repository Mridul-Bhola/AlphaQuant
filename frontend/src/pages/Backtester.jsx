import { useState } from 'react'
import { runBacktest } from '../services/api'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

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

const STRATEGIES = [
  { key: 'sma_crossover', label: 'SMA Crossover', desc: '50 / 200 day' },
  { key: 'rsi',           label: 'RSI Strategy',  desc: 'Buy <30, Sell >70' },
  { key: 'macd',          label: 'MACD Crossover', desc: 'Signal line cross' },
  { key: 'bb_breakout',   label: 'BB Breakout',    desc: 'Band mean reversion' },
]

const PERIODS = ['6mo', '1y', '2y', '5y']

const Metric = ({ label, value, accent }) => (
  <div style={{ padding: '14px 20px', borderRight: `1px solid ${C.border}`, flex: 1 }}>
    <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, marginBottom: 6 }}>{label}</div>
    <div style={{ fontFamily: F.mono, fontSize: 18, color: accent || C.parchment, fontWeight: 500 }}>{value}</div>
  </div>
)

const tooltipStyle = {
  background: C.nav,
  border: `1px solid rgba(201,169,110,0.2)`,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  color: '#EDE5D0',
}

export default function Backtester({ defaultSymbol }) {
  const [symbol, setSymbol]     = useState(defaultSymbol || 'AAPL')
  const [strategy, setStrategy] = useState('sma_crossover')
  const [period, setPeriod]     = useState('2y')
  const [capital, setCapital]   = useState('10000')
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [activeChart, setActiveChart] = useState('equity')

  const handleRun = async () => {
    setLoading(true)
    try {
      const res = await runBacktest({ symbol, strategy, period, initial_capital: +capital })
      setResult(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const isPositive = (result?.total_return ?? 0) >= 0

  const inputStyle = {
    background: 'transparent',
    border: `1px solid ${C.border}`,
    color: C.parchment,
    fontFamily: F.mono,
    fontSize: 12,
    padding: '5px 10px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{ flex: 1, padding: '28px 40px 40px', overflowY: 'auto', background: C.bg }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, marginBottom: 8 }}>Strategy Testing</div>
        <div style={{ fontFamily: F.display, fontSize: 28, fontWeight: 300, color: C.parchment, lineHeight: 1.2 }}>
          Backtester
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', border: `1px solid ${C.border}`, marginBottom: 22 }}>

        {/* Symbol */}
        <div style={{ padding: '14px 16px', borderRight: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>Symbol</div>
          <input
            value={symbol}
            onChange={e => setSymbol(e.target.value.toUpperCase())}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>

        {/* Strategy */}
        <div style={{ padding: '14px 16px', borderRight: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>Strategy</div>
          <select
            value={strategy}
            onChange={e => setStrategy(e.target.value)}
            style={{ ...inputStyle, background: C.bg }}
          >
            {STRATEGIES.map(s => (
              <option key={s.key} value={s.key} style={{ background: C.nav }}>{s.label} — {s.desc}</option>
            ))}
          </select>
        </div>

        {/* Period */}
        <div style={{ padding: '14px 16px', borderRight: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>Period</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                background: period === p ? 'rgba(201,169,110,0.1)' : 'transparent',
                border: `1px solid ${period === p ? C.gold : C.border}`,
                color: period === p ? C.gold : C.muted,
                fontFamily: F.label,
                fontSize: 9,
                letterSpacing: '0.08em',
                padding: '4px 10px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}>{p}</button>
            ))}
          </div>
        </div>

        {/* Capital */}
        <div style={{ padding: '14px 16px', borderRight: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>Initial Capital ($)</div>
          <input
            value={capital}
            onChange={e => setCapital(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>

        {/* Run */}
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={handleRun} disabled={loading} style={{
            background: loading ? 'transparent' : 'rgba(201,169,110,0.1)',
            border: `1px solid ${loading ? C.border : C.gold}`,
            color: loading ? C.muted : C.gold,
            fontFamily: F.label,
            fontSize: 9,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            padding: '7px 24px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(201,169,110,0.18)' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'rgba(201,169,110,0.1)' }}
          >
            {loading ? 'Running...' : 'Run Backtest'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 32, height: 32, border: `1px solid ${C.border}`, borderTopColor: C.gold, animation: 'spin 0.9s linear infinite' }} />
          <div style={{ fontFamily: F.label, fontSize: 9, color: C.muted, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Simulating strategy...
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <>
          {/* Metrics strip */}
          <div style={{ display: 'flex', border: `1px solid ${C.border}`, marginBottom: 20, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: C.gold, opacity: 0.5 }} />
            <Metric label="Total Return"  value={`${result.total_return >= 0 ? '+' : ''}${result.total_return}%`} accent={isPositive ? C.up : C.down} />
            <Metric label="Final Equity"  value={`$${result.final_equity.toLocaleString()}`} />
            <Metric label="Sharpe Ratio"  value={result.sharpe_ratio} accent={result.sharpe_ratio >= 1 ? C.gold : result.sharpe_ratio >= 0 ? C.parchment : C.down} />
            <Metric label="Max Drawdown"  value={`${result.max_drawdown}%`} accent={C.down} />
            <Metric label="Total Trades"  value={result.total_trades} />
            <Metric label="Win Rate"      value={`${result.win_rate}%`} accent={result.win_rate >= 50 ? C.up : C.down} />
            <Metric label="Avg Win"       value={`+${result.avg_win}%`} accent={C.up} />
            <div style={{ padding: '14px 20px', flex: 1 }}>
              <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, marginBottom: 6 }}>Avg Loss</div>
              <div style={{ fontFamily: F.mono, fontSize: 18, color: C.down, fontWeight: 500 }}>{result.avg_loss}%</div>
            </div>
          </div>

          {/* Chart toggle */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {['equity', 'drawdown'].map(ch => (
              <button key={ch} onClick={() => setActiveChart(ch)} style={{
                background: activeChart === ch ? 'rgba(201,169,110,0.1)' : 'transparent',
                border: `1px solid ${activeChart === ch ? C.gold : C.border}`,
                color: activeChart === ch ? C.gold : C.muted,
                fontFamily: F.label,
                fontSize: 9,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '4px 16px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}>{ch === 'equity' ? 'Equity Curve' : 'Drawdown'}</button>
            ))}
          </div>

          {/* Equity curve */}
          {activeChart === 'equity' && (
            <div style={{ border: `1px solid ${C.border}`, padding: '16px', marginBottom: 20 }}>
              <div style={{ fontFamily: F.label, fontSize: 8, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
                Equity Curve — {result.symbol} · {STRATEGIES.find(s => s.key === result.strategy)?.label}
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={result.equity_curve}>
                  <defs>
                    <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#C9A96E" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fontFamily: F.mono, fontSize: 10, fill: C.muted }} tickLine={false} axisLine={{ stroke: C.border }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontFamily: F.mono, fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={v => [`$${v.toLocaleString()}`, 'Equity']} />
                  <ReferenceLine y={result.initial_capital} stroke={C.border} strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="value" stroke={C.gold} strokeWidth={2} fill="url(#eq)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Drawdown */}
          {activeChart === 'drawdown' && (
            <div style={{ border: `1px solid ${C.border}`, padding: '16px', marginBottom: 20 }}>
              <div style={{ fontFamily: F.label, fontSize: 8, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
                Drawdown Curve
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={result.drawdown_curve}>
                  <defs>
                    <linearGradient id="dd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#C8544A" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#C8544A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fontFamily: F.mono, fontSize: 10, fill: C.muted }} tickLine={false} axisLine={{ stroke: C.border }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontFamily: F.mono, fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} tickFormatter={v => `${v.toFixed(0)}%`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v.toFixed(2)}%`, 'Drawdown']} />
                  <ReferenceLine y={0} stroke={C.border} />
                  <Area type="monotone" dataKey="value" stroke={C.down} strokeWidth={2} fill="url(#dd)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Trade log */}
          {result.trades.length > 0 && (
            <div style={{ border: `1px solid ${C.border}` }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontFamily: F.label, fontSize: 8, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Trade Log — last {result.trades.length} trades
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.bgCard }}>
                      {['Entry Date', 'Exit Date', 'Entry Price', 'Exit Price', 'P&L ($)', 'P&L (%)', 'Result'].map(h => (
                        <th key={h} style={{ padding: '8px 14px', textAlign: h.includes('Date') || h === 'Result' ? 'left' : 'right', fontFamily: F.label, fontSize: 8, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...result.trades].reverse().map((t, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid rgba(201,169,110,0.07)`, background: i % 2 === 0 ? 'transparent' : 'rgba(201,169,110,0.02)' }}>
                        <td style={{ padding: '9px 14px', fontFamily: F.mono, fontSize: 11, color: C.muted }}>{t.entry_date}</td>
                        <td style={{ padding: '9px 14px', fontFamily: F.mono, fontSize: 11, color: C.muted }}>{t.exit_date}</td>
                        <td style={{ padding: '9px 14px', fontFamily: F.mono, fontSize: 11, color: C.parchment, textAlign: 'right' }}>${t.entry_price}</td>
                        <td style={{ padding: '9px 14px', fontFamily: F.mono, fontSize: 11, color: C.parchment, textAlign: 'right' }}>${t.exit_price}</td>
                        <td style={{ padding: '9px 14px', fontFamily: F.mono, fontSize: 11, textAlign: 'right', color: t.pnl >= 0 ? C.up : C.down }}>
                          {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                        </td>
                        <td style={{ padding: '9px 14px', fontFamily: F.mono, fontSize: 11, textAlign: 'right', color: t.pnl_pct >= 0 ? C.up : C.down }}>
                          {t.pnl_pct >= 0 ? '+' : ''}{t.pnl_pct.toFixed(2)}%
                        </td>
                        <td style={{ padding: '9px 14px', fontFamily: F.label, fontSize: 9 }}>
                          <span style={{
                            padding: '2px 10px',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            border: `1px solid ${t.result === 'win' ? 'rgba(109,170,109,0.35)' : 'rgba(200,84,74,0.35)'}`,
                            color: t.result === 'win' ? C.up : C.down,
                          }}>{t.result}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
