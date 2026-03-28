import { useEffect, useRef } from 'react'
import { createChart, LineSeries, HistogramSeries } from 'lightweight-charts'

export default function MACDChart({ data }) {
  const ref          = useRef(null)
  const chart        = useRef(null)
  const macdSeries   = useRef(null)
  const signalSeries = useRef(null)
  const histSeries   = useRef(null)

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

    macdSeries.current   = chart.current.addSeries(LineSeries, { color: '#9b51e0', lineWidth: 2 })
    signalSeries.current = chart.current.addSeries(LineSeries, { color: '#0693e3', lineWidth: 2 })
    histSeries.current   = chart.current.addSeries(HistogramSeries, { priceFormat: { type: 'price' } })

    const ro = new ResizeObserver(() => {
      chart.current?.applyOptions({ width: ref.current.clientWidth })
    })
    ro.observe(ref.current)

    return () => { ro.disconnect(); chart.current?.remove() }
  }, [])

  useEffect(() => {
    if (!macdSeries.current || !data?.length) return
    macdSeries.current.setData(data.map(d => ({ time: d.time, value: d.macd })))
    signalSeries.current.setData(data.map(d => ({ time: d.time, value: d.macd_signal })))
    histSeries.current.setData(data.map(d => ({
      time: d.time,
      value: d.macd_hist,
      color: d.macd_hist >= 0 ? 'rgba(0,208,132,0.45)' : 'rgba(255,77,109,0.45)',
    })))
    chart.current?.timeScale().fitContent()
  }, [data])

  return <div ref={ref} style={{ width: '100%' }} />
}
