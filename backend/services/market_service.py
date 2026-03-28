import yfinance as yf
import pandas as pd
from datetime import datetime

def get_ohlcv(symbol: str, period: str = "6mo", interval: str = "1d"):
    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period, interval=interval)
    
    if df.empty:
        return None
    
    df.reset_index(inplace=True)
    df["Date"] = df["Date"].astype(str)
    
    return [
        {
            "time": row["Date"][:10],
            "open": round(row["Open"], 2),
            "high": round(row["High"], 2),
            "low": round(row["Low"], 2),
            "close": round(row["Close"], 2),
            "volume": int(row["Volume"]),
        }
        for _, row in df.iterrows()
    ]

def get_quote(symbol: str):
    ticker = yf.Ticker(symbol)
    info = ticker.info
    return {
        "symbol": symbol.upper(),
        "name": info.get("longName", symbol),
        "price": info.get("currentPrice") or info.get("regularMarketPrice"),
        "change": info.get("regularMarketChange"),
        "change_pct": info.get("regularMarketChangePercent"),
        "volume": info.get("regularMarketVolume"),
        "market_cap": info.get("marketCap"),
        "pe_ratio": info.get("trailingPE"),
        "52w_high": info.get("fiftyTwoWeekHigh"),
        "52w_low": info.get("fiftyTwoWeekLow"),
    }