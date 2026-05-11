# AlphaQuant

A full-stack algorithmic trading and portfolio analysis platform built for quantitative strategy research. AlphaQuant lets you screen stocks, backtest strategies, and optimize portfolios — all in one place.

---

## Features

### Stock Screener
- Candlestick charts with technical indicator overlays
- Filter and rank equities by custom criteria

### Backtesting Engine
- Supported strategies: SMA Crossover, RSI, MACD, Bollinger Band Breakout
- Configurable date ranges, capital allocation, and position sizing
- Performance metrics: total return, Sharpe ratio, max drawdown, win rate

### Portfolio Optimizer
- Efficient Frontier construction via mean-variance optimization
- Hierarchical Risk Parity (HRP) allocation method
- Supports INR and USD denominated portfolios
- Powered by [PyPortfolioOpt](https://github.com/robertmartin8/PyPortfolioOpt)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Recharts, Zustand |
| Backend | FastAPI, Python |
| Quant | PyPortfolioOpt, pandas, numpy |
| Charts | Recharts (candlestick + line) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`, API at `http://localhost:8000`.

---

## Project Structure

```
AlphaQuant/
├── frontend/        # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── store/   # Zustand state
├── backend/         # FastAPI
│   ├── main.py
│   ├── routers/
│   └── services/
└── README.md
```

---

## Author

**Mridul Bhola** — [github.com/Mridul-Bhola](https://github.com/Mridul-Bhola)
