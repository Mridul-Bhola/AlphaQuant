import yfinance as yf
import pandas as pd
import ta
import numpy as np

def run_backtest(symbol: str, strategy: str, period: str = "2y", initial_capital: float = 10000.0):
    df = yf.Ticker(symbol).history(period=period, interval="1d")
    if df.empty:
        return None

    df.reset_index(inplace=True)
    df["Date"] = df["Date"].astype(str).str[:10]
    close = df["Close"]

    # Generate signals based on strategy
    df["signal"] = 0

    if strategy == "sma_crossover":
        df["sma50"]  = close.rolling(50).mean()
        df["sma200"] = close.rolling(200).mean()
        df["signal"] = np.where(df["sma50"] > df["sma200"], 1, -1)

    elif strategy == "rsi":
        df["rsi"] = ta.momentum.RSIIndicator(close, window=14).rsi()
        df["signal"] = np.where(df["rsi"] < 30, 1, np.where(df["rsi"] > 70, -1, 0))

    elif strategy == "macd":
        macd = ta.trend.MACD(close)
        df["macd"]        = macd.macd()
        df["macd_signal"] = macd.macd_signal()
        df["signal"] = np.where(df["macd"] > df["macd_signal"], 1, -1)

    elif strategy == "bb_breakout":
        bb = ta.volatility.BollingerBands(close, window=20, window_dev=2)
        df["bb_upper"] = bb.bollinger_hband()
        df["bb_lower"] = bb.bollinger_lband()
        df["signal"] = np.where(close < df["bb_lower"], 1, np.where(close > df["bb_upper"], -1, 0))

    df.dropna(inplace=True)
    df.reset_index(drop=True, inplace=True)

    # Simulate trades
    capital     = initial_capital
    position    = 0
    shares      = 0
    equity      = []
    trades      = []
    entry_price = 0
    entry_date  = ""

    for i, row in df.iterrows():
        price  = row["Close"]
        signal = row["signal"]
        date   = row["Date"]

        if signal == 1 and position == 0:
            shares      = capital / price
            entry_price = price
            entry_date  = date
            position    = 1
            capital     = 0

        elif signal == -1 and position == 1:
            exit_value = shares * price
            pnl        = exit_value - (shares * entry_price)
            pnl_pct    = ((price - entry_price) / entry_price) * 100
            trades.append({
                "entry_date":  entry_date,
                "exit_date":   date,
                "entry_price": round(entry_price, 2),
                "exit_price":  round(price, 2),
                "pnl":         round(pnl, 2),
                "pnl_pct":     round(pnl_pct, 2),
                "result":      "win" if pnl > 0 else "loss",
            })
            capital  = exit_value
            position = 0
            shares   = 0

        current_value = capital + (shares * price if position == 1 else 0)
        equity.append({"time": date, "value": round(current_value, 2)})

    # Final position
    if position == 1:
        final_value = shares * df.iloc[-1]["Close"]
        capital     = final_value

    final_equity = capital + (shares * df.iloc[-1]["Close"] if position == 1 else 0)

    # Metrics
    equity_values  = [e["value"] for e in equity]
    peak           = pd.Series(equity_values).cummax()
    drawdown       = ((pd.Series(equity_values) - peak) / peak * 100).tolist()
    drawdown_curve = [{"time": equity[i]["time"], "value": round(drawdown[i], 2)} for i in range(len(equity))]

    total_return   = ((final_equity - initial_capital) / initial_capital) * 100
    win_trades     = [t for t in trades if t["result"] == "win"]
    loss_trades    = [t for t in trades if t["result"] == "loss"]
    win_rate       = (len(win_trades) / len(trades) * 100) if trades else 0

    daily_returns  = pd.Series(equity_values).pct_change().dropna()
    sharpe         = (daily_returns.mean() / daily_returns.std() * np.sqrt(252)) if daily_returns.std() > 0 else 0
    max_drawdown   = min(drawdown) if drawdown else 0

    avg_win  = np.mean([t["pnl_pct"] for t in win_trades])  if win_trades  else 0
    avg_loss = np.mean([t["pnl_pct"] for t in loss_trades]) if loss_trades else 0

    return {
        "symbol":         symbol.upper(),
        "strategy":       strategy,
        "period":         period,
        "initial_capital": initial_capital,
        "final_equity":   round(final_equity, 2),
        "total_return":   round(total_return, 2),
        "sharpe_ratio":   round(float(sharpe), 2),
        "max_drawdown":   round(max_drawdown, 2),
        "total_trades":   len(trades),
        "win_rate":       round(win_rate, 2),
        "avg_win":        round(avg_win, 2),
        "avg_loss":       round(avg_loss, 2),
        "equity_curve":   equity,
        "drawdown_curve": drawdown_curve,
        "trades":         trades[-50:],
    }