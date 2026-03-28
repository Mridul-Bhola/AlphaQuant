import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/* ─────────────────────────────────────────────────────────────
   PALETTE
───────────────────────────────────────────────────────────── */
const C = {
  cream:     '#F5F0E8',
  parchment: '#EDE5D0',
  warmWhite: '#FAF7F2',
  espresso:  '#1C1410',
  walnut:    '#3D2B1F',
  cognac:    '#8B4513',
  brass:     '#A07850',
  gold:      '#C9A96E',
  muted:     '#7A6A58',
  faint:     '#B5A898',
  rule:      '#D4C4A8',
}

/* ─────────────────────────────────────────────────────────────
   FONTS
───────────────────────────────────────────────────────────── */
const F = {
  display: "'Cormorant Garamond', serif",
  body:    "'Libre Baskerville', serif",
  label:   "'Josefin Sans', sans-serif",
}

/* ─────────────────────────────────────────────────────────────
   GLOBAL RESET (injected once)
───────────────────────────────────────────────────────────── */
const RESET = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: ${C.cream}; color: ${C.walnut}; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${C.cream}; }
  ::-webkit-scrollbar-thumb { background: ${C.rule}; }

  .nav-link-item {
    font-family: ${F.label};
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: ${C.muted};
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 0;
    transition: color 0.2s ease;
    text-decoration: none;
  }
  .nav-link-item:hover { color: ${C.walnut}; }

  .btn-launch {
    font-family: ${F.label};
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: ${C.walnut};
    background: transparent;
    border: 1px solid ${C.walnut};
    padding: 11px 26px;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
    white-space: nowrap;
  }
  .btn-launch:hover { background: ${C.walnut}; color: ${C.cream}; }

  .btn-primary {
    font-family: ${F.label};
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: ${C.cream};
    background: ${C.walnut};
    border: 1px solid ${C.walnut};
    padding: 14px 36px;
    cursor: pointer;
    transition: background 0.2s ease;
    display: inline-block;
  }
  .btn-primary:hover { background: ${C.espresso}; border-color: ${C.espresso}; }

  .btn-ghost {
    font-family: ${F.label};
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: ${C.muted};
    background: transparent;
    border: none;
    padding: 14px 0;
    cursor: pointer;
    transition: color 0.2s ease;
    display: inline-block;
  }
  .btn-ghost:hover { color: ${C.walnut}; }

  .btn-gold-outline {
    font-family: ${F.label};
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: ${C.gold};
    background: transparent;
    border: 1px solid ${C.gold};
    padding: 16px 48px;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
    display: inline-block;
  }
  .btn-gold-outline:hover { background: ${C.gold}; color: ${C.walnut}; }

  .btn-ghost-screener {
    font-family: ${F.label};
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: ${C.muted};
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: color 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn-ghost-screener:hover { color: ${C.cognac}; }

  .feature-card {
    padding: 48px 40px;
    border-right: 1px solid ${C.rule};
    background: ${C.warmWhite};
    transition: background 0.25s ease;
    cursor: default;
  }
  .feature-card:hover { background: ${C.parchment}; }
  .feature-card:last-child { border-right: none; }

  .screener-row {
    display: grid;
    grid-template-columns: 2fr 1.4fr 0.8fr 0.8fr 0.8fr;
    padding: 11px 20px;
    border-bottom: 1px solid ${C.rule};
    transition: background 0.15s ease;
  }
  .screener-row:hover { background: ${C.parchment}; }
  .screener-row:last-child { border-bottom: none; }

  .footer-link {
    font-family: ${F.label};
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${C.faint};
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s ease;
    opacity: 0.55;
  }
  .footer-link:hover { opacity: 1; }

  @media (max-width: 768px) {
    .hero-grid     { grid-template-columns: 1fr !important; }
    .hero-left     { border-right: none !important; border-bottom: 1px solid ${C.rule}; min-height: unset !important; }
    .hero-right    { min-height: 380px !important; }
    .stats-grid    { grid-template-columns: 1fr 1fr !important; }
    .stat-cell     { border-right: none !important; border-bottom: 1px solid ${C.rule}; }
    .features-grid { grid-template-columns: 1fr !important; }
    .feature-card  { border-right: none !important; border-bottom: 1px solid ${C.rule}; }
    .screener-grid { grid-template-columns: 1fr !important; }
    .screener-left { border-right: none !important; border-bottom: 1px solid ${C.rule}; padding-right: 0 !important; }
    .nav-center    { display: none !important; }
    .hero-h1       { font-size: 46px !important; }
    .section-title { font-size: 34px !important; }
    .cta-title     { font-size: 38px !important; }
  }
`

/* ─────────────────────────────────────────────────────────────
   GOLD RULE
───────────────────────────────────────────────────────────── */
const GoldRule = ({ width = 48, margin = '28px 0' }) => (
  <div style={{ width, height: 1, background: C.gold, margin }} />
)

/* ─────────────────────────────────────────────────────────────
   EYEBROW
───────────────────────────────────────────────────────────── */
const Eyebrow = ({ children, center = false }) => (
  <div style={{
    fontFamily: F.label,
    fontSize: 10,
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    color: C.cognac,
    marginBottom: 18,
    textAlign: center ? 'center' : 'left',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    justifyContent: center ? 'center' : 'flex-start',
  }}>
    {!center && <span style={{ display: 'inline-block', width: 32, height: 1, background: C.cognac, flexShrink: 0 }} />}
    {children}
  </div>
)

/* ─────────────────────────────────────────────────────────────
   HERO DASHBOARD MOCK
───────────────────────────────────────────────────────────── */
function HeroMock() {
  return (
    <div style={{
      maxWidth: 480,
      width: '100%',
      background: C.warmWhite,
      border: `1px solid ${C.rule}`,
    }}>
      {/* Header row */}
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${C.rule}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 600, color: C.walnut, letterSpacing: '0.03em' }}>
            RELIANCE.NS
          </div>
          <div style={{ fontFamily: F.label, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.faint, marginTop: 3 }}>
            Reliance Industries
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 600, color: C.walnut }}>
            ₹2,847.30
          </div>
          <div style={{ fontFamily: F.label, fontSize: 10, letterSpacing: '0.1em', color: '#6B7D4A', marginTop: 3 }}>
            +1.24%
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div style={{ padding: '20px 20px 14px' }}>
        <svg width="100%" height="120" viewBox="0 0 440 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="cogfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.cognac} stopOpacity="0.1"/>
              <stop offset="100%" stopColor={C.cognac} stopOpacity="0"/>
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[30, 55, 80, 105].map(y => (
            <line key={y} x1="0" x2="440" y1={y} y2={y} stroke={C.rule} strokeWidth="0.8"/>
          ))}

          {/* BB upper */}
          <polyline
            points="0,22 50,18 100,24 150,15 200,20 250,12 300,17 350,10 400,14 440,8"
            fill="none" stroke={C.gold} strokeWidth="1" strokeDasharray="3,3"/>

          {/* BB lower */}
          <polyline
            points="0,88 50,82 100,90 150,78 200,84 250,74 300,80 350,70 400,76 440,68"
            fill="none" stroke={C.gold} strokeWidth="1" strokeDasharray="3,3"/>

          {/* Price area fill */}
          <polygon
            points="0,68 50,60 100,72 150,55 200,62 250,50 300,57 350,44 400,51 440,42 440,120 0,120"
            fill="url(#cogfill)"/>

          {/* Price line */}
          <polyline
            points="0,68 50,60 100,72 150,55 200,62 250,50 300,57 350,44 400,51 440,42"
            fill="none" stroke={C.cognac} strokeWidth="1.5"/>

          {/* Candle bodies */}
          {[
            [48,  55, 8,  true ],
            [98,  66, 9,  false],
            [148, 50, 8,  true ],
            [198, 57, 10, true ],
            [248, 45, 9,  true ],
            [298, 52, 8,  false],
            [348, 40, 9,  true ],
            [398, 47, 8,  true ],
          ].map(([x, y, h, up], i) => (
            <g key={i}>
              <line x1={x} x2={x} y1={y - 5} y2={y + h + 5} stroke={up ? '#6B7D4A' : C.cognac} strokeWidth="0.8"/>
              <rect x={x - 3} y={y} width={6} height={h} fill={up ? '#6B7D4A' : C.cognac}/>
            </g>
          ))}
        </svg>
      </div>

      {/* Metrics row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        borderTop: `1px solid ${C.rule}`,
      }}>
        {[['Mkt Cap', '₹19.3T'], ['P / E', '27.4'], ['52W High', '₹3,217']].map(([label, val], i) => (
          <div key={label} style={{
            padding: '16px 18px',
            borderRight: i < 2 ? `1px solid ${C.rule}` : 'none',
          }}>
            <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.faint, marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 600, color: C.walnut }}>
              {val}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SCREENER MOCK TABLE
───────────────────────────────────────────────────────────── */
const ROWS = [
  { sym: 'RELIANCE.NS', sector: 'Energy',     pe: '27.4', rsi: '58.2', chg: '+14.3%', pos: true  },
  { sym: 'TCS.NS',      sector: 'Technology', pe: '31.2', rsi: '62.1', chg: '+8.7%',  pos: true  },
  { sym: 'HDFC.NS',     sector: 'Finance',    pe: '18.9', rsi: '44.3', chg: '−3.2%',  pos: false },
  { sym: 'INFY.NS',     sector: 'Technology', pe: '24.6', rsi: '55.8', chg: '+11.1%', pos: true  },
  { sym: 'WIPRO.NS',    sector: 'Technology', pe: '21.3', rsi: '48.9', chg: '+2.4%',  pos: true  },
]

function ScreenerMock() {
  const cols = ['Symbol', 'Sector', 'P/E', 'RSI', '52W %']
  return (
    <div style={{ background: C.warmWhite, border: `1px solid ${C.rule}` }}>
      {/* Header */}
      <div className="screener-row" style={{ background: C.parchment }}>
        {cols.map(c => (
          <div key={c} style={{
            fontFamily: F.label,
            fontSize: 9,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: C.faint,
          }}>{c}</div>
        ))}
      </div>
      {/* Data rows */}
      {ROWS.map((r, i) => (
        <div key={r.sym} className="screener-row" style={{ background: i % 2 === 0 ? 'transparent' : C.parchment }}>
          <div style={{ fontFamily: F.display, fontSize: 14, fontWeight: 600, color: C.walnut }}>{r.sym}</div>
          <div style={{ fontFamily: F.body,    fontSize: 12, color: C.muted }}>{r.sector}</div>
          <div style={{ fontFamily: F.body,    fontSize: 12, color: C.muted }}>{r.pe}</div>
          <div style={{ fontFamily: F.body,    fontSize: 12, color: C.muted }}>{r.rsi}</div>
          <div style={{
            fontFamily: F.body, fontSize: 12, fontWeight: 700,
            color: r.pos ? '#6B7D4A' : C.cognac,
          }}>{r.chg}</div>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────────────── */
export default function Landing() {
  const navigate  = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize) }
  }, [])

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      <style>{RESET}</style>

      <div style={{ background: C.cream, color: C.walnut, minHeight: '100vh' }}>

        {/* ══════════════════════════════════════════
            1. NAV
        ══════════════════════════════════════════ */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: C.warmWhite,
          borderBottom: `1px solid ${scrolled ? C.rule : 'transparent'}`,
          padding: isMobile ? '20px 28px' : '24px 60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'border-color 0.3s ease',
        }}>
          {/* Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ cursor: 'pointer', fontFamily: F.display, fontSize: 22, fontWeight: 300, letterSpacing: '0.25em', textTransform: 'uppercase', userSelect: 'none' }}
          >
            <span style={{ color: C.walnut }}>ALPHA</span>
            <em style={{ color: C.cognac, fontStyle: 'italic', fontWeight: 300 }}>Quant</em>
          </div>

          {/* Center links */}
          <div className="nav-center" style={{ display: isMobile ? 'none' : 'flex', gap: 44 }}>
            {[['Features', 'features'], ['Screener', 'screener'], ['Backtester', 'features'], ['Optimizer', 'features']].map(([label, id]) => (
              <button key={label} className="nav-link-item" onClick={() => scrollTo(id)}>{label}</button>
            ))}
          </div>

          {/* CTA */}
          <button className="btn-launch" onClick={() => navigate('/app')}>
            Launch App
          </button>
        </nav>

        {/* ══════════════════════════════════════════
            2. HERO
        ══════════════════════════════════════════ */}
        <section style={{ paddingTop: 80 }}>
          <div
            className="hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              minHeight: '88vh',
              alignItems: 'stretch',
            }}
          >
            {/* LEFT */}
            <div
              className="hero-left"
              style={{
                padding: isMobile ? '60px 28px' : '80px 60px',
                borderRight: isMobile ? 'none' : `1px solid ${C.rule}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Eyebrow>Institutional-grade analysis</Eyebrow>

              <h1 className="hero-h1" style={{
                fontFamily: F.display,
                fontSize: 62,
                fontWeight: 300,
                lineHeight: 1.08,
                letterSpacing: '-0.01em',
                color: C.walnut,
                marginBottom: 0,
              }}>
                Trade with
                <em style={{ display: 'block', color: C.cognac, fontStyle: 'italic' }}>conviction.</em>
              </h1>

              <GoldRule width={60} margin="32px 0" />

              <p style={{
                fontFamily: F.body,
                fontSize: 15,
                lineHeight: 1.9,
                color: C.muted,
                maxWidth: 400,
                marginBottom: 44,
              }}>
                Professional charting, portfolio optimisation, and strategy
                backtesting — refined for the discerning investor.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
                <button className="btn-primary" onClick={() => navigate('/app')}>
                  Begin Analysis
                </button>
                <button className="btn-ghost" onClick={() => scrollTo('features')}>
                  View Demo →
                </button>
              </div>
            </div>

            {/* RIGHT */}
            <div
              className="hero-right"
              style={{
                background: C.parchment,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '48px 28px' : '60px 48px',
                minHeight: isMobile ? 480 : 'auto',
              }}
            >
              <HeroMock />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            3. STATS BAR
        ══════════════════════════════════════════ */}
        <section style={{
          background: C.warmWhite,
          borderTop: `1px solid ${C.rule}`,
          borderBottom: `1px solid ${C.rule}`,
        }}>
          <div
            className="stats-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            }}
          >
            {[
              { num: '10k',  numSuffix: '+', label: 'Stocks Tracked',       italic: false },
              { num: '4',    numSuffix: '',  label: 'Optimisation Methods',  italic: false },
              { num: 'Live', numSuffix: '',  label: 'WebSocket Prices',      italic: true  },
              { num: '<200', numSuffix: 'ms',label: 'Latency',               italic: false },
            ].map(({ num, numSuffix, label, italic }, i, arr) => (
              <div
                key={label}
                className="stat-cell"
                style={{
                  padding: '36px 40px',
                  borderRight: (!isMobile && i < arr.length - 1) ? `1px solid ${C.rule}` : 'none',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontFamily: F.display,
                  fontSize: 40,
                  fontWeight: 300,
                  color: C.walnut,
                  lineHeight: 1,
                  marginBottom: 10,
                  fontStyle: italic ? 'italic' : 'normal',
                }}>
                  {italic ? (
                    <em style={{ color: C.cognac }}>{num}</em>
                  ) : (
                    <>
                      {num}
                      <em style={{ color: C.cognac, fontSize: 32 }}>{numSuffix}</em>
                    </>
                  )}
                </div>
                <div style={{
                  fontFamily: F.label,
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: C.faint,
                }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            4. FEATURES
        ══════════════════════════════════════════ */}
        <section id="features" style={{ padding: isMobile ? '72px 28px' : '100px 60px', background: C.cream }}>
          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <Eyebrow center>The Suite</Eyebrow>
            <h2
              className="section-title"
              style={{
                fontFamily: F.display,
                fontSize: 42,
                fontWeight: 300,
                color: C.walnut,
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
              }}
            >
              Every tool a serious investor
              <br />
              <em style={{ color: C.cognac, fontStyle: 'italic' }}>requires.</em>
            </h2>
          </div>

          {/* Cards grid */}
          <div
            className="features-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              border: `1px solid ${C.rule}`,
            }}
          >
            {[
              {
                num: '01',
                title: 'Advanced Charting',
                desc: 'Candlestick charts with Bollinger Bands, RSI, and MACD panels. Lightweight Charts v5 — fluid and precise.',
              },
              {
                num: '02',
                title: 'Portfolio Optimisation',
                desc: 'Efficient Frontier, HRP, and Black-Litterman models with discrete allocation and currency-aware weighting.',
              },
              {
                num: '03',
                title: 'Strategy Backtesting',
                desc: 'SMA crossover, RSI, MACD, and Bollinger Band strategies with equity curves, drawdown charts, and Sharpe ratio metrics.',
              },
            ].map(({ num, title, desc }) => (
              <div key={num} className="feature-card">
                {/* Faint decorative number */}
                <div style={{
                  fontFamily: F.display,
                  fontSize: 48,
                  fontWeight: 300,
                  color: C.rule,
                  lineHeight: 1,
                  marginBottom: 24,
                  userSelect: 'none',
                }}>
                  {num}
                </div>

                <h3 style={{
                  fontFamily: F.display,
                  fontSize: 22,
                  fontWeight: 600,
                  color: C.walnut,
                  letterSpacing: '0.01em',
                  marginBottom: 0,
                }}>
                  {title}
                </h3>

                <GoldRule width={32} margin="22px 0 18px" />

                <p style={{
                  fontFamily: F.body,
                  fontSize: 14,
                  lineHeight: 1.85,
                  color: C.muted,
                }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            5. SCREENER CALLOUT
        ══════════════════════════════════════════ */}
        <section
          id="screener"
          style={{
            background: C.parchment,
            borderTop: `1px solid ${C.rule}`,
            borderBottom: `1px solid ${C.rule}`,
          }}
        >
          <div
            className="screener-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1.4fr',
              padding: isMobile ? '72px 28px' : '80px 60px',
              gap: 0,
            }}
          >
            {/* LEFT */}
            <div
              className="screener-left"
              style={{
                paddingRight: isMobile ? 0 : 60,
                borderRight: isMobile ? 'none' : `1px solid ${C.rule}`,
                paddingBottom: isMobile ? 48 : 0,
              }}
            >
              <Eyebrow>Market Intelligence</Eyebrow>

              <h2 style={{
                fontFamily: F.display,
                fontSize: 38,
                fontWeight: 300,
                color: C.walnut,
                lineHeight: 1.2,
                marginBottom: 0,
                letterSpacing: '-0.01em',
              }}>
                Screen 10,000+ stocks{' '}
                <em style={{ color: C.cognac, fontStyle: 'italic' }}>in seconds.</em>
              </h2>

              <GoldRule width={48} margin="28px 0 24px" />

              <p style={{
                fontFamily: F.body,
                fontSize: 14,
                lineHeight: 1.85,
                color: C.muted,
                marginBottom: 32,
                maxWidth: 380,
              }}>
                Filter by P/E ratio, RSI, market capitalisation, volume,
                52-week performance, and sector. Click any result to load
                the full chart.
              </p>

              {/* Bullet list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 44 }}>
                {[
                  'P/E Ratio & RSI thresholds',
                  'Market cap & volume filters',
                  '52-week % performance',
                  'Sector classification',
                ].map(pt => (
                  <div key={pt} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{
                      fontFamily: F.display,
                      fontSize: 16,
                      color: C.gold,
                      lineHeight: 1.6,
                      flexShrink: 0,
                    }}>—</span>
                    <span style={{ fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{pt}</span>
                  </div>
                ))}
              </div>

              <button className="btn-ghost-screener" onClick={() => navigate('/app')}>
                Open Screener →
              </button>
            </div>

            {/* RIGHT */}
            <div style={{ paddingLeft: isMobile ? 0 : 60, paddingTop: isMobile ? 48 : 0 }}>
              <ScreenerMock />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            6. FINAL CTA
        ══════════════════════════════════════════ */}
        <section style={{
          background: C.walnut,
          padding: isMobile ? '80px 28px' : '120px 60px',
          textAlign: 'center',
        }}>
          <h2
            className="cta-title"
            style={{
              fontFamily: F.display,
              fontSize: 52,
              fontWeight: 300,
              lineHeight: 1.12,
              letterSpacing: '-0.01em',
              color: C.parchment,
              marginBottom: 20,
            }}
          >
            Begin trading
            <br />
            <em style={{ color: C.gold, fontStyle: 'italic' }}>with clarity.</em>
          </h2>

          <p style={{
            fontFamily: F.body,
            fontSize: 15,
            color: C.faint,
            lineHeight: 1.8,
            maxWidth: 480,
            margin: '0 auto',
          }}>
            Join discerning investors using AlphaQuant for institutional-grade analysis.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '40px auto' }}>
            <GoldRule width={60} margin="0" />
          </div>

          <button className="btn-gold-outline" onClick={() => navigate('/app')}>
            Launch AlphaQuant
          </button>
        </section>

        {/* ══════════════════════════════════════════
            7. FOOTER
        ══════════════════════════════════════════ */}
        <footer style={{
          background: C.espresso,
          padding: isMobile ? '36px 28px' : '48px 60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
        }}>
          {/* Logo */}
          <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 300, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            <span style={{ color: C.gold }}>ALPHA</span>
            <em style={{ color: C.gold, fontStyle: 'italic', opacity: 0.75 }}>Quant</em>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {['Chart', 'Screener', 'Backtester', 'Optimizer'].map(item => (
              <button key={item} className="footer-link" onClick={() => navigate('/app')}>
                {item}
              </button>
            ))}
          </div>

          {/* Copyright */}
          <div style={{
            fontFamily: F.label,
            fontSize: 10,
            letterSpacing: '0.16em',
            color: C.faint,
            opacity: 0.45,
          }}>
            © 2025 AlphaQuant · Built with React + FastAPI
          </div>
        </footer>

      </div>
    </>
  )
}
