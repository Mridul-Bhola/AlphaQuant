import yfinance as yf

def search_symbols(query: str):
    try:
        results = yf.Search(query, max_results=8)
        quotes = results.quotes
        if not quotes:
            return []
        return [
            {
                "symbol": q.get("symbol", ""),
                "name": q.get("longname") or q.get("shortname", ""),
                "exchange": q.get("exchange", ""),
                "type": q.get("quoteType", ""),
            }
            for q in quotes
            if q.get("symbol") and q.get("quoteType") in ("EQUITY", "ETF")
        ]
    except Exception as e:
        print(f"Search error: {e}")
        return []
        