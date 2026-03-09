from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import numpy as np
from sklearn.cluster import KMeans
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.preprocessing import StandardScaler

from app.engines.decay import clamp


@dataclass(slots=True)
class ScoredThemeRow:
    theme_id: str
    importance_value: int
    importance_percentile: float
    temperature_value: int
    temperature_percentile: float
    market_confirmation_value: int
    market_confirmation_percentile: float
    outlook_state: str
    confidence: float
    top_features: list[str]
    model_version: str


class SignalModelEngine:
    """Online-trained scoring engine for briefing metrics."""

    def __init__(self) -> None:
        self.feature_names = [
            "mention_count",
            "source_diversity",
            "cross_region_spread",
            "market_reaction_raw",
            "momentum",
            "temperature_raw",
            "velocity_score",
        ]
        self.model_version = "atlas-signal-online-v2"

    def score_themes(self, rows: list[dict[str, Any]]) -> dict[str, ScoredThemeRow]:
        if not rows:
            return {}

        X = np.array([self._vectorize(row) for row in rows], dtype=float)
        X_aug = self._augment(X)

        scaler = StandardScaler()
        X_aug_scaled = scaler.fit_transform(X_aug)
        X_scaled = scaler.transform(X)

        importance_target = self._importance_target(X_aug_scaled)
        temperature_target = np.clip(X_aug[:, 5], 0.0, 100.0)
        market_target = np.clip(X_aug[:, 3], 0.0, 100.0)

        importance_model = GradientBoostingRegressor(random_state=42)
        importance_model.fit(X_aug_scaled, importance_target)

        temperature_model = RandomForestRegressor(n_estimators=120, random_state=42)
        temperature_model.fit(X_aug_scaled, temperature_target)

        market_model = RandomForestRegressor(n_estimators=100, random_state=42)
        market_model.fit(X_aug_scaled, market_target)

        cluster_model = KMeans(n_clusters=3, random_state=42, n_init=8)
        cluster_model.fit(X_aug_scaled[:, [4, 5, 6]])

        importance_pred = importance_model.predict(X_scaled)
        temperature_pred = np.clip(temperature_model.predict(X_scaled), 0.0, 100.0)
        market_pred = np.clip(market_model.predict(X_scaled), 0.0, 100.0)
        cluster_pred = cluster_model.predict(X_scaled[:, [4, 5, 6]])

        cluster_to_state = self._cluster_label_map(cluster_model.cluster_centers_)
        confidence = self._confidence_from_sample_size(len(X_aug))
        top_features = self._top_features(importance_model.feature_importances_)

        importance_dist = importance_model.predict(X_aug_scaled)
        temperature_dist = np.clip(temperature_model.predict(X_aug_scaled), 0.0, 100.0)
        market_dist = np.clip(market_model.predict(X_aug_scaled), 0.0, 100.0)

        output: dict[str, ScoredThemeRow] = {}
        for index, row in enumerate(rows):
            imp_percentile = self._percentile(importance_pred[index], importance_dist)
            temp_percentile = self._percentile(temperature_pred[index], temperature_dist)
            market_percentile = self._percentile(market_pred[index], market_dist)
            output[str(row["theme_id"])] = ScoredThemeRow(
                theme_id=str(row["theme_id"]),
                importance_value=int(round(clamp(imp_percentile * 100.0, 0.0, 100.0))),
                importance_percentile=imp_percentile,
                temperature_value=int(round(clamp(temperature_pred[index], 0.0, 100.0))),
                temperature_percentile=temp_percentile,
                market_confirmation_value=int(round(clamp(market_pred[index], 0.0, 100.0))),
                market_confirmation_percentile=market_percentile,
                outlook_state=cluster_to_state.get(int(cluster_pred[index]), "stable"),
                confidence=confidence,
                top_features=top_features,
                model_version=self.model_version,
            )
        return output

    def _vectorize(self, row: dict[str, Any]) -> np.ndarray:
        mention_count = float(row.get("mention_count", 0))
        source_diversity = float(row.get("source_diversity", 0))
        cross_region_spread = float(row.get("cross_region_spread", 0))
        market_reaction_raw = float(row.get("market_reaction_raw", 0))
        momentum = float(row.get("momentum", 0.0))
        temperature_raw = float(row.get("temperature_raw", 0))
        velocity_score = float(row.get("velocity_score", 0))
        return np.array(
            [
                mention_count,
                source_diversity,
                cross_region_spread,
                market_reaction_raw,
                momentum,
                temperature_raw,
                velocity_score,
            ],
            dtype=float,
        )

    def _augment(self, X: np.ndarray) -> np.ndarray:
        if len(X) >= 30:
            return X
        rng = np.random.default_rng(42)
        needed = max(30, len(X) * 6)
        rows: list[np.ndarray] = [row for row in X]
        for _ in range(max(0, needed - len(X))):
            base = X[rng.integers(0, len(X))]
            noise = rng.normal(loc=0.0, scale=[2.5, 0.8, 0.7, 3.0, 1.8, 3.0, 2.2], size=7)
            synthetic = np.clip(base + noise, a_min=[0, 0, 0, 0, -25, 0, 0], a_max=[500, 30, 30, 100, 25, 100, 100])
            rows.append(synthetic)
        return np.array(rows, dtype=float)

    def _importance_target(self, X_scaled: np.ndarray) -> np.ndarray:
        # Latent "importance" target learned from feature structure instead of static weights.
        u, s, vh = np.linalg.svd(X_scaled, full_matrices=False)
        pc1 = np.abs(u[:, 0] * s[0])
        if np.max(pc1) <= 0:
            return np.zeros_like(pc1)
        return pc1 / np.max(pc1)

    def _cluster_label_map(self, centroids: np.ndarray) -> dict[int, str]:
        # centroids columns correspond to [momentum, temperature_raw, velocity]
        ranking = sorted(
            [(idx, float(center[0] * 0.65 + center[2] * 0.35)) for idx, center in enumerate(centroids)],
            key=lambda item: item[1],
        )
        if len(ranking) < 3:
            return {0: "stable"}
        return {
            ranking[0][0]: "cooling",
            ranking[1][0]: "stable",
            ranking[2][0]: "heating_up",
        }

    def _top_features(self, importances: np.ndarray) -> list[str]:
        order = np.argsort(importances)[::-1]
        return [self.feature_names[index] for index in order[:4]]

    def _percentile(self, value: float, distribution: np.ndarray) -> float:
        if distribution.size == 0:
            return 0.5
        return float(clamp(float(np.mean(distribution <= value)), 0.0, 1.0))

    def _confidence_from_sample_size(self, sample_size: int) -> float:
        return float(clamp(0.48 + min(sample_size, 120) / 240.0, 0.48, 0.95))

    @staticmethod
    def market_confirmation_label(score: int) -> str:
        if score >= 72:
            return "strong"
        if score >= 45:
            return "moderate"
        return "weak"

    def model_proof(self, model_name: str, confidence: float, top_features: list[str]) -> dict[str, Any]:
        return {
            "model_name": model_name,
            "model_version": self.model_version,
            "score_confidence": float(clamp(confidence, 0.0, 1.0)),
            "top_features": top_features,
            "trained_at": datetime.now(tz=timezone.utc).isoformat(),
        }
