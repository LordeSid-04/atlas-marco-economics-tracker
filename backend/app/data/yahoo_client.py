from __future__ import annotations

from datetime import datetime, timezone

import httpx

from app.config import get_settings


class YahooClient:
    def __init__(self) -> None:
        settings = get_settings()
        self.enabled = settings.yahoo_enabled
        self.base_url = settings.yahoo_base_url.rstrip("/")

    async def fetch_quote(self, symbol: str) -> dict[str, str] | None:
        if not self.enabled:
            return None

        url = f"{self.base_url}/{symbol}"
        params = {"interval": "1m", "range": "1d"}
        headers = {"User-Agent": "Mozilla/5.0"}

        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.get(url, params=params, headers=headers)
        if response.status_code >= 400:
            return None

        payload = response.json()
        results = payload.get("chart", {}).get("result")
        if not results:
            return None

        meta = results[0].get("meta", {})
        close = meta.get("regularMarketPrice")
        if close is None:
            return None

        market_time = meta.get("regularMarketTime")
        if market_time is not None:
            dt = datetime.fromtimestamp(int(market_time), tz=timezone.utc)
        else:
            dt = datetime.now(tz=timezone.utc)

        open_ = meta.get("chartPreviousClose", close)
        high = meta.get("regularMarketDayHigh", close)
        low = meta.get("regularMarketDayLow", close)
        volume = meta.get("regularMarketVolume", 0)

        return {
            "symbol": symbol,
            "date": dt.date().isoformat(),
            "time": dt.time().replace(microsecond=0).isoformat(),
            "open": str(open_),
            "high": str(high),
            "low": str(low),
            "close": str(close),
            "volume": str(volume),
        }
