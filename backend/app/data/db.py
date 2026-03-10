from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
from functools import lru_cache
from typing import Any

from supabase import Client, create_client

from app.config import Settings, get_settings


class SupabaseNotConfiguredError(RuntimeError):
    """Raised when required Supabase settings are missing."""


_EXECUTOR = ThreadPoolExecutor(max_workers=6)


def is_supabase_configured(settings: Settings | None = None) -> bool:
    s = settings or get_settings()
    return bool(s.supabase_url and (s.supabase_service_role_key or s.supabase_anon_key))


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    settings = get_settings()
    if not is_supabase_configured(settings):
        raise SupabaseNotConfiguredError(
            "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY."
        )

    key = settings.supabase_service_role_key or settings.supabase_anon_key
    return create_client(settings.supabase_url, key)


def safe_execute(operation: Any, *, default: Any, timeout_seconds: float | None = None) -> Any:
    timeout = timeout_seconds if timeout_seconds is not None else float(get_settings().supabase_query_timeout_seconds)
    try:
        if timeout <= 0:
            response = operation.execute()
            return getattr(response, "data", default)

        future = _EXECUTOR.submit(operation.execute)
        response = future.result(timeout=timeout)
        return getattr(response, "data", default)
    except FutureTimeoutError:
        future.cancel()
        return default
    except Exception:
        return default
