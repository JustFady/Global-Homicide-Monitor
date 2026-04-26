import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function strictnessScore(s) {
  const v = (s ?? "").toLowerCase();
  if (v === "strict") return 2;
  if (v === "moderate") return 1;
  return 0;
}

function metricValue(country, metricKey) {
  if (metricKey === "lawStrictnessScore") return strictnessScore(country.lawStrictness);
  return Number(country[metricKey] ?? 0);
}

export default function ChartPanel({ countries, cities, onClose, onPin, inline }) {
  const regions = useMemo(() => ["All", ...Array.from(new Set(countries.map((c) => c.region))).sort()], [countries]);
  const lawValues = useMemo(() => ["All", ...Array.from(new Set(countries.map((c) => c.lawStrictness))).sort()], [countries]);
  const violTypes = useMemo(() => ["All", ...Array.from(new Set(countries.map((c) => c.primaryViolenceType))).sort()], [countries]);

  const [region, setRegion] = useState("All");
  const [lawStrictness, setLawStrictness] = useState("All");
  const [violenceType, setViolenceType] = useState("All");
  const [metricKey, setMetricKey] = useState("homicideRatePer100k");
  const [sortDir, setSortDir] = useState("desc");

  const filtered = useMemo(() => {
    return countries
      .filter((c) => region === "All" || c.region === region)
      .filter((c) => lawStrictness === "All" || c.lawStrictness === lawStrictness)
      .filter((c) => violenceType === "All" || c.primaryViolenceType === violenceType);
  }, [countries, region, lawStrictness, violenceType]);

  const ranked = useMemo(() => {
    return filtered
      .map((c) => ({ ...c, metric: metricValue(c, metricKey) }))
      .sort((a, b) => (sortDir === "asc" ? a.metric - b.metric : b.metric - a.metric))
      .slice(0, 15);
  }, [filtered, metricKey, sortDir]);

  const chartData = useMemo(() => ranked.map((c) => ({ id: c.id, name: c.name, metric: c.metric })), [ranked]);

  const metricLabels = {
    homicideRatePer100k: "Homicide rate (/100k)",
    firearmHomicideRate: "Firearm homicide (/100k)",
    organizedCrimeIndex: "Organized Crime Index",
    lawStrictnessScore: "Law strictness (0→2)",
    underAge25Percent: "% under 25",
  };
  const metricLabel = metricLabels[metricKey] ?? "Metric";

  function CustomTooltip({ active, payload }) {
    if (!active || !payload?.[0]) return null;
    const p = payload[0].payload;
    const c = countries.find((x) => x.id === p.id);
    if (!c) return null;
    return (
      <div className="rounded-xl glass-strong shadow-glow p-3 max-w-[260px] text-xs">
        <div className="text-sm font-semibold text-white mb-1">{c.flagEmoji} {c.name}</div>
        <div className="text-slate-400">
          {metricLabel}: <span className="text-white font-semibold">{Number(p.metric).toFixed(1)}</span>
        </div>
        <div className="mt-2 space-y-0.5 text-slate-400">
          <div>Homicide: {c.homicideRatePer100k.toFixed(1)}/100k</div>
          <div>Firearm: {c.firearmHomicideRate.toFixed(1)}/100k</div>
          <div>Crime Index: {c.organizedCrimeIndex.toFixed(1)}</div>
        </div>
      </div>
    );
  }

  function FilterSelect({ label, value, options, onChange }) {
    return (
      <div>
        <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-300"
        >
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className={inline ? "p-4 space-y-4" : "w-full h-full rounded-2xl glass shadow-glow overflow-hidden flex flex-col animate-slide-up"}>
      {/* Header (only for non-inline) */}
      {!inline && (
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between gap-3 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-white">Charts</h2>
            <p className="text-xs text-slate-500">Ranked comparison across {filtered.length} countries</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
          </button>
        </div>
      )}

      {/* Inline title */}
      {inline && (
        <div>
          <h3 className="text-sm font-semibold text-white">Country Rankings</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Comparing {filtered.length} countries</p>
        </div>
      )}

      {/* Filters */}
      <div className={inline ? "rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-2" : "flex-1 overflow-auto p-4 lg:grid lg:grid-cols-[220px_1fr] gap-4"}>
        {inline ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              <FilterSelect label="Region" value={region} options={regions} onChange={setRegion} />
              <FilterSelect label="Law" value={lawStrictness} options={lawValues} onChange={setLawStrictness} />
              <FilterSelect label="Violence" value={violenceType} options={violTypes} onChange={setViolenceType} />
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-3 h-fit mb-4 lg:mb-0">
            <div className="text-xs font-semibold text-slate-300">Filters</div>
            <FilterSelect label="Region" value={region} options={regions} onChange={setRegion} />
            <FilterSelect label="Law strictness" value={lawStrictness} options={lawValues} onChange={setLawStrictness} />
            <FilterSelect label="Violence type" value={violenceType} options={violTypes} onChange={setViolenceType} />
          </div>
        )}
      </div>

      {/* Metric picker + chart */}
      <div className={inline ? "rounded-xl bg-white/[0.03] border border-white/[0.06] p-3" : "rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 flex flex-col"}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-slate-500">Rank by</span>
            <select value={metricKey} onChange={(e) => setMetricKey(e.target.value)} className="bg-white/5 border border-white/[0.08] rounded-lg px-2 py-1 text-[11px] text-slate-300">
              {Object.entries(metricLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))} className="rounded-lg bg-white/5 border border-white/[0.08] px-2 py-1 text-[10px] hover:bg-white/10 transition text-slate-400">
            {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>
        <div className={inline ? "h-[300px]" : "flex-1 min-h-[280px]"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} interval={0} angle={-45} textAnchor="end" height={80} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#475569" }} axisLine={false} tickLine={false} width={35} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="metric" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-[10px] text-slate-600 mt-2">Top {chartData.length} · {metricLabel}</div>
      </div>
    </div>
  );
}

