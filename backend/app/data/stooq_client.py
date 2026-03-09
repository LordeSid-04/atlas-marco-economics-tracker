from __future__ import annotations

from dataclasses import dataclass

import httpx

from app.config import get_settings


@dataclass(slots=True)
class StooqQuote:
    symbol: str
    date: str
    time: str
    open: str
    high: str
    low: str
    close: str
    volume: str


class StooqClient:
    def __init__(self) -> None:
        settings = get_settings()
        self.base_url = settings.stooq_base_url.rstrip("/")
        self.interval = settings.stooq_interval

    async def fetch_quote(self, symbol: str) -> StooqQuote | None:
        params = {"s": symbol, "i": str(self.interval)}
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(self.base_url, params=params)

        response.raise_for_status()
        line = response.text.strip()
        if "Exceeded the daily hits limit" in line:
            raise RuntimeError("stooq_rate_limited")
        parts = [p.strip() for p in line.split(",")]
        if len(parts) < 8:
            return None

        if parts[1] == "N/D":
            return None

        return StooqQuote(
            symbol=parts[0],
            date=parts[1],
            time=parts[2],
            open=parts[3],
            high=parts[4],
            low=parts[5],
            close=parts[6],
            volume=parts[7],
        )
