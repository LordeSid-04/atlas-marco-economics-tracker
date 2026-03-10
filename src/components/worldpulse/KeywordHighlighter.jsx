import React, { useMemo } from "react";

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeToken(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function KeywordHighlighter({
  text,
  highlights = [],
  className = "",
  emptyText = "No data available.",
  tooltipLabel = "Keyword Context",
}) {
  const content = String(text || "");

  const highlightRows = useMemo(() => {
    const rows = [];
    const seen = new Set();
    (highlights || []).forEach((item) => {
      const term = String(item?.term || "").trim();
      if (!term) return;
      const normalized = normalizeToken(term);
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      rows.push({
        term,
        normalized,
        explanation: String(item?.explanation || "This term drives the current macro interpretation."),
        confidence: Number.isFinite(Number(item?.confidence))
          ? Math.max(0, Math.min(100, Math.round(Number(item.confidence) * 100)))
          : null,
      });
    });
    return rows;
  }, [highlights]);

  const highlightMap = useMemo(() => {
    const map = new Map();
    highlightRows.forEach((item) => {
      map.set(item.normalized, item);
    });
    return map;
  }, [highlightRows]);

  const tokens = useMemo(
    () =>
      highlightRows
        .map((item) => item.term)
        .filter((term) => normalizeToken(term).length >= 3)
        .sort((a, b) => b.length - a.length),
    [highlightRows],
  );

  if (!content) {
    return <div className={className}>{emptyText}</div>;
  }

  if (!tokens.length) {
    return <div className={className}>{content}</div>;
  }

  const regex = new RegExp(`(${tokens.map((token) => escapeRegex(token)).join("|")})`, "gi");
  const parts = content.split(regex);

  return (
    <div className={className}>
      {parts.map((part, index) => {
        const normalizedPart = normalizeToken(part);
        const meta =
          highlightMap.get(normalizedPart) ||
          highlightRows.find(
            (item) => item.normalized.includes(normalizedPart) || normalizedPart.includes(item.normalized),
          );
        if (!meta) {
          return <span key={`plain-${index}`}>{part}</span>;
        }

        return (
          <span key={`highlight-${index}`} className="group relative mx-[1px]">
            <span className="rounded-sm bg-cyan-300/16 px-[2px] font-semibold text-cyan-100 underline decoration-cyan-300 decoration-2 underline-offset-2">
              {part}
            </span>
            <span className="pointer-events-none absolute left-0 top-full z-30 mt-2 hidden w-[min(340px,72vw)] rounded-xl border border-cyan-200/40 bg-black/95 p-2.5 text-[11px] leading-relaxed text-zinc-200 shadow-[0_16px_36px_rgba(0,0,0,0.48)] group-hover:block">
              <span className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-cyan-200">{tooltipLabel}</span>
              <span className="block text-[11px] font-semibold text-zinc-100">{meta.term}</span>
              <span className="mt-1 block">{meta.explanation}</span>
              {meta.confidence !== null ? (
                <span className="mt-1.5 inline-flex rounded-full border border-cyan-200/35 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-cyan-100">
                  Signal confidence {meta.confidence}%
                </span>
              ) : null}
            </span>
          </span>
        );
      })}
    </div>
  );
}
