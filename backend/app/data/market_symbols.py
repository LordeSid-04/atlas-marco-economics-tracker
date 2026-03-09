from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class MarketSymbolSpec:
    frontend_symbol: str
    twelvedata_candidates: tuple[str, ...] = ()
    yahoo_candidates: tuple[str, ...] = ()
    alpha_vantage_pair: tuple[str, str] | None = None
    fred_series: str | None = None
    stooq_symbol: str | None = None


MARKET_SYMBOL_SPECS: dict[str, MarketSymbolSpec] = {
    "2yusy.b": MarketSymbolSpec(
        frontend_symbol="2yusy.b",
        twelvedata_candidates=("US2Y", "US02Y", "UST2YR"),
        fred_series="DGS2",
        stooq_symbol="2yusy.b",
    ),
    "10yusy.b": MarketSymbolSpec(
        frontend_symbol="10yusy.b",
        twelvedata_candidates=("US10Y", "UST10Y", "TNX"),
        yahoo_candidates=("^TNX",),
        fred_series="DGS10",
        stooq_symbol="10yusy.b",
    ),
    "10ydey.b": MarketSymbolSpec(
        frontend_symbol="10ydey.b",
        twelvedata_candidates=("DE10Y", "DE10YT", "DE10Y.GBOND"),
        fred_series="IRLTLT01DEM156N",
        stooq_symbol="10ydey.b",
    ),
    "10yjpy.b": MarketSymbolSpec(
        frontend_symbol="10yjpy.b",
        twelvedata_candidates=("JP10Y", "JP10YT", "JGB10Y"),
        fred_series="IRLTLT01JPM156N",
        stooq_symbol="10yjpy.b",
    ),
    "zq.f": MarketSymbolSpec(
        frontend_symbol="zq.f",
        twelvedata_candidates=("ZQ", "ZQ1!", "FF"),
        yahoo_candidates=("ZQ=F",),
        stooq_symbol="zq.f",
    ),
    "dx.f": MarketSymbolSpec(
        frontend_symbol="dx.f",
        twelvedata_candidates=("DXY", "DX", "DX1!"),
        yahoo_candidates=("DX-Y.NYB",),
        stooq_symbol="dx.f",
    ),
    "eurusd": MarketSymbolSpec(
        frontend_symbol="eurusd",
        twelvedata_candidates=("EUR/USD", "EURUSD"),
        yahoo_candidates=("EURUSD=X",),
        alpha_vantage_pair=("EUR", "USD"),
        stooq_symbol="eurusd",
    ),
    "usdjpy": MarketSymbolSpec(
        frontend_symbol="usdjpy",
        twelvedata_candidates=("USD/JPY", "USDJPY"),
        yahoo_candidates=("JPY=X",),
        alpha_vantage_pair=("USD", "JPY"),
        stooq_symbol="usdjpy",
    ),
    "usdcny": MarketSymbolSpec(
        frontend_symbol="usdcny",
        twelvedata_candidates=("USD/CNY", "USDCNY"),
        yahoo_candidates=("CNY=X",),
        alpha_vantage_pair=("USD", "CNY"),
        stooq_symbol="usdcny",
    ),
    "usdsgd": MarketSymbolSpec(
        frontend_symbol="usdsgd",
        twelvedata_candidates=("USD/SGD", "USDSGD"),
        yahoo_candidates=("SGD=X",),
        alpha_vantage_pair=("USD", "SGD"),
        stooq_symbol="usdsgd",
    ),
    "cb.f": MarketSymbolSpec(
        frontend_symbol="cb.f",
        twelvedata_candidates=("BZ", "BRENT", "CO1"),
        yahoo_candidates=("BZ=F",),
        stooq_symbol="cb.f",
    ),
    "cl.f": MarketSymbolSpec(
        frontend_symbol="cl.f",
        twelvedata_candidates=("CL", "WTI", "CL1"),
        yahoo_candidates=("CL=F",),
        stooq_symbol="cl.f",
    ),
    "gc.f": MarketSymbolSpec(
        frontend_symbol="gc.f",
        twelvedata_candidates=("GC", "GOLD"),
        yahoo_candidates=("GC=F",),
        stooq_symbol="gc.f",
    ),
    "hg.f": MarketSymbolSpec(
        frontend_symbol="hg.f",
        twelvedata_candidates=("HG", "COPPER"),
        yahoo_candidates=("HG=F",),
        stooq_symbol="hg.f",
    ),
    "ng.f": MarketSymbolSpec(
        frontend_symbol="ng.f",
        twelvedata_candidates=("NG", "NATGAS"),
        yahoo_candidates=("NG=F",),
        stooq_symbol="ng.f",
    ),
    "^spx": MarketSymbolSpec(
        frontend_symbol="^spx",
        twelvedata_candidates=("SPX", "GSPC", "^GSPC"),
        yahoo_candidates=("^GSPC",),
        stooq_symbol="^spx",
    ),
    "^ndx": MarketSymbolSpec(
        frontend_symbol="^ndx",
        twelvedata_candidates=("NDX", "^NDX"),
        yahoo_candidates=("^NDX",),
        stooq_symbol="^ndx",
    ),
    "eem.us": MarketSymbolSpec(
        frontend_symbol="eem.us",
        twelvedata_candidates=("EEM",),
        yahoo_candidates=("EEM",),
        stooq_symbol="eem.us",
    ),
    "vi.f": MarketSymbolSpec(
        frontend_symbol="vi.f",
        twelvedata_candidates=("VIX", "^VIX"),
        yahoo_candidates=("^VIX",),
        stooq_symbol="vi.f",
    ),
}


def all_watchlist_symbols() -> list[str]:
    return list(MARKET_SYMBOL_SPECS.keys())
