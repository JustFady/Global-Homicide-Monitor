import React from "react";

const scenarios = [
  { id: 'gang-crisis', label: 'The Gang Crisis', desc: 'Countries with extreme organized crime index or where gang-related homicides exceed 50%.', icon: '🔥' },
  { id: 'permissive-risk', label: 'Permissive Risk', desc: 'Countries with permissive gun laws that suffer from high homicide rates (>5/100k).', icon: '⚠️' },
  { id: 'safe-havens', label: 'Safe Havens', desc: 'Countries combining strict gun laws with incredibly low homicide rates (<2/100k).', icon: '🛡️' },
  { id: 'youth-risk', label: 'Youth at Risk', desc: 'Nations where victims of gun violence are predominantly under the age of 25 (>50%).', icon: '📉' },
];

export default function ScenarioExplorer({
  open,
  onClose,
  activeScenario,
  onChange,
  countries,
  scenarioCountryIds,
  onPin,
  onSelectCountry,
}) {
  const matches = scenarioCountryIds
    ? countries.filter((c) => scenarioCountryIds.includes(c.id)).slice(0, 12)
    : [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl glass-strong rounded-2xl shadow-glow-strong overflow-hidden animate-scale-in max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between gap-3 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Narrative Lenses</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a lens to filter the globe and discover compelling global trends.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto flex-1">
          {/* Lenses */}
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Available Lenses</div>
            {scenarios.map(s => {
              const isActive = activeScenario === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onChange(isActive ? null : s.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group ${
                    isActive 
                      ? 'bg-accent/15 border-accent/40 shadow-glow' 
                      : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl ${isActive ? 'scale-110' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'} transition-all`}>{s.icon}</div>
                    <div>
                      <div className={`text-sm font-semibold transition-colors ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{s.label}</div>
                      <div className="text-xs text-slate-500 mt-1">{s.desc}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Results */}
          <div className="rounded-xl bg-black/20 border border-white/[0.04] p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0 border-b border-white/[0.04] pb-3">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Highlighted Nations</div>
              {scenarioCountryIds && (
                <div className="px-2 py-0.5 rounded-full bg-accent/20 border border-accent/30 text-xs text-accent font-medium">{scenarioCountryIds.length} matches</div>
              )}
            </div>

            {!scenarioCountryIds ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                <svg className="w-12 h-12 text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm text-slate-400">Select a lens to reveal countries<br/>that match the criteria.</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-slate-500 text-center">No countries match this lens entirely.</p>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto flex-1 max-h-[380px] pr-2 custom-scrollbar">
                {matches.map((c) => (
                  <div key={c.id} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 hover:bg-accent/10 hover:border-accent/20 transition-all duration-200 group">
                    <div className="flex items-center justify-between gap-3">
                      <button onClick={() => { onSelectCountry(c.id); onClose(); }} className="text-left flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors flex items-center gap-2">
                          <span>{c.flagEmoji}</span> <span>{c.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 truncate">
                          Homicide {c.homicideRatePer100k.toFixed(1)}/100k · Crime Idx {c.organizedCrimeIndex.toFixed(1)} · {c.lawStrictness}
                        </div>
                      </button>
                      <button
                        onClick={() => onPin(c.id)}
                        className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-md bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 hover:text-white transition flex-shrink-0"
                      >
                        Pin
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
