import React from "react";

export default function CityPanel({ city, country, onDismiss, onPin, onClosePanel }) {
  const nationalAvg = country.homicideRatePer100k;
  const cityRate = city.homicideRatePer100k;
  const ratio = nationalAvg > 0 ? Math.min(2, cityRate / nationalAvg) : 0;
  const isAboveAvg = ratio > 1;

  return (
    <div className="h-full w-full rounded-2xl glass shadow-glow overflow-hidden flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">{city.name}</h2>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-base leading-none">{country.flagEmoji}</span>
              {country.name} · Pop. {(city.population / 1e6).toFixed(1)}M
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDismiss}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition font-medium text-slate-300"
            >
              ← Back
            </button>
            <button
              onClick={onClosePanel}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center"
              title="Close"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Homicide</div>
            <div className="text-sm font-semibold text-slate-100 mt-1">{city.homicideRatePer100k.toFixed(1)} / 100k</div>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Firearm</div>
            <div className="text-sm font-semibold text-slate-100 mt-1">{city.firearmHomicideRate.toFixed(1)} / 100k</div>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Violence type</div>
            <div className="text-sm font-semibold text-slate-100 mt-1">{city.primaryViolenceType}</div>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Under 25</div>
            <div className="text-sm font-semibold text-slate-100 mt-1">{city.underAge25Percent.toFixed(0)}%</div>
          </div>
        </div>

        {/* City vs National comparison */}
        <div className={`rounded-xl border px-4 py-3 ${
          isAboveAvg
            ? "bg-rose-500/[0.08] border-rose-500/20"
            : "bg-emerald-500/[0.08] border-emerald-500/20"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-200">City vs National</div>
            <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isAboveAvg ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
            }`}>
              {isAboveAvg ? `${((ratio - 1) * 100).toFixed(0)}% above` : `${((1 - ratio) * 100).toFixed(0)}% below`}
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
            <span>City: <strong className="text-slate-200">{cityRate.toFixed(1)}</strong>/100k</span>
            <span>National: <strong className="text-slate-200">{nationalAvg.toFixed(1)}</strong>/100k</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAboveAvg ? "bg-rose-500/60" : "bg-emerald-500/60"
              }`}
              style={{ width: `${Math.min(100, Math.round(ratio * 50))}%` }}
            />
          </div>
        </div>

        {/* Context */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-accent/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-sm font-medium text-slate-200">Context</div>
          </div>
          <p className="text-xs leading-relaxed text-slate-300/90">{city.context}</p>
        </div>

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

        <p className="text-[11px] text-slate-600">
          City values are based on the dataset bundled with this dashboard.
        </p>
      </div>
    </div>
  );
}
