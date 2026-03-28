from fastapi import APIRouter
from pydantic import BaseModel
from services.screener_service import screen_stocks

router = APIRouter()

class ScreenerRequest(BaseModel):
    symbols: list[str]
    pe_min: float | None = None
    pe_max: float | None = None
    rsi_min: float | None = None
    rsi_max: float | None = None
    cap_min: float | None = None
    cap_max: float | None = None
    volume_min: float | None = None
    change_52w_min: float | None = None
    change_52w_max: float | None = None
    sector: str | None = None

@router.post("/screen")
def screen(req: ScreenerRequest):
    raw = screen_stocks(req.symbols)

    filtered = []
    for s in raw:
        if req.pe_min is not None and (s["pe_ratio"] is None or s["pe_ratio"] < req.pe_min):
            continue
        if req.pe_max is not None and (s["pe_ratio"] is None or s["pe_ratio"] > req.pe_max):
            continue
        if req.rsi_min is not None and (s["rsi"] is None or s["rsi"] < req.rsi_min):
            continue
        if req.rsi_max is not None and (s["rsi"] is None or s["rsi"] > req.rsi_max):
            continue
        if req.cap_min is not None and (s["market_cap"] is None or s["market_cap"] < req.cap_min):
            continue
        if req.cap_max is not None and (s["market_cap"] is None or s["market_cap"] > req.cap_max):
            continue
        if req.volume_min is not None and (s["volume"] is None or s["volume"] < req.volume_min):
            continue
        if req.change_52w_min is not None and (s["change_52w"] is None or s["change_52w"] < req.change_52w_min):
            continue
        if req.change_52w_max is not None and (s["change_52w"] is None or s["change_52w"] > req.change_52w_max):
            continue
        if req.sector and req.sector != "All" and s["sector"] != req.sector:
            continue
        filtered.append(s)

    return {"results": filtered, "total": len(filtered)}