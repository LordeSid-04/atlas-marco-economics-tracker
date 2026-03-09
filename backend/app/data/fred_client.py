from __future__ import annotations

import asyncio
import csv
import io

import httpx

from app.config import get_settings


class FredClient:
    def __init__(self) -> None:
        settings = get_settings()
        self.api_key = settings.fred_api_key
        self.api_base_url = settings.fred_api_base_url
        self.csv_fallback_enabled = settings.fred_csv_fallback_enabled
        self.csv_base_url = settings.fred_csv_base_url

    async def fetch_latest_value(self, series_id: str) -> float | None:
        value = await self._fetch_from_json_api(series_id)
        if value is not None:
            return value
        if not self.csv_fallback_enabled:
            return None
        return await self._fetch_from_csv(series_id)

    async def _fetch_from_json_api(self, series_id: str) -> float | None:
        params = {
            "series_id": series_id,
            "file_type": "json",
            "sort_order": "desc",
            "limit": 10,
        }
        if self.api_key:
            params["api_key"] = self.api_key

        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.get(self.api_base_url, params=params)

        if response.status_code >= 400:
            return None

        observations = response.json().get("observations", [])
        for row in observations:
            raw = str(row.get("value", "")).strip()
            try:
                return float(raw)
            except ValueError:
                continue
        return None

    async def _fetch_from_csv(self, series_id: str) -> float | None:
        params = {"id": series_id}
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.get(self.csv_base_url, params=params)

        if response.status_code >= 400:
            return None

        return await asyncio.to_thread(_extract_latest_value_from_csv, response.text, series_id)


def _extract_latest_value_from_csv(csv_text: str, series_id: str) -> float | None:
    latest: float | None = None
    reader = csv.DictReader(io.StringIO(csv_text))
    for row in reader:
        raw = str(row.get(series_id, "")).strip()
        try:
            latest = float(raw)
        except ValueError:
            continue
    return latest

