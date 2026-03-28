import yfinance as yf
import ta
from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch_stock_data(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period="1y", interval="1d")

        if hist.empty or not info:
            return None

        close = hist["Close"]
        rsi = ta.momentum.RSIIndicator(close, window=14).rsi().dropna()
        current_rsi = round(float(rsi.iloc[-1]), 2) if len(rsi) > 0 else None

        price_1y_ago = float(hist["Close"].iloc[0]) if len(hist) > 0 else None
        current_price = info.get("currentPrice") or info.get("regularMarketPrice")
        change_52w = round(((current_price - price_1y_ago) / price_1y_ago) * 100, 2) if price_1y_ago and current_price else None

        return {
            "symbol": symbol.upper(),
            "name": info.get("longName") or info.get("shortName", symbol),
            "price": current_price,
            "change_pct": round(info.get("regularMarketChangePercent", 0), 2),
            "pe_ratio": round(info.get("trailingPE", 0), 2) if info.get("trailingPE") else None,
            "market_cap": info.get("marketCap"),
            "volume": info.get("regularMarketVolume"),
            "sector": info.get("sector", "—"),
            "rsi": current_rsi,
            "change_52w": change_52w,
        }
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return None

def screen_stocks(symbols: list[str]):
    results = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(fetch_stock_data, sym): sym for sym in symbols}
        for future in as_completed(futures):
            result = future.result()
            if result:
                results.append(result)
    return sorted(results, key=lambda x: x["market_cap"] or 0, reverse=True)