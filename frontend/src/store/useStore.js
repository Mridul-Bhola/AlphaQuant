import { create } from 'zustand'

const useStore = create((set) => ({
  symbol: 'AAPL',
  quote: null,
  ohlcv: [],
  loading: false,
  setSymbol: (symbol) => set({ symbol }),
  setQuote: (quote) => set({ quote }),
  setOHLCV: (ohlcv) => set({ ohlcv }),
  setLoading: (loading) => set({ loading }),
}))

export default useStore