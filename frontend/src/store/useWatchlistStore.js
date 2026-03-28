import { create } from 'zustand'

const useWatchlistStore = create((set) => ({
  watchlist: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'],
  prices: {},
  addSymbol: (sym) => set((s) => ({
    watchlist: s.watchlist.includes(sym) ? s.watchlist : [...s.watchlist, sym]
  })),
  removeSymbol: (sym) => set((s) => ({
    watchlist: s.watchlist.filter(w => w !== sym)
  })),
  setPrices: (prices) => set({ prices }),
}))

export default useWatchlistStore