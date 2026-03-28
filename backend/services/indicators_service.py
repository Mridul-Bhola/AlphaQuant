import yfinance as yf
import ta

def get_indicators(symbol: str, period: str = "6mo", interval: str = "1d"):
    df = yf.Ticker(symbol).history(period=period, interval=interval)
    if df.empty:
        return None

    close = df["Close"]

    bb = ta.volatility.BollingerBands(close, window=20, window_dev=2)
    df["bb_upper"] = bb.bollinger_hband()
    df["bb_mid"]   = bb.bollinger_mavg()
    df["bb_lower"] = bb.bollinger_lband()

    df["rsi"] = ta.momentum.RSIIndicator(close, window=14).rsi()

    macd = ta.trend.MACD(close)
    df["macd"]         = macd.macd()
    df["macd_signal"]  = macd.macd_signal()
    df["macd_hist"]    = macd.macd_diff()

    df.reset_index(inplace=True)
    df["Date"] = df["Date"].astype(str)
    df.dropna(inplace=True)

    return [
        {
            "time":        row["Date"][:10],
            "bb_upper":    round(row["bb_upper"], 2),
            "bb_mid":      round(row["bb_mid"], 2),
            "bb_lower":    round(row["bb_lower"], 2),
            "rsi":         round(row["rsi"], 2),
            "macd":        round(row["macd"], 4),
            "macd_signal": round(row["macd_signal"], 4),
            "macd_hist":   round(row["macd_hist"], 4),
        }
        for _, row in df.iterrows()
    ]
