import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000/api' })

export const searchSymbols   = (q) => api.get(`/market/search?q=${encodeURIComponent(q)}`)
export const getQuote        = (symbol) => api.get(`/market/quote/${symbol}`)
export const getOHLCV        = (symbol, period = '6mo', interval = '1d') =>
  api.get(`/market/ohlcv/${symbol}?period=${period}&interval=${interval}`)
export const getIndicators   = (symbol, period = '6mo', interval = '1d') =>
  api.get(`/market/indicators/${symbol}?period=${period}&interval=${interval}`)
export const runScreen       = (payload) => api.post(`/screener/screen`, payload)
export const runBacktest     = (payload) => api.post(`/backtest/run`, payload)
export const runOptimizer    = (payload) => api.post(`/optimizer/optimize`, payload)