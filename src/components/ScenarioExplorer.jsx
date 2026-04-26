import React from "react";

const scenarios = [
  { id: 'gang-crisis', label: 'The Gang Crisis', desc: 'Extreme organized crime or gang-related homicides >50%.', icon: '🔥' },
  { id: 'permissive-risk', label: 'Permissive Risk', desc: 'Permissive gun laws with high homicide rates (>5/100k).', icon: '⚠️' },
  { id: 'safe-havens', label: 'Safe Havens', desc: 'Strict gun laws with very low homicide rates (<2/100k).', icon: '🛡️' },
  { id: 'youth-risk', label: 'Youth at Risk', desc: 'Gun violence victims predominantly under 25 (>50%).', icon: '📉' },
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
  inline,
}) {
  const matches = scenarioCountryIds
    ? countries.filter((c) => scenarioCountryIds.includes(c.id)).slice(0, 20)
    : [];

  // If not inline, use old modal behavior
  if (!inline) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-4xl glass-strong rounded-2xl shadow-glow-strong overflow-hidden animate-scale-in max-h-[85vh] flex flex-col">
          <div className="p-5 border-b border-white/[0.06] flex items-center justify-between gap-3 flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Narrative Lenses</h2>
              <p className="text-xs text-slate-400 mt-1">Select a lens to filter the globe.</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          </div>
          <div className="p-5 overflow-y-auto flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  // Inline mode
  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white">Narrative Lenses</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">Highlight countries by thematic criteria</p>
      </div>
      {renderContent()}
    </div>
  );

  function renderContent() {
    return (
      <div className="space-y-4">
        {/* Lens cards */}
        <div className="space-y-2">
          {scenarios.map(s => {
            const isActive = activeScenario === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onChange(isActive ? null : s.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group ${
                  isActive 
                    ? 'bg-accent/15 border-accent/40 shadow-glow' 
                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`text-lg ${isActive ? 'scale-110' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'} transition-all`}>{s.icon}</div>
                  <div className="min-w-0">
                    <div className={`text-xs font-semibold transition-colors ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{s.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{s.desc}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Results */}
        {scenarioCountryIds && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Matches</span>
              <span className="px-2 py-0.5 rounded-full bg-accent/20 border border-accent/30 text-[10px] text-accent font-medium">{scenarioCountryIds.length}</span>
            </div>
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {matches.map((c) => (
                <div key={c.id} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 hover:bg-accent/5 hover:border-accent/20 transition-all duration-200 group">
                  <div className="flex items-center justify-between gap-2">
                    <button onClick={() => onSelectCountry(c.id)} className="text-left flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors flex items-center gap-1.5">
                        <span>{c.flagEmoji}</span> <span>{c.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {c.homicideRatePer100k.toFixed(1)}/100k · {c.lawStrictness}
                      </div>
                    </button>
                    <button
                      onClick={() => onPin(c.id)}
                      className="text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition flex-shrink-0"
                    >
                      Pin
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!scenarioCountryIds && (
          <div className="flex flex-col items-center justify-center py-8 opacity-50">
            <svg className="w-10 h-10 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-xs text-slate-400 text-center">Select a lens above to highlight<br/>matching countries on the globe.</p>
          </div>
        )}
      </div>
    );
  }
}
