from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.backtest_service import run_backtest

router = APIRouter()

class BacktestRequest(BaseModel):
    symbol: str
    strategy: str
    period: str = "2y"
    initial_capital: float = 10000.0

@router.post("/run")
def backtest(req: BacktestRequest):
    result = run_backtest(
        req.symbol.upper(),
        req.strategy,
        req.period,
        req.initial_capital,
    )
    if not result:
        raise HTTPException(status_code=404, detail=f"No data for {req.symbol}")
    return result