from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from routers import market, screener, backtest, optimizer
import asyncio
import yfinance as yf

app = FastAPI(title="AlphaQuant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(market.router,    prefix="/api/market",    tags=["market"])
app.include_router(screener.router,  prefix="/api/screener",  tags=["screener"])
app.include_router(backtest.router,  prefix="/api/backtest",  tags=["backtest"])
app.include_router(optimizer.router, prefix="/api/optimizer", tags=["optimizer"])

@app.get("/")
def root():
    return {"status": "AlphaQuant API running"}

@app.websocket("/ws/watchlist")
async def watchlist_ws(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            symbols = data.get("symbols", [])
            if not symbols:
                await asyncio.sleep(5)
                continue
            prices = {}
            for sym in symbols:
                try:
                    info = yf.Ticker(sym).fast_info
                    prices[sym] = {
                        "price": round(info.last_price, 2),
                        "change_pct": round(info.three_month_return * 100, 2) if info.three_month_return else 0,
                    }
                except:
                    pass
            await websocket.send_json(prices)
            await asyncio.sleep(15)
    except WebSocketDisconnect:
        pass