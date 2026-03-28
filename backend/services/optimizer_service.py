import yfinance as yf
import numpy as np
import pandas as pd
from pypfopt import EfficientFrontier, risk_models, expected_returns, HRPOpt
from pypfopt.discrete_allocation import DiscreteAllocation, get_latest_prices
import warnings
warnings.filterwarnings('ignore')

def get_currency_map(symbols: list[str]) -> dict:
    """Returns {symbol: 'USD'|'INR'} for each symbol."""
    currency_map = {}
    for sym in symbols:
        try:
            info = yf.Ticker(sym).info
            currency_map[sym] = info.get('currency', 'USD')
        except:
            currency_map[sym] = 'USD'
    return currency_map

def get_usd_inr_rate() -> float:
    """Fetch live USD/INR exchange rate."""
    try:
        ticker = yf.Ticker("USDINR=X")
        hist = ticker.history(period="1d", interval="1d")
        if not hist.empty:
            return float(hist["Close"].iloc[-1])
    except:
        pass
    return 83.0  # fallback

def get_price_data(symbols: list[str], period: str = "2y"):
    """
    Returns (prices_df, currency_map, is_mixed, fx_rate).
    If mixed INR+USD portfolio, INR prices are converted to USD.
    """
    currency_map = get_currency_map(symbols)
    currencies   = set(currency_map.values())
    is_mixed     = len(currencies) > 1
    fx_rate      = get_usd_inr_rate() if is_mixed else None

    data = {}
    for sym in symbols:
        try:
            df = yf.Ticker(sym).history(period=period, interval="1d")
            if not df.empty:
                prices = df["Close"]
                # Convert INR → USD if mixed portfolio
                if is_mixed and currency_map.get(sym) == 'INR':
                    prices = prices / fx_rate
                data[sym] = prices
        except:
            pass

    if not data:
        return None, currency_map, is_mixed, fx_rate

    prices = pd.DataFrame(data).dropna()
    return prices, currency_map, is_mixed, fx_rate


def run_efficient_frontier(symbols: list[str], period: str = "2y", portfolio_value: float = 10000):
    prices, currency_map, is_mixed, fx_rate = get_price_data(symbols, period)
    if prices is None or len(prices.columns) < 2:
        return None

    currencies = set(currency_map.values())
    display_currency = 'INR' if (len(currencies) == 1 and 'INR' in currencies) else 'USD'

    mu = expected_returns.mean_historical_return(prices)
    S  = risk_models.CovarianceShrinkage(prices).ledoit_wolf()

    # Max Sharpe
    ef_sharpe = EfficientFrontier(mu, S)
    ef_sharpe.max_sharpe()
    sharpe_weights = ef_sharpe.clean_weights()
    sharpe_perf    = ef_sharpe.portfolio_performance(verbose=False)

    # Min Volatility
    ef_minvol = EfficientFrontier(mu, S)
    ef_minvol.min_volatility()
    minvol_weights = ef_minvol.clean_weights()
    minvol_perf    = ef_minvol.portfolio_performance(verbose=False)

    # Efficient Frontier points
    frontier_points = []
    target_returns  = np.linspace(float(mu.min()), float(mu.max()), 40)
    for r in target_returns:
        try:
            ef = EfficientFrontier(mu, S)
            ef.efficient_return(r)
            p  = ef.portfolio_performance(verbose=False)
            frontier_points.append({
                "volatility": round(float(p[1]) * 100, 2),
                "return":     round(float(p[0]) * 100, 2),
                "sharpe":     round(float(p[2]), 2),
            })
        except:
            pass

    # Individual asset stats
    assets = []
    for sym in prices.columns:
        ret = float(mu[sym]) * 100
        vol = float(np.sqrt(S.loc[sym, sym])) * 100
        assets.append({
            "symbol":     sym,
            "return":     round(ret, 2),
            "volatility": round(vol, 2),
            "sharpe":     round(ret / vol if vol > 0 else 0, 2),
        })

    # Discrete allocation
    latest_prices = get_latest_prices(prices)
    da = DiscreteAllocation(sharpe_weights, latest_prices, total_portfolio_value=portfolio_value)
    allocation, leftover = da.greedy_portfolio()

    return {
        "method":           "efficient_frontier",
        "symbols":          list(prices.columns),
        "currency_map":     currency_map,
        "display_currency": display_currency,
        "is_mixed":         is_mixed,
        "fx_rate":          fx_rate,
        "sharpe_weights":   {k: round(v, 4) for k, v in sharpe_weights.items()},
        "sharpe_performance": {
            "return":     round(sharpe_perf[0] * 100, 2),
            "volatility": round(sharpe_perf[1] * 100, 2),
            "sharpe":     round(sharpe_perf[2], 2),
        },
        "minvol_weights":   {k: round(v, 4) for k, v in minvol_weights.items()},
        "minvol_performance": {
            "return":     round(minvol_perf[0] * 100, 2),
            "volatility": round(minvol_perf[1] * 100, 2),
            "sharpe":     round(minvol_perf[2], 2),
        },
        "frontier_points":  frontier_points,
        "assets":           assets,
        "allocation":       allocation,
        "leftover":         round(leftover, 2),
        "portfolio_value":  portfolio_value,
    }


def run_hrp(symbols: list[str], period: str = "2y", portfolio_value: float = 10000):
    prices, currency_map, is_mixed, fx_rate = get_price_data(symbols, period)
    if prices is None or len(prices.columns) < 2:
        return None

    currencies = set(currency_map.values())
    display_currency = 'INR' if (len(currencies) == 1 and 'INR' in currencies) else 'USD'

    returns = prices.pct_change().dropna()
    hrp     = HRPOpt(returns)
    hrp.optimize()
    weights = hrp.clean_weights()
    perf    = hrp.portfolio_performance(verbose=False)

    corr = returns.corr()
    corr_data = []
    for sym1 in corr.columns:
        for sym2 in corr.columns:
            corr_data.append({
                "x": sym1, "y": sym2,
                "value": round(float(corr.loc[sym1, sym2]), 3)
            })

    latest_prices = get_latest_prices(prices)
    da = DiscreteAllocation(weights, latest_prices, total_portfolio_value=portfolio_value)
    allocation, leftover = da.greedy_portfolio()

    return {
        "method":           "hrp",
        "symbols":          list(prices.columns),
        "currency_map":     currency_map,
        "display_currency": display_currency,
        "is_mixed":         is_mixed,
        "fx_rate":          fx_rate,
        "weights":          {k: round(v, 4) for k, v in weights.items()},
        "performance": {
            "return":     round(perf[0] * 100, 2),
            "volatility": round(perf[1] * 100, 2),
            "sharpe":     round(perf[2], 2),
        },
        "corr_data":        corr_data,
        "allocation":       allocation,
        "leftover":         round(leftover, 2),
        "portfolio_value":  portfolio_value,
    }