import React, { useState } from "react";
import LawCard from "./LawCard.jsx";

// Historical multiplier for timeline
function getVal(base, activeYear) {
  if (!activeYear || activeYear === 2024 || typeof base !== 'number') return base;
  const diff = 2024 - activeYear;
  return parseFloat((base * (1 + diff * 0.015)).toFixed(1));
}

function strictnessStyles(strictness) {
  const s = (strictness ?? "").toLowerCase();
  if (s === "strict") return { label: "Strict", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20", dot: "bg-emerald-400" };
  if (s === "moderate") return { label: "Moderate", cls: "bg-amber-500/15 text-amber-200 border-amber-500/20", dot: "bg-amber-400" };
  return { label: "Permissive", cls: "bg-rose-500/15 text-rose-200 border-rose-500/20", dot: "bg-rose-400" };
}

export default function StatePanel({ stateData, citiesForState, activeYear, onBack, onPin, onViewCity, onClosePanel }) {
  const [showCities, setShowCities] = useState(false);

  if (!stateData) return null;

  const homRate = getVal(stateData.homicideRatePer100k, activeYear);
  const faRate = getVal(stateData.firearmHomicideRate, activeYear);
  const strict = strictnessStyles(stateData.lawStrictness);

  const getSeverityColor = (rate) => {
    if (rate < 2.5) return "text-safe";
    if (rate < 5) return "text-warn";
    return "text-danger";
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="p-5 border-b border-white/5 relative shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                🇺🇸 {stateData.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[11px] text-accent font-medium">UNITED STATES</p>
                <div className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${strict.cls} flex items-center gap-1`}>
                  <span className={`w-1 h-1 rounded-full ${strict.dot}`} />
                  {strict.label}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onPin} className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/10 transition-colors group cursor-pointer" title="Pin to Compare">
              <svg className="w-4 h-4 text-slate-300 group-hover:text-accent group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-4">
        {/* Context */}
        <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-accent/40 pl-3 italic">"{stateData.context}"</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Homicides</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold tracking-tight ${getSeverityColor(homRate)}`}>{homRate}</span>
              <span className="text-[10px] text-slate-500 font-medium">/ 100k</span>
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Firearm Related</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white tracking-tight">{faRate}</span>
              <span className="text-[10px] text-slate-500 font-medium">/ 100k</span>
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Crime Index</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white tracking-tight">{getVal(stateData.organizedCrimeIndex, activeYear)}</span>
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Under 25</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white tracking-tight">{stateData.underAge25Percent}%</span>
            </div>
          </div>
        </div>

        <LawCard lawSummary={stateData.lawSummary} severity={stateData.lawStrictness} />

        {/* Cities section */}
        {citiesForState.length > 0 && (
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <button
              onClick={() => setShowCities(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm font-medium text-slate-200">
                  Cities ({citiesForState.length})
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showCities ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
              >
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: showCities ? `${citiesForState.length * 70 + 16}px` : "0px", opacity: showCities ? 1 : 0 }}
            >
              <div className="px-3 pb-3 space-y-2 max-h-[300px] overflow-y-auto">
                {citiesForState.map((ct) => (
                  <button
                    key={ct.id}
                    onClick={() => onViewCity(ct.id)}
                    className="w-full text-left p-3 rounded-xl bg-slate-900/40 border border-white/5 hover:border-accent/30 hover:bg-accent/5 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-white">{ct.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {getVal(ct.homicideRatePer100k, activeYear)} / 100k · {ct.primaryViolenceType}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-slate-500 group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
