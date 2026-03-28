from fastapi import APIRouter, HTTPException
from services.market_service import get_ohlcv, get_quote
from services.indicators_service import get_indicators
from services.search_service import search_symbols

router = APIRouter()

@router.get("/search")
def search(q: str):
    if not q or len(q) < 1:
        return {"results": []}
    return {"results": search_symbols(q)}

@router.get("/quote/{symbol}")
def quote(symbol: str):
    try:
        return get_quote(symbol.upper())
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/ohlcv/{symbol}")
def ohlcv(symbol: str, period: str = "6mo", interval: str = "1d"):
    data = get_ohlcv(symbol.upper(), period, interval)
    if not data:
        raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
    return {"symbol": symbol.upper(), "data": data}

@router.get("/indicators/{symbol}")
def indicators(symbol: str, period: str = "6mo", interval: str = "1d"):
    data = get_indicators(symbol.upper(), period, interval)
    if not data:
        raise HTTPException(status_code=404, detail=f"No data for {symbol}")
    return {"symbol": symbol.upper(), "data": data}