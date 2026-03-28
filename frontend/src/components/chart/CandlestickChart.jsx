import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, LineSeries } from 'lightweight-charts'

export default function CandlestickChart({ data, indicators }) {
  const chartRef      = useRef(null)
  const chartInstance = useRef(null)
  const seriesRef     = useRef(null)
  const bbUpper       = useRef(null)
  const bbMid         = useRef(null)
  const bbLower       = useRef(null)

  useEffect(() => {
    if (!chartRef.current) return

    chartInstance.current = createChart(chartRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: 'rgba(255,255,255,0.25)',
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.06)', timeVisible: true },
      width: chartRef.current.clientWidth,
      height: 420,
    })

    seriesRef.current = chartInstance.current.addSeries(CandlestickSeries, {
      upColor:        '#00d084',
      downColor:      '#ff4d6d',
      borderUpColor:  '#00d084',
      borderDownColor:'#ff4d6d',
      wickUpColor:    '#00d084',
      wickDownColor:  '#ff4d6d',
    })

    bbUpper.current = chartInstance.current.addSeries(LineSeries, { color: 'rgba(155,81,224,0.35)', lineWidth: 1, lineStyle: 2 })
    bbMid.current   = chartInstance.current.addSeries(LineSeries, { color: 'rgba(155,81,224,0.55)', lineWidth: 1, lineStyle: 2 })
    bbLower.current = chartInstance.current.addSeries(LineSeries, { color: 'rgba(6,147,227,0.35)',  lineWidth: 1, lineStyle: 2 })

    const ro = new ResizeObserver(() => {
      chartInstance.current?.applyOptions({ width: chartRef.current.clientWidth })
    })
    ro.observe(chartRef.current)

    return () => { ro.disconnect(); chartInstance.current?.remove() }
  }, [])

  useEffect(() => {
    if (seriesRef.current && data?.length) {
      seriesRef.current.setData(data)
      chartInstance.current?.timeScale().fitContent()
    }
  }, [data])

  useEffect(() => {
    if (!indicators?.length) return
    bbUpper.current?.setData(indicators.map(d => ({ time: d.time, value: d.bb_upper })))
    bbMid.current?.setData(indicators.map(d => ({ time: d.time, value: d.bb_mid })))
    bbLower.current?.setData(indicators.map(d => ({ time: d.time, value: d.bb_lower })))
  }, [indicators])

  return <div ref={chartRef} style={{ width: '100%', borderRadius: 8, overflow: 'hidden' }} />
}
