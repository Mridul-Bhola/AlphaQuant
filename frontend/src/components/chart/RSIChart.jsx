import { useEffect, useRef } from 'react'
import { createChart, LineSeries } from 'lightweight-charts'

export default function RSIChart({ data }) {
  const ref    = useRef(null)
  const chart  = useRef(null)
  const series = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    chart.current = createChart(ref.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: 'rgba(255,255,255,0.25)',
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)', scaleMargins: { top: 0.1, bottom: 0.1 } },
      timeScale: { borderColor: 'rgba(255,255,255,0.06)', timeVisible: true },
      width: ref.current.clientWidth,
      height: 140,
    })

    series.current = chart.current.addSeries(LineSeries, { color: '#0693e3', lineWidth: 2 })

    // Overbought / oversold reference lines
    const ob = chart.current.addSeries(LineSeries, { color: 'rgba(255,77,109,0.3)', lineWidth: 1, lineStyle: 2 })
    const os = chart.current.addSeries(LineSeries, { color: 'rgba(0,208,132,0.3)',  lineWidth: 1, lineStyle: 2 })

    const ro = new ResizeObserver(() => {
      chart.current?.applyOptions({ width: ref.current.clientWidth })
    })
    ro.observe(ref.current)

    return () => { ro.disconnect(); chart.current?.remove() }
  }, [])

  useEffect(() => {
    if (!series.current || !data?.length) return
    series.current.setData(data.map(d => ({ time: d.time, value: d.rsi })))
    chart.current?.timeScale().fitContent()
  }, [data])

  return <div ref={ref} style={{ width: '100%' }} />
}
