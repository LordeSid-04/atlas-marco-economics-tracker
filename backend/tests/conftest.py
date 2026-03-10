import os
from collections.abc import AsyncGenerator

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("AUTH_REQUIRED", "false")
os.environ.setdefault("SUPABASE_URL", "")
os.environ.setdefault("SUPABASE_ANON_KEY", "")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "")
os.environ.setdefault("MARKET_BACKGROUND_ENABLED", "false")
os.environ.setdefault("TWELVEDATA_API_KEY", "")
os.environ.setdefault("ALPHAVANTAGE_API_KEY", "")
os.environ.setdefault("FRED_API_KEY", "")
os.environ.setdefault("YAHOO_ENABLED", "false")
os.environ.setdefault("THEME_NEWS_LIVE_ENABLED", "false")

from app.data.seed import get_data_repository
from app.data.stooq_client import StooqQuote
from app.main import create_app


@pytest.fixture(autouse=True)
def mock_stooq(monkeypatch: pytest.MonkeyPatch) -> None:
    seed_quotes = {
        "2yusy.b": ("4.82", "4.75"),
        "10yusy.b": ("4.31", "4.28"),
        "10ydey.b": ("2.48", "2.44"),
        "10yjpy.b": ("1.31", "1.27"),
        "zq.f": ("95.12", "95.20"),
        "dx.f": ("104.1", "103.6"),
        "eurusd": ("1.082", "1.087"),
        "usdjpy": ("150.2", "149.5"),
        "usdcny": ("7.22", "7.20"),
        "usdsgd": ("1.34", "1.338"),
        "cb.f": ("81.4", "79.2"),
        "cl.f": ("78.0", "76.3"),
        "gc.f": ("2242", "2230"),
        "hg.f": ("4.01", "3.95"),
        "ng.f": ("2.12", "2.06"),
        "^spx": ("5120", "5092"),
        "^ndx": ("18005", "17810"),
        "eem.us": ("39.5", "39.0"),
        "vi.f": ("16.3", "15.9"),
    }

    async def _fake_fetch_quote(self, symbol: str):
        key = symbol.lower()
        if key not in seed_quotes:
            return None
        close, open_ = seed_quotes[key]
        return StooqQuote(
            symbol=key,
            date="2026-03-09",
            time="12:00:00",
            open=open_,
            high=close,
            low=open_,
            close=close,
            volume="1000",
        )

    monkeypatch.setattr("app.data.stooq_client.StooqClient.fetch_quote", _fake_fetch_quote)


@pytest.fixture
def client() -> TestClient:
    app = create_app()
    return TestClient(app)


@pytest.fixture
def repo():
    return get_data_repository()
