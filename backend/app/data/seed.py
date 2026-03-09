from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from app.data.repository import DataRepository


@lru_cache(maxsize=1)
def get_data_repository() -> DataRepository:
    curated_path = Path(__file__).resolve().parent / "curated"
    return DataRepository(curated_path)
