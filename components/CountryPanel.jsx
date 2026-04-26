import React, { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import LawCard from "./LawCard.jsx";
import { useAnimatedNumber } from "../hooks/useAnimatedNumber.js";

function likelihoodToPercent(x) {
  return `${(Number(x ?? 0) * 100).toFixed(1)}%`;
}

function strictnessStyles(strictness) {
  const s = (strictness ?? "").toLowerCase();
  if (s === "strict") return { label: "Strict", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20", dot: "bg-emerald-400" };
  if (s === "moderate") return { label: "Moderate", cls: "bg-amber-500/15 text-amber-200 border-amber-500/20", dot: "bg-amber-400" };
  return { label: "Permissive", cls: "bg-rose-500/15 text-rose-200 border-rose-500/20", dot: "bg-rose-400" };
}

/**
 * Severity color for numeric values.
 * severity: "danger" = red glow, "warn" = amber, "safe" = green, "neutral" = default
 */
function getSeverityClasses(severity) {
  if (severity === "danger") return "border-rose-500/20 bg-rose-500/[0.06]";
  if (severity === "warn") return "border-amber-500/20 bg-amber-500/[0.06]";
  if (severity === "safe") return "border-emerald-500/20 bg-emerald-500/[0.06]";
  return "border-white/[0.06] bg-white/[0.03]";
}

function getSeverityTextColor(severity) {
  if (severity === "danger") return "text-rose-300";
  if (severity === "warn") return "text-amber-300";
  if (severity === "safe") return "text-emerald-300";
  return "text-slate-100";
}

function StatCard({ label, value, severity = "neutral", numericValue }) {
  const animated = useAnimatedNumber(numericValue ?? 0, 700, 1);
  const showAnimated = numericValue !== undefined && numericValue !== null;

  return (
    <div className={`rounded-xl px-3 py-2.5 border group hover:brightness-125 transition-all duration-300 ${getSeverityClasses(severity)}`}>
      <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-bold mt-1 tabular-nums ${getSeverityTextColor(severity)}`}>
        {showAnimated ? animated : value}
        {showAnimated && typeof value === "string" && value.includes("/") && <span className="text-xs font-normal text-slate-500"> / 100k</span>}
        {showAnimated && typeof value === "string" && value.includes("%") && <span className="text-xs font-normal text-slate-500">%</span>}
      </div>
    </div>
  );
}

// Historical multiplier for timeline
function getVal(base, activeYear) {
  if (!activeYear || activeYear === 2024 || typeof base !== 'number') return base;
  const diff = 2024 - activeYear;
  return parseFloat((base * (1 + diff * 0.015)).toFixed(1));
}

export default function CountryPanel({
  country,
  citiesForCountry,
  statesForCountry = [],
  globalAvgKeyMetrics,
  activeYear,
  onPin,
  onViewCity,
  onSelectState,
  onClosePanel,
}) {
  const strict = strictnessStyles(country.lawStrictness);
  const [showSubregions, setShowSubregions] = useState(false);

  const hasStates = statesForCountry.length > 0;
  const subregionLabel = hasStates ? "States" : "Cities";
  const subregionList = hasStates ? statesForCountry : citiesForCountry;

  const homVal = getVal(country.homicideRatePer100k, activeYear);
  const fireVal = getVal(country.firearmHomicideRate, activeYear);
  const crimeVal = getVal(country.organizedCrimeIndex, activeYear);
  const gangVal = country.gangRelatedGunDeathsPercent ?? 0;

  const stats = useMemo(
    () => [
      { label: "Homicide rate", value: `${homVal} / 100k`, numericValue: homVal, severity: homVal > 5 ? "danger" : homVal > 2 ? "warn" : "safe" },
      { label: "Firearm homicide", value: `${fireVal} / 100k`, numericValue: fireVal, severity: fireVal > 3 ? "danger" : fireVal > 1 ? "warn" : "safe" },
      { label: "Crime index", value: `${crimeVal}`, numericValue: crimeVal, severity: crimeVal > 5 ? "danger" : crimeVal > 3 ? "warn" : "safe" },
      { label: "Violence type", value: country.primaryViolenceType },
      { label: "Under 25", value: `${country.underAge25Percent.toFixed(0)}%`, numericValue: country.underAge25Percent, severity: country.underAge25Percent > 50 ? "danger" : country.underAge25Percent > 30 ? "warn" : "safe" },
      { label: "Death risk (owner)", value: likelihoodToPercent(country.likelihoodDeathIfOwner) },
      { label: "Incarceration risk", value: likelihoodToPercent(country.likelihoodIncarcerationIfOwner) },
      { label: "Gang-related", value: `${gangVal}%`, numericValue: gangVal, severity: gangVal > 40 ? "danger" : gangVal > 15 ? "warn" : "safe" },
    ],
    [country, activeYear, homVal, fireVal, crimeVal, gangVal]
  );

  const chartData = useMemo(
    () => [
      { metric: "Homicide", country: country.homicideRatePer100k, global: globalAvgKeyMetrics.homicideRatePer100k },
      { metric: "Firearm", country: country.firearmHomicideRate, global: globalAvgKeyMetrics.firearmHomicideRate },
      { metric: "Crime Idx", country: country.organizedCrimeIndex, global: globalAvgKeyMetrics.organizedCrimeIndex },
      { metric: "Under 25%", country: country.underAge25Percent, global: globalAvgKeyMetrics.underAge25Percent },
    ],
    [country, globalAvgKeyMetrics]
  );

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl leading-none">{country.flagEmoji}</div>
            <div>
              <h2 className="text-lg font-semibold text-white">{country.name}</h2>
              <div className="text-xs text-slate-400 mt-0.5">{country.region} · Pop. {(country.population / 1e6).toFixed(1)}M</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${strict.cls} flex items-center gap-1.5`}>
              <span className={`w-1.5 h-1.5 rounded-full ${strict.dot}`} />
              {strict.label}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} severity={s.severity} numericValue={s.numericValue} />
          ))}
        </div>



        {/* Chart: Country vs Global */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-200">vs Global Average</div>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-accent inline-block" /> Country</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-violet-500 inline-block" /> Global</span>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={2}>
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} width={35} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(6,10,20,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#e2e8f0", fontWeight: 600 }}
                  itemStyle={{ color: "#94a3b8" }}
                />
                <Bar dataKey="country" name="Country" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="global" name="Global" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* States or Cities section */}
        {subregionList.length > 0 && (
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <button
              onClick={() => setShowSubregions((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  {hasStates ? (
                    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
                <span className="text-sm font-medium text-slate-200">
                  {subregionLabel} ({subregionList.length})
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showSubregions ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
              >
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: showSubregions ? `${subregionList.length * 80 + 16}px` : "0px", opacity: showSubregions ? 1 : 0 }}
            >
              <div className="px-3 pb-3 space-y-2 max-h-[350px] overflow-y-auto">
                {subregionList.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => hasStates ? onSelectState?.(item.id) : onViewCity?.(item.id)}
                    className="w-full text-left rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2.5 hover:bg-accent/5 hover:border-accent/20 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                        {item.name}
                      </div>
                      <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-accent/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {hasStates
                        ? `${item.lawStrictness} · ${item.homicideRatePer100k}/100k homicide`
                        : `Homicide: ${item.homicideRatePer100k}/100k · ${item.primaryViolenceType}`
                      }
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onPin}
            className="flex-1 rounded-xl bg-accent/10 border border-accent/20 px-3 py-2.5 text-sm font-medium text-accent hover:bg-accent/15 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Pin to Compare
          </button>
        </div>
      </div>
    </div>
  );
}
