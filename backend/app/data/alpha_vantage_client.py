from __future__ import annotations

import httpx

from app.config import get_settings


class AlphaVantageClient:
    def __init__(self) -> None:
        settings = get_settings()
        self.api_key = settings.alpha_vantage_api_key
        self.base_url = settings.alpha_vantage_base_url

    @property
    def configured(self) -> bool:
        return bool(self.api_key)

    async def fetch_fx_quote(self, from_currency: str, to_currency: str) -> dict[str, str] | None:
        if not self.configured:
            return None

        params = {
            "function": "CURRENCY_EXCHANGE_RATE",
            "from_currency": from_currency,
            "to_currency": to_currency,
            "apikey": self.api_key,
        }
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.get(self.base_url, params=params)
        response.raise_for_status()

        payload = response.json().get("Realtime Currency Exchange Rate")
        if not payload:
            return None

        close = payload.get("5. Exchange Rate")
        date = payload.get("6. Last Refreshed", "")
        if close is None:
            return None

        return {
            "date": date.split(" ")[0] if date else "",
            "time": date.split(" ")[1] if " " in date else "",
            "open": str(close),
            "high": str(close),
            "low": str(close),
            "close": str(close),
            "volume": "0",
        }

