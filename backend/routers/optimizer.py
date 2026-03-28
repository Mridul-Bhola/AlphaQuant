from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.optimizer_service import run_efficient_frontier, run_hrp

router = APIRouter()

class OptimizeRequest(BaseModel):
    symbols: list[str]
    method: str = "efficient_frontier"
    period: str = "2y"
    portfolio_value: float = 10000.0

@router.post("/optimize")
def optimize(req: OptimizeRequest):
    symbols = [s.upper() for s in req.symbols if s.strip()]
    if len(symbols) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 symbols")

    if req.method == "hrp":
        result = run_hrp(symbols, req.period, req.portfolio_value)
    else:
        result = run_efficient_frontier(symbols, req.period, req.portfolio_value)

    if not result:
        raise HTTPException(status_code=404, detail="Could not fetch data for symbols")
    return result
    