from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncGenerator
from typing import Any

import httpx

from app.config import get_settings

try:
    import websockets
except ImportError:  # pragma: no cover
    websockets = None  # type: ignore[assignment]


class TwelveDataClient:
    def __init__(self) -> None:
        settings = get_settings()
        self.api_key = settings.twelvedata_api_key
        self.rest_url = settings.twelvedata_rest_url.rstrip("/")
        self.ws_url = settings.twelvedata_ws_url
        self.ws_enabled = settings.twelvedata_ws_enabled

    @property
    def configured(self) -> bool:
        return bool(self.api_key)

    async def fetch_quote(self, symbol: str) -> dict[str, str] | None:
        if not self.configured:
            return None

        params = {"symbol": symbol, "apikey": self.api_key}
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.get(f"{self.rest_url}/quote", params=params)

        response.raise_for_status()
        payload = response.json()
        if isinstance(payload, dict) and payload.get("status") == "error":
            return None

        close = _pick(payload, ("close", "price", "last"))
        if close is None:
            return None

        open_ = _pick(payload, ("open", "previous_close", "price")) or close
        high = _pick(payload, ("high", "price")) or close
        low = _pick(payload, ("low", "price")) or close
        volume = _pick(payload, ("volume", "day_volume")) or "0"

        date_time = _pick(payload, ("datetime", "timestamp")) or ""
        date, time = _split_date_time(str(date_time))

        return {
            "symbol": symbol,
            "date": date,
            "time": time,
            "open": str(open_),
            "high": str(high),
            "low": str(low),
            "close": str(close),
            "volume": str(volume),
        }

    async def stream_prices(self, symbols: list[str]) -> AsyncGenerator[dict[str, Any], None]:
        if not self.configured or not self.ws_enabled or not symbols:
            return
        if websockets is None:
            return

        ws_url = f"{self.ws_url}?apikey={self.api_key}"
        subscribe_payload = {
            "action": "subscribe",
            "params": {"symbols": ",".join(sorted(set(symbols)))},
        }

        async with websockets.connect(ws_url, ping_interval=None) as connection:  # type: ignore[attr-defined]
            await connection.send(json.dumps(subscribe_payload))

            heartbeat_task = asyncio.create_task(_heartbeat(connection))
            try:
                async for raw in connection:
                    payload = _safe_json(raw)
                    if not isinstance(payload, dict):
                        continue

                    event = str(payload.get("event", "")).lower()
                    if event not in {"price", "quote"} and "price" not in payload and "close" not in payload:
                        continue

                    symbol = str(payload.get("symbol") or payload.get("code") or "").strip()
                    price = payload.get("price") or payload.get("close") or payload.get("last")
                    if not symbol or price is None:
                        continue

                    yield {
                        "symbol": symbol,
                        "price": str(price),
                        "timestamp": payload.get("timestamp") or payload.get("time") or "",
                        "volume": str(payload.get("day_volume") or payload.get("volume") or "0"),
                    }
            finally:
                heartbeat_task.cancel()


async def _heartbeat(connection: Any) -> None:
    while True:
        await asyncio.sleep(10)
        # Twelve Data docs/support use `heartbeat`; `hearbeat` appears in older examples.
        await connection.send(json.dumps({"action": "heartbeat"}))


def _split_date_time(value: str) -> tuple[str, str]:
    normalized = value.strip().replace("T", " ")
    if not normalized:
        return "", ""
    if " " not in normalized:
        if len(normalized) == 10:
            return normalized, ""
        return "", normalized
    date, time = normalized.split(" ", 1)
    return date.strip(), time.strip()


def _pick(payload: dict[str, Any], keys: tuple[str, ...]) -> str | None:
    for key in keys:
        value = payload.get(key)
        if value is not None and str(value) != "":
            return str(value)
    return None


def _safe_json(raw: Any) -> Any:
    if isinstance(raw, (dict, list)):
        return raw
    if not isinstance(raw, str):
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None

