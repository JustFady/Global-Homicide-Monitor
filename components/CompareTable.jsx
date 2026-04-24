import React, { useMemo, useState } from "react";

const metrics = [
  { key: "homicideRatePer100k", label: "Homicide rate (/100k)", fmt: (v) => `${Number(v).toFixed(1)}` },
  { key: "firearmHomicideRate", label: "Firearm homicide (/100k)", fmt: (v) => `${Number(v).toFixed(1)}` },
  { key: "organizedCrimeIndex", label: "Crime Index", fmt: (v) => `${Number(v).toFixed(1)}` },
  { key: "underAge25Percent", label: "Under 25%", fmt: (v) => `${Number(v).toFixed(0)}%` },
  { key: "likelihoodDeathIfOwner", label: "Death risk (owner)", fmt: (v) => `${(Number(v) * 100).toFixed(1)}%` },
  { key: "likelihoodIncarcerationIfOwner", label: "Incarceration risk", fmt: (v) => `${(Number(v) * 100).toFixed(1)}%` },
];

function computeRange(values) {
  let min = Infinity, max = -Infinity;
  for (const v of values) {
    const n = Number(v ?? 0);
    if (Number.isNaN(n)) continue;
    min = Math.min(min, n);
    max = Math.max(max, n);
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1 };
  if (min === max) return { min, max: min + 1e-9 };
  return { min, max };
}

function cellBg(value, range) {
  const n = Number(value ?? 0);
  const t = (n - range.min) / (range.max - range.min);
  const clamped = Math.max(0, Math.min(1, t));
  // Green (low/safe) to red (high/danger)
  if (clamped < 0.33) return "rgba(16, 185, 129, 0.12)";
  if (clamped < 0.66) return "rgba(245, 158, 11, 0.12)";
  return "rgba(244, 63, 94, 0.12)";
}

export default function CompareTable({ pinned, countries, cities, onClose }) {
  const [sortKey, setSortKey] = useState("homicideRatePer100k");
  const [sortDir, setSortDir] = useState("desc");

  const allCountryRanges = useMemo(() => {
    const ranges = {};
    for (const m of metrics) ranges[m.key] = computeRange(countries.map((c) => c[m.key]));
    return ranges;
  }, [countries]);

  const columnData = useMemo(() => {
    return pinned
      .map((p) => {
        if (p.type === "country") {
          const c = countries.find((x) => x.id === p.id);
          if (!c) return null;
          return { ...p, data: c };
        }
        const ct = cities.find((x) => x.id === p.id);
        if (!ct) return null;
        const parent = countries.find((c) => c.id === ct.countryId);
        return { ...p, data: { ...(parent ?? {}), ...ct } };
      })
      .filter(Boolean);
  }, [pinned, countries, cities]);

  const sortedColumns = useMemo(() => {
    const cols = [...columnData];
    cols.sort((a, b) => {
      const av = Number(a.data?.[sortKey] ?? 0);
      const bv = Number(b.data?.[sortKey] ?? 0);
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return cols;
  }, [columnData, sortKey, sortDir]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-5xl glass-strong rounded-2xl shadow-glow-strong overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between gap-3 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">Compare</h2>
            <p className="text-xs text-slate-500">Side-by-side analysis of pinned locations</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300"
            >
              {metrics.map((m) => <option key={m.key} value={m.key}>Sort: {m.label}</option>)}
            </select>
            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs hover:bg-white/10 transition text-slate-300"
            >
              {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="p-4 overflow-auto flex-1">
          {sortedColumns.length < 2 ? (
            <div className="text-sm text-slate-400 text-center py-8">Pin at least 2 locations to compare.</div>
          ) : (
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider p-3 border-b border-white/[0.06] w-[200px]">
                    Metric
                  </th>
                  {sortedColumns.map((c) => (
                    <th key={`${c.type}:${c.id}`} className="text-left text-xs font-semibold text-slate-200 p-3 border-b border-white/[0.06]">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.key} className="group">
                    <td className="p-3 border-b border-white/[0.03] text-xs font-medium text-slate-400">
                      {m.label}
                    </td>
                    {sortedColumns.map((col) => {
                      const value = col.data?.[m.key];
                      const range = allCountryRanges[m.key];
                      const bg = cellBg(value, range);
                      return (
                        <td key={`${m.key}:${col.id}`} className="p-2 border-b border-white/[0.03]">
                          <div className="rounded-lg px-3 py-2" style={{ background: bg }}>
                            <span className="text-sm font-semibold text-slate-100">{m.fmt(value)}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td className="p-3 border-b border-white/[0.03] text-xs font-medium text-slate-400">Violence type</td>
                  {sortedColumns.map((col) => (
                    <td key={`v:${col.id}`} className="p-2 border-b border-white/[0.03]">
                      <div className="rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-slate-300">
                        {col.data?.primaryViolenceType ?? "—"}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
