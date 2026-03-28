import { useState } from 'react'
import { runBacktest } from '../services/api'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const STRATEGIES = [
  { key: 'sma_crossover', label: 'SMA Crossover', desc: '50 / 200 day' },
  { key: 'rsi',           label: 'RSI Strategy',  desc: 'Buy <30, Sell >70' },
  { key: 'macd',          label: 'MACD Crossover', desc: 'Signal line cross' },
  { key: 'bb_breakout',   label: 'BB Breakout',    desc: 'Band mean reversion' },
]

const PERIODS = ['6mo', '1y', '2y', '5y']

const Metric = ({ label, value, accent }) => (
  <div style={{ padding: '14px 20px', borderRight: '1px solid #151C2C', flex: 1 }}>
    <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 18, fontFamily: 'JetBrains Mono, monospace', color: accent || '#CBD5E1', fontWeight: 500 }}>{value}</div>
  </div>
)

const customTooltipStyle = {
  background: '#0F1525', border: '1px solid #1E2840',
  fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#CBD5E1',
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

  return (
    <div style={{ flex: 1, padding: '0 40px 40px', overflowY: 'auto', background: '#0B0F1A' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #151C2C', padding: '14px 0', marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Strategy Backtester
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 0, border: '1px solid #151C2C', marginBottom: 20 }}>

        {/* Symbol */}
        <div style={{ padding: '14px 16px', borderRight: '1px solid #151C2C' }}>
          <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Symbol</div>
          <input
            value={symbol}
            onChange={e => setSymbol(e.target.value.toUpperCase())}
            style={{
              background: '#0F1525', border: '1px solid #1E2840', color: '#CBD5E1',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 12, padding: '5px 10px',
              outline: 'none', width: '100%', letterSpacing: '0.06em',
            }}
          />
        </div>

        {/* Strategy */}
        <div style={{ padding: '14px 16px', borderRight: '1px solid #151C2C' }}>
          <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Strategy</div>
          <select
            value={strategy}
            onChange={e => setStrategy(e.target.value)}
            style={{
              background: '#0F1525', border: '1px solid #1E2840', color: '#CBD5E1',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11, padding: '5px 8px',
              outline: 'none', width: '100%',
            }}
          >
            {STRATEGIES.map(s => (
              <option key={s.key} value={s.key}>{s.label} — {s.desc}</option>
            ))}
          </select>
        </div>

        {/* Period */}
        <div style={{ padding: '14px 16px', borderRight: '1px solid #151C2C' }}>
          <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Period</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                background: period === p ? '#4EEAFF18' : 'transparent',
                border: `1px solid ${period === p ? '#4EEAFF' : '#1E2840'}`,
                color: period === p ? '#4EEAFF' : '#3A4A6B',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                padding: '4px 10px', cursor: 'pointer', transition: 'all 0.15s',
              }}>{p}</button>
            ))}
          </div>
        </div>

        {/* Capital */}
        <div style={{ padding: '14px 16px', borderRight: '1px solid #151C2C' }}>
          <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Initial Capital ($)</div>
          <input
            value={capital}
            onChange={e => setCapital(e.target.value)}
            style={{
              background: '#0F1525', border: '1px solid #1E2840', color: '#CBD5E1',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 12, padding: '5px 10px',
              outline: 'none', width: '100%',
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
            padding: '7px 24px', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}>
            {loading ? 'Running...' : 'Run Backtest'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#1E2840', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Simulating strategy...
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <>
          {/* Metrics strip */}
          <div style={{ display: 'flex', border: '1px solid #151C2C', marginBottom: 20 }}>
            <Metric label="Total Return"  value={`${result.total_return >= 0 ? '+' : ''}${result.total_return}%`} accent={isPositive ? '#4EEAFF' : '#FF5C7A'} />
            <Metric label="Final Equity"  value={`$${result.final_equity.toLocaleString()}`} />
            <Metric label="Sharpe Ratio"  value={result.sharpe_ratio} accent={result.sharpe_ratio >= 1 ? '#4EEAFF' : result.sharpe_ratio >= 0 ? '#CBD5E1' : '#FF5C7A'} />
            <Metric label="Max Drawdown"  value={`${result.max_drawdown}%`} accent="#FF5C7A" />
            <Metric label="Total Trades"  value={result.total_trades} />
            <Metric label="Win Rate"      value={`${result.win_rate}%`} accent={result.win_rate >= 50 ? '#4EEAFF' : '#FF5C7A'} />
            <Metric label="Avg Win"       value={`+${result.avg_win}%`} accent="#4EEAFF" />
            <div style={{ padding: '14px 20px', flex: 1 }}>
              <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Avg Loss</div>
              <div style={{ fontSize: 18, fontFamily: 'JetBrains Mono, monospace', color: '#FF5C7A', fontWeight: 500 }}>{result.avg_loss}%</div>
            </div>
          </div>

          {/* Chart toggle */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {['equity', 'drawdown'].map(c => (
              <button key={c} onClick={() => setActiveChart(c)} style={{
                background: activeChart === c ? '#4EEAFF18' : 'transparent',
                border: `1px solid ${activeChart === c ? '#4EEAFF' : '#1E2840'}`,
                color: activeChart === c ? '#4EEAFF' : '#3A4A6B',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '4px 16px', cursor: 'pointer', transition: 'all 0.15s',
              }}>{c === 'equity' ? 'Equity Curve' : 'Drawdown'}</button>
            ))}
          </div>

          {/* Equity curve */}
          {activeChart === 'equity' && (
            <div style={{ border: '1px solid #151C2C', padding: '16px', marginBottom: 20 }}>
              <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                Equity Curve — {result.symbol} · {STRATEGIES.find(s => s.key === result.strategy)?.label}
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={result.equity_curve}>
                  <defs>
                    <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#4EEAFF" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4EEAFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fill: '#3A4A6B' }} tickLine={false} axisLine={{ stroke: '#151C2C' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fill: '#3A4A6B' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={customTooltipStyle} formatter={v => [`$${v.toLocaleString()}`, 'Equity']} />
                  <ReferenceLine y={result.initial_capital} stroke="#1E2840" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="value" stroke="#4EEAFF" strokeWidth={2} fill="url(#eq)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Drawdown */}
          {activeChart === 'drawdown' && (
            <div style={{ border: '1px solid #151C2C', padding: '16px', marginBottom: 20 }}>
              <div style={{ fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                Drawdown Curve
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={result.drawdown_curve}>
                  <defs>
                    <linearGradient id="dd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#FF5C7A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#FF5C7A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fill: '#3A4A6B' }} tickLine={false} axisLine={{ stroke: '#151C2C' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fill: '#3A4A6B' }} tickLine={false} axisLine={false} tickFormatter={v => `${v.toFixed(0)}%`} />
                  <Tooltip contentStyle={customTooltipStyle} formatter={v => [`${v.toFixed(2)}%`, 'Drawdown']} />
                  <ReferenceLine y={0} stroke="#1E2840" />
                  <Area type="monotone" dataKey="value" stroke="#FF5C7A" strokeWidth={2} fill="url(#dd)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Trade log */}
          {result.trades.length > 0 && (
            <div style={{ border: '1px solid #151C2C' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #151C2C', fontSize: 9, color: '#3A4A6B', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Trade Log — last {result.trades.length} trades
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0A0E18' }}>
                      {['Entry Date', 'Exit Date', 'Entry Price', 'Exit Price', 'P&L ($)', 'P&L (%)', 'Result'].map(h => (
                        <th key={h} style={{ padding: '8px 14px', textAlign: h.includes('Date') || h === 'Result' ? 'left' : 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#3A4A6B', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #151C2C', fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...result.trades].reverse().map((t, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #0D1120', background: i % 2 === 0 ? 'transparent' : '#0A0E1855' }}>
                        <td style={{ padding: '9px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#8899BB' }}>{t.entry_date}</td>
                        <td style={{ padding: '9px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#8899BB' }}>{t.exit_date}</td>
                        <td style={{ padding: '9px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#CBD5E1', textAlign: 'right' }}>${t.entry_price}</td>
                        <td style={{ padding: '9px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#CBD5E1', textAlign: 'right' }}>${t.exit_price}</td>
                        <td style={{ padding: '9px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, textAlign: 'right', color: t.pnl >= 0 ? '#4EEAFF' : '#FF5C7A' }}>
                          {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                        </td>
                        <td style={{ padding: '9px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, textAlign: 'right', color: t.pnl_pct >= 0 ? '#4EEAFF' : '#FF5C7A' }}>
                          {t.pnl_pct >= 0 ? '+' : ''}{t.pnl_pct.toFixed(2)}%
                        </td>
                        <td style={{ padding: '9px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                          <span style={{
                            padding: '2px 8px', fontSize: 10, letterSpacing: '0.08em',
                            border: `1px solid ${t.result === 'win' ? '#4EEAFF44' : '#FF5C7A44'}`,
                            color: t.result === 'win' ? '#4EEAFF' : '#FF5C7A',
                          }}>{t.result.toUpperCase()}</span>
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
    </div>
  )
}